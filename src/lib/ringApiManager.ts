/**
 * RingApiManager - Singleton service for managing Ring API connections
 *
 * This service handles:
 * - Centralized RingApi instance management
 * - Automatic token refresh persistence
 * - Token storage in a file for persistence across restarts
 *
 * When the Ring library refreshes a token internally, this manager
 * persists the new token to disk so it survives server restarts.
 */

import { RingApi } from 'ring-client-api';
import fs from 'fs';
import path from 'path';

// Token storage file location (in project root, gitignored)
const TOKEN_FILE_PATH = path.join(process.cwd(), '.ring-token');

// Environment variable name for initial token
const RING_TOKEN_ENV_VAR = 'NEXT_PUBLIC_RING_REFRESH_TOKEN';

interface TokenUpdateEvent {
  oldRefreshToken?: string;
  newRefreshToken: string;
}

class RingApiManager {
  private static instance: RingApiManager | null = null;
  private ringApi: RingApi | null = null;
  private currentToken: string | null = null;
  private initPromise: Promise<RingApi> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance of RingApiManager
   */
  static getInstance(): RingApiManager {
    if (!RingApiManager.instance) {
      RingApiManager.instance = new RingApiManager();
    }
    return RingApiManager.instance;
  }

  /**
   * Read the refresh token from file, falling back to environment variable
   */
  private readToken(): string {
    // First, try to read from the token file (most recent token)
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

    // Fall back to environment variable
    const envToken = process.env[RING_TOKEN_ENV_VAR];
    if (!envToken) {
      throw new Error(
        `Ring refresh token not found. Set ${RING_TOKEN_ENV_VAR} environment variable or create ${TOKEN_FILE_PATH}`
      );
    }

    console.log('[RingApiManager] Using token from environment variable');
    return envToken;
  }

  /**
   * Persist the refresh token to file for future use
   */
  private persistToken(token: string): void {
    try {
      fs.writeFileSync(TOKEN_FILE_PATH, token, 'utf-8');
      console.log('[RingApiManager] Token persisted to file');
    } catch (error) {
      console.error('[RingApiManager] Failed to persist token:', error);
    }
  }

  /**
   * Handle token refresh events from the Ring API
   */
  private handleTokenRefresh(event: TokenUpdateEvent): void {
    console.log('[RingApiManager] Token refreshed by Ring API');
    this.currentToken = event.newRefreshToken;
    this.persistToken(event.newRefreshToken);
  }

  /**
   * Initialize or get the RingApi instance
   *
   * This method ensures only one RingApi instance exists and properly
   * subscribes to token refresh events.
   */
  async getApi(): Promise<RingApi> {
    // If we already have an initialized API, return it
    if (this.ringApi) {
      return this.ringApi;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this.initializeApi();
    return this.initPromise;
  }

  /**
   * Internal initialization logic
   */
  private async initializeApi(): Promise<RingApi> {
    try {
      this.currentToken = this.readToken();

      console.log('[RingApiManager] Initializing Ring API...');

      this.ringApi = new RingApi({
        refreshToken: this.currentToken,
      });

      // Subscribe to token refresh events
      // The ring-client-api uses RxJS ReplaySubject, so we need to subscribe
      this.ringApi.restClient.onRefreshTokenUpdated.subscribe({
        next: (event: TokenUpdateEvent) => {
          this.handleTokenRefresh(event);
        },
        error: (error: Error) => {
          console.error('[RingApiManager] Token refresh subscription error:', error);
        },
      });

      // Verify the connection by fetching locations
      const locations = await this.ringApi.getLocations();
      console.log(`[RingApiManager] Connected successfully. Found ${locations.length} location(s)`);

      return this.ringApi;
    } catch (error) {
      // Reset state on failure
      this.ringApi = null;
      this.initPromise = null;

      console.error('[RingApiManager] Failed to initialize Ring API:', error);
      throw error;
    }
  }

  /**
   * Force re-initialization with a new token
   *
   * Use this when you know the token has been updated externally
   * (e.g., after running the ring-auth-cli)
   */
  async reinitialize(): Promise<RingApi> {
    console.log('[RingApiManager] Reinitializing Ring API...');

    // Clean up existing instance
    this.ringApi = null;
    this.initPromise = null;

    return this.getApi();
  }

  /**
   * Get the current refresh token (for debugging/status)
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if the manager has an active API connection
   */
  isInitialized(): boolean {
    return this.ringApi !== null;
  }

  /**
   * Destroy the current instance (useful for cleanup)
   */
  destroy(): void {
    this.ringApi = null;
    this.initPromise = null;
    this.currentToken = null;
    console.log('[RingApiManager] Instance destroyed');
  }
}

// Export a convenient function to get the Ring API
export async function getRingApi(): Promise<RingApi> {
  return RingApiManager.getInstance().getApi();
}

// Export the manager for advanced usage
export { RingApiManager };
