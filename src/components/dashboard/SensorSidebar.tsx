import React, { memo, useState, useCallback } from 'react';
import { DoorClosed, DoorOpen, Battery, WifiOff, Clock } from 'lucide-react';
import { useSensors } from '~/hooks/useSensors';
import { useRing } from '~/context/RingContext';
import type { Sensor } from '~/types/sensors';
import type { RingDeviceData } from '~/services/RingController';
import { formatSensorDetails } from '~/utils/sensorFormatters';
import { getRelativeTime as getRelativeTimeUtil } from '~/utils/dateUtils';
import {
  getCO2ColorClasses,
  getHumidityColorClasses,
  getTemperatureCelsiusColorClasses
} from '~/utils/thresholds';
import Sparkline from '~/components/common/Sparkline';
import SparklineModal, { type SparklineMetric } from '~/components/common/SparklineModal';
import { useSparklineData } from '~/hooks/useSparklineData';

// Sparkline colors matching the chart colors
const SPARKLINE_COLORS = {
  co2: 'rgb(34, 197, 94)',
  temperature: 'rgb(59, 130, 246)',
  humidity: 'rgb(168, 85, 247)',
} as const;

interface CompactSensorCardProps {
  sensor: Sensor;
}

const CompactSensorCard: React.FC<CompactSensorCardProps> = memo(({ sensor }) => {
  const [modalMetric, setModalMetric] = useState<SparklineMetric | null>(null);

  const {
    co2,
    co2Raw,
    humidity,
    humidityRaw,
    tempRaw,
    temperatureFahrenheit,
    lastReading,
  } = formatSensorDetails(sensor);

  const {
    co2Data,
    temperatureData,
    humidityData,
    loading: sparklineLoading,
  } = useSparklineData(sensor.id);

  const openModal = useCallback((metric: SparklineMetric) => {
    setModalMetric(metric);
  }, []);

  const closeModal = useCallback(() => {
    setModalMetric(null);
  }, []);

  const co2Colors = getCO2ColorClasses(co2Raw);
  const tempColors = getTemperatureCelsiusColorClasses(tempRaw ?? null);
  const humidityColors = getHumidityColorClasses(humidityRaw ?? null);

  const locationName = sensor.currentLocation?.name ?? 'unassigned';

  // Format relative time for last reading
  const getRelativeTime = (readingTime: string | undefined) => {
    if (!readingTime || readingTime === '--') return 'no data';
    return getRelativeTimeUtil(sensor.lastReading?.readingTime, 'no data');
  };

  return (
    <>
      <div className="border border-airq-dark shadow-card bg-airq-light">
        {/* Header with location name */}
        <div className="bg-airq-dark text-airq-light px-2 py-1 flex items-center justify-between">
          <span className="text-xs font-semibold truncate">{locationName}</span>
          <span className="text-[10px] text-airq-light/60">{getRelativeTime(lastReading)}</span>
        </div>

        {/* Metrics row with sparklines */}
        <div className="flex divide-x divide-airq-dark/30">
          <div className={`flex-1 min-w-0 px-2 py-1.5 text-center overflow-hidden ${co2Colors.inner}`}>
            <p className="text-[10px] uppercase">co2</p>
            <p className="text-sm font-medium">{co2}<span className="text-[10px]">ppm</span></p>
            <Sparkline
              data={co2Data}
              color={SPARKLINE_COLORS.co2}
              loading={sparklineLoading}
              onClick={() => openModal('co2')}
            />
          </div>
          <div className={`flex-1 min-w-0 px-2 py-1.5 text-center overflow-hidden ${tempColors.inner}`}>
            <p className="text-[10px] uppercase">temp</p>
            <p className="text-sm font-medium">{temperatureFahrenheit}<span className="text-[10px]">f</span></p>
            <Sparkline
              data={temperatureData}
              color={SPARKLINE_COLORS.temperature}
              loading={sparklineLoading}
              onClick={() => openModal('temperature')}
            />
          </div>
          <div className={`flex-1 min-w-0 px-2 py-1.5 text-center overflow-hidden ${humidityColors.inner}`}>
            <p className="text-[10px] uppercase">hum</p>
            <p className="text-sm font-medium">{humidity}<span className="text-[10px]">%</span></p>
            <Sparkline
              data={humidityData}
              color={SPARKLINE_COLORS.humidity}
              loading={sparklineLoading}
              onClick={() => openModal('humidity')}
            />
          </div>
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {modalMetric && (
        <SparklineModal
          isOpen={!!modalMetric}
          onClose={closeModal}
          metric={modalMetric}
          sensorId={sensor.id}
          sensorName={sensor.name}
        />
      )}
    </>
  );
});

