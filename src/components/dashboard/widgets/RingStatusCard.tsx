/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Battery, Clock, DoorClosed, DoorOpen, Shield, ShieldCheck, WifiOff } from "lucide-react";
import Image from 'next/image';
import { memo } from "react";
import { useRing } from "~/context/RingContext";
import { useRingSnapshot } from '~/hooks/useRingSnapshot';
import type { RingDeviceData } from "~/services/RingController";
import { getRelativeTime, formatShortDateTime } from "~/utils/dateUtils";

type RingStatusCardProps = {
  deviceId?: string;
  cameraName?: string;
};

function formatTimeAgo(timestamp: string | null): string {
  return getRelativeTime(timestamp, "Never");
}

function formatTimestamp(timestamp: string) {
  return formatShortDateTime(timestamp);
}

function SensorStatus({ device }: { device: RingDeviceData }) {
  const isOpen = device.status === "open";
  const isOffline = !device.lastUpdate;

  const statusClasses = isOffline
    ? "bg-gray-100"
    : isOpen
      ? "bg-red-50"
      : "bg-green-50";

  const iconClasses = isOffline
    ? "text-gray-400"
    : isOpen
      ? "text-red-600"
      : "text-green-600";

  const textClasses = isOffline
    ? "text-gray-600"
    : isOpen
      ? "text-red-700"
      : "text-green-700";

  const batteryColor =
    device.batteryLevel === null
      ? "text-gray-400"
      : device.batteryLevel > 50
        ? "text-green-600"
        : device.batteryLevel > 20
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <div className={`flex items-center justify-between border-[1px] border-airq-dark px-2 py-1 ${statusClasses}`}>
      <div className="flex items-center gap-1.5">
        {isOffline ? (
          <WifiOff className={`h-4 w-4 ${iconClasses}`} />
        ) : isOpen ? (
          <DoorOpen className={`h-4 w-4 ${iconClasses}`} />
        ) : (
          <DoorClosed className={`h-4 w-4 ${iconClasses}`} />
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-airq-dark truncate">
            {device.name}
          </span>
          <span className={`text-[9px] ${textClasses}`}>
            {isOffline ? "OFFLINE" : isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
          <Clock className="h-2.5 w-2.5" />
          <span>{formatTimeAgo(device.lastUpdate)}</span>
        </div>
        {device.batteryLevel !== null && (
          <div className="flex items-center gap-0.5">
            <Battery className={`h-3 w-3 ${batteryColor}`} />
            <span className={`text-[9px] ${batteryColor}`}>
              {device.batteryLevel}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RingStatusCard({ deviceId, cameraName = 'Ring Camera' }: RingStatusCardProps) {
  const { devices } = useRing();
  const { snapshot, error, capturing, captureSnapshot } = useRingSnapshot(deviceId, { captureOnMount: true });

  const contactSensors = devices.filter(
    (device: RingDeviceData) => device.deviceType === "contact_sensor" ||
                                (device.deviceType?.includes("contact") ?? false)
  );

  // TODO: Get actual alarm status from Ring API
  const isArmed = false; // Placeholder for security system status
  const imageUrl = snapshot?.imageUrl ?? '';

  return (
    <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col bg-airq-light">
      <div className="flex-1 overflow-auto">
        {/* Camera snapshot section */}
        {deviceId && (
          <div className="border-b-[1px] border-airq-dark">
            {!snapshot && !capturing && (
              <div className="aspect-video flex items-center justify-center bg-airq-light">
                <button
                  onClick={() => captureSnapshot()}
                  disabled={capturing}
                  className="px-2 py-1 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 text-[10px]"
                >
                  Capture Snapshot
                </button>
              </div>
            )}
            {(Boolean(snapshot) || capturing) && (
              <div className="relative aspect-video bg-airq-dark/5">
                {capturing && (
                  <div className="absolute inset-0 bg-airq-dark/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-airq-light"></div>
                  </div>
                )}
                {snapshot && (
                  <>
                    <Image
                      src={imageUrl}
                      alt={`Ring camera snapshot from ${cameraName}`}
                      fill
                      unoptimized={true}
                      className="object-contain p-1"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-airq-dark/80 px-1 py-0.5 flex justify-between items-center">
                      <span className="text-[9px] text-airq-light">
                        {snapshot && formatTimestamp(snapshot.timestamp)}
                      </span>
                      <button
                        onClick={() => captureSnapshot()}
                        disabled={capturing}
                        className="px-1 py-0.5 bg-airq-light text-airq-dark hover:bg-airq-light/90 disabled:opacity-50 text-[9px]"
                      >
                        {capturing ? '...' : 'New'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            {error && !snapshot && (
              <div className="aspect-video flex items-center justify-center bg-red-50">
                <span className="text-[10px] text-red-600">Error loading snapshot</span>
              </div>
            )}
          </div>
        )}

        {/* Door sensors section */}
        <div className="p-2">
          <div className="flex flex-col gap-1">
            {contactSensors.length === 0 ? (
              <div className="text-[10px] text-gray-500 text-center py-2">
                No contact sensors foundF
              </div>
            ) : (
              contactSensors.map((device) => (
                <SensorStatus key={device.deviceId} device={device} />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Header with security status */}
      <div className="border-b-[1px] border-airq-dark px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {isArmed ? (
            <>
              <ShieldCheck className="h-3 w-3 text-green-600" />
              <span className="text-[10px] text-green-600 font-medium">ARMED</span>
            </>
          ) : (
            <>
              <Shield className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">DISARMED</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(RingStatusCard);
