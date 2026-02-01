/* eslint-disable @typescript-eslint/dot-notation, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RingController } from '../RingController';
import type { RingControllerConfig, RingDeviceData } from '../RingController';

// Mock Apollo client
function createMockApolloClient(devices: Partial<RingDeviceData>[] = []) {
  return {
    query: vi.fn().mockResolvedValue({
      data: {
        ringDevices: devices.map((d) => ({
          deviceId: d.deviceId ?? 'dev-1',
          deviceType: d.deviceType ?? 'contact_sensor',
          name: d.name ?? 'Front Door',
          location: d.location ?? 'Entryway',
          ...d,
        })),
      },
    }),
    mutate: vi.fn().mockResolvedValue({
      data: {
        batchUpdateRingDevices: {
          success: true,
          devicesUpdated: 0,
          devicesCreated: 0,
          message: 'ok',
        },
      },
    }),
  } as unknown as RingControllerConfig['apolloClient'];
}

// Stub EventSource globally
class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 0;
  close = vi.fn();
}

describe('RingController', () => {
  let controller: RingController;

  beforeEach(() => {
    // Reset singleton
    RingController['instance'] = null;
    // Stub EventSource
    vi.stubGlobal('EventSource', MockEventSource);
    // Stub fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, devices: [] }),
    }));
  });

  afterEach(() => {
    controller?.destroy();
    vi.restoreAllMocks();
  });

  it('requires config on first getInstance call', () => {
    expect(() => RingController.getInstance()).toThrow('config required');
  });

  it('returns singleton instance', () => {
    const client = createMockApolloClient();
    const a = RingController.getInstance({ apolloClient: client });
    const b = RingController.getInstance();
    expect(a).toBe(b);
  });

  describe('loadDevicesFromDb preserves live state', () => {
    it('preserves battery/status from previous cache on reload', async () => {
      const client = createMockApolloClient([
        { deviceId: 'dev-1', name: 'Door' },
      ]);

      controller = RingController.getInstance({ apolloClient: client });

      // First load
      await controller['loadDevicesFromDb']();
      expect(controller.getDevices()).toHaveLength(1);
      expect(controller.getDevice('dev-1')?.batteryLevel).toBeNull();

      // Simulate live state injection
      controller['devices'].set('dev-1', {
        ...controller.getDevice('dev-1')!,
        batteryLevel: 85,
        status: 'closed',
      });

      // Reload from DB — live state should be preserved
      await controller['loadDevicesFromDb']();
      const device = controller.getDevice('dev-1');
      expect(device?.batteryLevel).toBe(85);
      expect(device?.status).toBe('closed');
    });
  });

  describe('handleDeviceUpdate', () => {
    it('merges update into existing device', async () => {
      const client = createMockApolloClient([
        { deviceId: 'dev-1', name: 'Door' },
      ]);

      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      const listener = vi.fn();
      controller.subscribe(listener);

      controller['handleDeviceUpdate']({
        deviceId: 'dev-1',
        status: 'open',
        batteryLevel: 72,
        timestamp: '2024-06-15T12:00:00Z',
      });

      const device = controller.getDevice('dev-1');
      expect(device?.status).toBe('open');
      expect(device?.batteryLevel).toBe(72);
      expect(device?.lastUpdate).toBe('2024-06-15T12:00:00Z');
      expect(listener).toHaveBeenCalledOnce();
    });

    it('ignores update with no deviceId', async () => {
      const client = createMockApolloClient([{ deviceId: 'dev-1' }]);
      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      const listener = vi.fn();
      controller.subscribe(listener);

      controller['handleDeviceUpdate']({});
      expect(listener).not.toHaveBeenCalled();
    });

    it('preserves existing fields when update is partial', async () => {
      const client = createMockApolloClient([{ deviceId: 'dev-1' }]);
      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      // Set initial state
      controller['devices'].set('dev-1', {
        ...controller.getDevice('dev-1')!,
        batteryLevel: 90,
        status: 'closed',
      });

      // Partial update — only status changes
      controller['handleDeviceUpdate']({
        deviceId: 'dev-1',
        status: 'open',
      });

      const device = controller.getDevice('dev-1');
      expect(device?.status).toBe('open');
      expect(device?.batteryLevel).toBe(90); // preserved
    });
  });

  describe('fetchLiveDeviceState', () => {
    it('merges API data into cached devices', async () => {
      const client = createMockApolloClient([
        { deviceId: 'dev-1', name: 'Door' },
        { deviceId: 'dev-2', name: 'Window' },
      ]);

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          devices: [
            { deviceId: 'dev-1', status: 'closed', batteryLevel: 95, lastUpdate: '2024-06-15T12:00:00Z' },
            { deviceId: 'dev-3', deviceType: 'motion', name: 'Hallway', location: 'Hall', status: 'idle', batteryLevel: 60, lastUpdate: '2024-06-15T12:00:00Z' },
          ],
        }),
      }));

      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      const listener = vi.fn();
      controller.subscribe(listener);

      await controller['fetchLiveDeviceState']();

      // dev-1 should have merged live state
      expect(controller.getDevice('dev-1')?.status).toBe('closed');
      expect(controller.getDevice('dev-1')?.batteryLevel).toBe(95);

      // dev-2 not in API response — no live state
      expect(controller.getDevice('dev-2')?.status).toBeNull();

      // dev-3 was in API but not DB — added to cache
      expect(controller.getDevice('dev-3')?.name).toBe('Hallway');

      expect(listener).toHaveBeenCalled();
    });

    it('handles fetch failure gracefully', async () => {
      const client = createMockApolloClient([{ deviceId: 'dev-1' }]);
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      // Should not throw
      await controller['fetchLiveDeviceState']();
      expect(controller.getDevice('dev-1')?.status).toBeNull();
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('unsubscribe stops notifications', async () => {
      const client = createMockApolloClient([{ deviceId: 'dev-1' }]);
      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      const listener = vi.fn();
      const unsub = controller.subscribe(listener);

      controller['notifyListeners']();
      expect(listener).toHaveBeenCalledOnce();

      unsub();
      controller['notifyListeners']();
      expect(listener).toHaveBeenCalledOnce(); // not called again
    });
  });

  describe('destroy', () => {
    it('clears all state and resets singleton', async () => {
      const client = createMockApolloClient([{ deviceId: 'dev-1' }]);
      controller = RingController.getInstance({ apolloClient: client });
      await controller['loadDevicesFromDb']();

      controller.destroy();

      expect(controller.getDevices()).toHaveLength(0);
      expect(RingController['instance']).toBeNull();
    });
  });
});
