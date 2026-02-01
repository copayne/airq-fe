/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { memo } from "react";
import { DoorClosed, DoorOpen, Battery, WifiOff, Clock, AlertCircle } from "lucide-react";
import { useRing } from "~/context/RingContext";
import type { RingDeviceData } from "~/services/RingController";
import { getRelativeTime } from "~/utils/dateUtils";
import type { RingContactSensorsConfig } from "~/types/widgetConfig";

interface RingContactSensorCardProps {
  config?: RingContactSensorsConfig;
}

function formatTimeAgo(timestamp: string | null): string {
  return getRelativeTime(timestamp, "Never");
}

function SensorStatus({ device, showBattery = true, showLastUpdate = true }: { device: RingDeviceData; showBattery?: boolean; showLastUpdate?: boolean }) {
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
      <div className="flex w-full items-center justify-between border-b-[1px] border-airq-dark px-1.5 py-0.5">
        <span className="text-[10px] font-medium text-airq-dark truncate">
          {device.name}
        </span>
        {showBattery && device.batteryLevel !== null && (
          <div className="flex items-center gap-0.5">
            <Battery className={`h-2.5 w-2.5 ${batteryColor}`} />
            <span className={`text-[9px] ${batteryColor}`}>
              {device.batteryLevel}%
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-1">
        {isOffline ? (
          <WifiOff className={`h-5 w-5 ${iconClasses}`} />
        ) : isOpen ? (
          <DoorOpen className={`h-5 w-5 ${iconClasses}`} />
        ) : (
          <DoorClosed className={`h-5 w-5 ${iconClasses}`} />
        )}

        <span className={`text-[10px] font-semibold mt-0.5 ${textClasses}`}>
          {isOffline ? "OFFLINE" : isOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>

      {showLastUpdate && (
        <div className="flex items-center gap-0.5 text-[9px] text-gray-500 border-t-[1px] border-airq-dark w-full justify-center py-0.5">
          <Clock className="h-2.5 w-2.5" />
          <span>{formatTimeAgo(device.lastUpdate)}</span>
        </div>
      )}
    </div>
  );
}

function RingContactSensorCard({ config }: RingContactSensorCardProps) {
  const { devices, isInitialized, error } = useRing();
  const layoutStyle = config?.layout ?? 'grid';
  const showBattery = config?.showBattery ?? true;
  const showLastUpdate = config?.showLastUpdate ?? true;

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
      <div className="flex-1 overflow-auto p-1">
        <div className={`gap-1 h-full ${
          layoutStyle === 'list' ? 'flex flex-col' :
          layoutStyle === 'compact' ? 'grid grid-cols-2 sm:grid-cols-4' :
          'grid grid-cols-1 sm:grid-cols-3'
        }`}>
          {contactSensors.map((device) => (
            <SensorStatus key={device.deviceId} device={device} showBattery={showBattery} showLastUpdate={showLastUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RingContactSensorCard);