CompactSensorCard.displayName = 'CompactSensorCard';

// Ring Door Sensor compact card - matches RingContactSensorCard SensorStatus style
interface CompactRingDoorCardProps {
  device: RingDeviceData;
}

function formatTimeAgo(timestamp: string | null): string {
  return getRelativeTimeUtil(timestamp, 'Never');
}

const CompactRingDoorCard: React.FC<CompactRingDoorCardProps> = memo(({ device }) => {
  const isOpen = device.status === 'open';
  const isOffline = !device.lastUpdate;

  const statusClasses = isOffline
    ? 'bg-gray-100'
    : isOpen
      ? 'bg-red-50'
      : 'bg-green-50';

  const iconClasses = isOffline
    ? 'text-gray-400'
    : isOpen
      ? 'text-red-600'
      : 'text-green-600';

  const textClasses = isOffline
    ? 'text-gray-600'
    : isOpen
      ? 'text-red-700'
      : 'text-green-700';

  const batteryColor =
    device.batteryLevel === null
      ? 'text-gray-400'
      : device.batteryLevel > 50
        ? 'text-green-600'
        : device.batteryLevel > 20
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className={`flex flex-col items-center border border-airq-dark shadow-card ${statusClasses}`}>
      <div className="flex w-full items-center justify-between border-b border-airq-dark px-2 py-1">
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
          {isOffline ? 'OFFLINE' : isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 border-t border-airq-dark w-full justify-center py-1">
        <Clock className="h-3 w-3" />
        <span>{formatTimeAgo(device.lastUpdate)}</span>
      </div>
    </div>
  );
});

CompactRingDoorCard.displayName = 'CompactRingDoorCard';

// Ring Door Sensors section
const RingDoorSensorsSection: React.FC = memo(() => {
  const { devices, isInitialized } = useRing();

  const contactSensors = devices.filter(
    (device: RingDeviceData) =>
      device.deviceType === 'contact_sensor' ||
      device.deviceType.includes('contact')
  );

  // Don't render section if not initialized or no sensors
  if (!isInitialized || contactSensors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-airq-dark/70 uppercase tracking-wide">
        Door Sensors
      </div>
      {contactSensors.map((device) => (
        <CompactRingDoorCard key={device.deviceId} device={device} />
      ))}
    </div>
  );
});

RingDoorSensorsSection.displayName = 'RingDoorSensorsSection';

const SensorSidebar: React.FC = memo(() => {
  const { sensors, loading } = useSensors({
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Poll every 30 seconds for fresh data
  });

  // Filter to only show active sensors with locations
  const activeSensors = sensors?.filter(s => s.isActive) ?? [];

  if (loading && !sensors?.length) {
    return (
      <div className="w-56 flex-shrink-0 border-r border-airq-dark bg-airq-light/50">
        <div className="p-3 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-airq-dark/10 mb-2"></div>
              <div className="h-12 bg-airq-dark/5"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 flex-shrink-0 border-r border-airq-dark bg-airq-light/50 flex flex-col">
      {/* Sensor cards list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* CO2 Sensors Section */}
        {activeSensors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-airq-dark/60">no active sensors</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-airq-dark/70 uppercase tracking-wide">
              Air Quality
            </div>
            {activeSensors.map((sensor) => (
              <CompactSensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        )}

        {/* Ring Door Sensors Section */}
        <RingDoorSensorsSection />
      </div>
    </div>
  );
});

SensorSidebar.displayName = 'SensorSidebar';

export default SensorSidebar;
