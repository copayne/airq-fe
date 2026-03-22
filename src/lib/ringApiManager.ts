/**
 * RingApiManager - Singleton service for managing Ring API connections
 *
 * This service handles:
 * - Centralized RingApi instance management (survives Next.js HMR via globalThis)
 * - Automatic token refresh persistence to .ring-token file
 * - Token status tracking (connected/expired/error/disconnected)
 * - Manual token update for recovery from expired tokens
 * - 24-hour keepalive to prevent token expiration from inactivity
 */

import { RingApi } from 'ring-client-api';
import fs from 'fs';
import path from 'path';

// Token storage: use /app/data in production (volume-mounted), project root in dev
const DATA_DIR = path.join(process.cwd(), 'data');
const TOKEN_FILE_PATH = path.join(DATA_DIR, '.ring-token');

// Environment variable name for initial token
const RING_TOKEN_ENV_VAR = 'NEXT_PUBLIC_RING_REFRESH_TOKEN';

// Keepalive interval: 24 hours in ms
const KEEPALIVE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Use globalThis to survive Next.js HMR in dev mode
const GLOBAL_KEY = '__ringApiManager';
declare global {
  // eslint-disable-next-line no-var
  var __ringApiManager: RingApiManager | undefined;
}

interface TokenUpdateEvent {
  oldRefreshToken?: string;
  newRefreshToken: string;
}

export type RingConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'expired' | 'error';

export interface RingStatusInfo {
  status: RingConnectionStatus;
  error?: string;
  lastRefresh?: string;
}

class RingApiManager {
  private ringApi: RingApi | null = null;
  private currentToken: string | null = null;
  private initPromise: Promise<RingApi> | null = null;
  private status: RingConnectionStatus = 'disconnected';
  private lastError: string | null = null;
  private lastRefresh: string | null = null;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): RingApiManager {
    if (!globalThis[GLOBAL_KEY]) {
      globalThis[GLOBAL_KEY] = new RingApiManager();
    }
    return globalThis[GLOBAL_KEY];
  }

  private readToken(): string {
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        const fileToken = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8').trim();
        if (fileToken) {
          console.log('[RingApiManager] Using token from file');
          return fileToken;
        }
      }
    } catch (error) {
      console.warn('[RingApiManager] Failed to read token file:', error);
    }

    const envToken = process.env[RING_TOKEN_ENV_VAR];
    if (!envToken) {
      throw new Error(
        `Ring refresh token not found. Set ${RING_TOKEN_ENV_VAR} environment variable or create ${TOKEN_FILE_PATH}`
      );
    }

    console.log('[RingApiManager] Using token from environment variable');
    return envToken;
  }

  private persistToken(token: string): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(TOKEN_FILE_PATH, token, 'utf-8');
      console.log('[RingApiManager] Token persisted to file');
    } catch (error) {
      console.error('[RingApiManager] Failed to persist token:', error);
    }
  }

  private handleTokenRefresh(event: TokenUpdateEvent): void {
    console.log('[RingApiManager] Token refreshed by Ring API');
    this.currentToken = event.newRefreshToken;
    this.lastRefresh = new Date().toISOString();
    this.persistToken(event.newRefreshToken);
  }

  private startKeepalive(): void {
    if (this.keepaliveTimer) return;

    this.keepaliveTimer = setInterval(() => {
      if (!this.ringApi) return;

      console.log('[RingApiManager] Keepalive: refreshing Ring connection...');
      this.ringApi.getLocations()
        .then((locations) => {
          console.log(`[RingApiManager] Keepalive success: ${locations.length} location(s)`);
        })
        .catch((error) => {
          console.error('[RingApiManager] Keepalive failed:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Refresh token is not valid')) {
            this.status = 'expired';
            this.lastError = errorMessage;
            this.ringApi = null;
            this.initPromise = null;
            this.stopKeepalive();
          }
        });
    }, KEEPALIVE_INTERVAL_MS);
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
  }

  async getApi(): Promise<RingApi> {
    if (this.ringApi) {
      return this.ringApi;
    }

    // Don't retry when token is expired or errored — wait for manual update via UI
    if (this.status === 'expired' || this.status === 'error') {
      throw new Error(
        this.status === 'expired'
          ? 'Ring refresh token is expired. Update token via Settings > Integrations.'
          : `Ring API error: ${this.lastError ?? 'Unknown error'}. Update token via Settings > Integrations.`
      );
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeApi();
    return this.initPromise;
  }

  private async initializeApi(): Promise<RingApi> {
    try {
      this.status = 'connecting';
      this.currentToken = this.readToken();

      console.log('[RingApiManager] Initializing Ring API...');

      this.ringApi = new RingApi({
        refreshToken: this.currentToken,
      });

      this.ringApi.restClient.onRefreshTokenUpdated.subscribe({
        next: (event: TokenUpdateEvent) => {
          this.handleTokenRefresh(event);
        },
        error: (error: Error) => {
          console.error('[RingApiManager] Token refresh subscription error:', error);
        },
      });

      const locations = await this.ringApi.getLocations();
      console.log(`[RingApiManager] Connected successfully. Found ${locations.length} location(s)`);

      this.status = 'connected';
      this.lastError = null;
      this.startKeepalive();

      return this.ringApi;
    } catch (error) {
      this.ringApi = null;
      this.initPromise = null;

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.lastError = errorMessage;

      if (errorMessage.includes('Refresh token is not valid')) {
        this.status = 'expired';
      } else {
        this.status = 'error';
      }

      console.error('[RingApiManager] Failed to initialize Ring API:', error);
      throw error;
    }
  }

  getStatus(): RingStatusInfo {
    const info: RingStatusInfo = { status: this.status };
    if (this.lastError) info.error = this.lastError;
    if (this.lastRefresh) info.lastRefresh = this.lastRefresh;
    return info;
  }

  hasToken(): boolean {
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        const token = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8').trim();
        return token.length > 0;
      }
    } catch { /* ignore */ }
    return !!process.env[RING_TOKEN_ENV_VAR];
  }

  async updateToken(newToken: string): Promise<RingStatusInfo> {
    console.log('[RingApiManager] Updating token...');

    this.persistToken(newToken);

    if (this.ringApi) {
      try {
        this.ringApi.disconnect();
      } catch (e) {
        console.warn('[RingApiManager] Error disconnecting old API:', e);
      }
    }

    this.ringApi = null;
    this.initPromise = null;
    this.currentToken = null;
    this.lastError = null;
    this.status = 'disconnected';
    this.stopKeepalive();

    try {
      await this.getApi();
      return this.getStatus();
    } catch {
      return this.getStatus();
    }
  }

  isConnected(): boolean {
    return this.ringApi !== null;
  }

  destroy(): void {
    this.stopKeepalive();
    if (this.ringApi) {
      try {
        this.ringApi.disconnect();
      } catch { /* ignore */ }
    }
    this.ringApi = null;
    this.initPromise = null;
    this.currentToken = null;
    console.log('[RingApiManager] Instance destroyed');
  }
}

export async function getRingApi(): Promise<RingApi> {
  return RingApiManager.getInstance().getApi();
}

export { RingApiManager };
