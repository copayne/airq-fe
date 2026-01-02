/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { memo } from "react";
import { DoorClosed, DoorOpen, Battery, WifiOff, Clock, AlertCircle } from "lucide-react";
import { useRing } from "~/context/RingContext";
import type { RingDeviceData } from "~/services/RingController";

type RingContactSensorCardProps = Record<string, unknown>;

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "Never";

  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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
    <div className={`flex flex-col items-center border-[1px] border-airq-dark ${statusClasses}`}>
      <div className="flex w-full items-center justify-between border-b-[1px] border-airq-dark px-2 py-1">
        <span className="text-xs font-medium text-airq-dark truncate">
          {device.name}
        </span>
        {device.batteryLevel !== null && (
          <div className="flex items-center gap-1">
            <Battery className={`h-3 w-3 ${batteryColor}`} />
            <span className={`text-xs ${batteryColor}`}>
              {device.batteryLevel}%
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        {isOffline ? (
          <WifiOff className={`h-6 w-6 ${iconClasses}`} />
        ) : isOpen ? (
          <DoorOpen className={`h-6 w-6 ${iconClasses}`} />
        ) : (
          <DoorClosed className={`h-6 w-6 ${iconClasses}`} />
        )}

        <span className={`text-xs font-semibold mt-1 ${textClasses}`}>
          {isOffline ? "OFFLINE" : isOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 border-t-[1px] border-airq-dark w-full justify-center py-1">
        <Clock className="h-3 w-3" />
        <span>{formatTimeAgo(device.lastUpdate)}</span>
      </div>
    </div>
  );
}

function RingContactSensorCard(_props: RingContactSensorCardProps) {
  const { devices, isInitialized, error } = useRing();

  const contactSensors = devices.filter(
    (device: RingDeviceData) => device.deviceType === "contact_sensor" ||
                                device.deviceType.includes("contact")
  );

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="flex h-full w-full items-center justify-center border-black border-[1px] shadow-airq-dark shadow-card bg-airq-light">
        <div className="text-xs text-airq-dark">
          Initializing Ring devices...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-black border-[1px] shadow-airq-dark shadow-card bg-airq-light p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <div className="text-xs font-semibold text-red-700">
          Failed to load Ring devices
        </div>
        <div className="text-xs text-gray-500">{error}</div>
      </div>
    );
  }

  // Show empty state
  if (contactSensors.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center border-black border-[1px] shadow-airq-dark shadow-card bg-airq-light">
        <div className="text-xs text-airq-dark">
          No contact sensors found
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col bg-airq-light">
      <div className="flex-1 overflow-auto p-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 h-full">
          {contactSensors.map((device) => (
            <SensorStatus key={device.deviceId} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RingContactSensorCard);
