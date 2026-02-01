import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { memo, useMemo } from 'react';
import { useSensorReadingData } from '../../../../hooks/useSensorReadingData';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import { getDateRangeFromPreset, type TableWidgetConfig } from '~/types/widgetConfig';

interface SensorReading {
  readingTime: string;
  co2Reading?: { co2Ppm: number } | null;
  temperatureReading?: { temperatureCelsius: number } | null;
  humidityReading?: { humidityPercentage: number } | null;
  sensor?: { id: string } | null;
  location?: { id: string; name: string } | null;
}

interface TableData {
  readingTime: string;
  co2Ppm: string;
  temperature: string;
  humidityPercentage: string;
  locationName: string;
}

interface SensorReadingTableProps {
  config?: TableWidgetConfig;
}

const columnHelper = createColumnHelper<TableData>();

const SensorReadingTable = memo<SensorReadingTableProps>(({ config }) => {
  const {
    error,
    isFetched,
    loading,
    sensorReadings,
  } = useSensorReadingData();

  // Get temperature unit from config
  const tempUnit = config?.temperatureUnit ?? 'fahrenheit';
  const tempLabel = tempUnit === 'celsius' ? 'Temp (°C)' : 'Temp (°F)';

  // Filter readings based on widget config
  const filteredReadings = useMemo(() => {
    if (!sensorReadings?.length) return [];

    let readings = [...sensorReadings] as SensorReading[];

    // Filter by time range
    if (config?.timeRange && config.timeRange !== 'all') {
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (config.timeRange === 'custom') {
        if (config.customStartDate) startDate = new Date(config.customStartDate);
        if (config.customEndDate) endDate = new Date(config.customEndDate);
      } else {
        const range = getDateRangeFromPreset(config.timeRange);
        if (range) {
          startDate = range.startDate;
          endDate = range.endDate;
        }
      }

      if (startDate !== null || endDate !== null) {
        readings = readings.filter(r => {
          const readingDate = new Date(`${r.readingTime}Z`);
          if (startDate && readingDate < startDate) return false;
          if (endDate && readingDate > endDate) return false;
          return true;
        });
      }
    }

    // Filter by sensors
    if (config?.sensorIds?.length) {
      readings = readings.filter(r =>
        r.sensor?.id && config.sensorIds!.includes(r.sensor.id)
      );
    }

    // Filter by locations
    if (config?.locationIds?.length) {
      readings = readings.filter(r =>
        r.location?.id && config.locationIds!.includes(r.location.id)
      );
    }

    return readings;
  }, [sensorReadings, config]);
  const columns = useMemo(
    () => {
      const visibleColumns: string[] = config?.columns ?? ['time', 'co2', 'temperature', 'humidity', 'location'];
      const allColumns = [
        { key: 'time', col: columnHelper.accessor('readingTime', {
          header: 'Time',
          cell: info => {
            const timeValue = info.getValue();
            const [datePart, timePart] = timeValue.split(', ');
            return (
              <div>
                <p className="text-sm">{timePart}</p>
                <span className="text-xs p-0 m-0">{datePart}</span>
              </div>
            );
          },
        })},
        { key: 'co2', col: columnHelper.accessor('co2Ppm', {
          header: 'CO2 PPM',
          cell: info => info.getValue(),
        })},
        { key: 'temperature', col: columnHelper.accessor('temperature', {
          header: tempLabel,
          cell: info => info.getValue(),
        })},
        { key: 'humidity', col: columnHelper.accessor('humidityPercentage', {
          header: 'Humidity %',
          cell: info => info.getValue(),
        })},
        { key: 'location', col: columnHelper.accessor('locationName', {
          header: 'Location',
          cell: info => info.getValue(),
          enableResizing: true,
        })},
      ];
      return allColumns
        .filter(c => visibleColumns.includes(c.key))
        .map(c => c.col);
    },
    [tempLabel, config?.columns]
  );
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }), []);

  const data = useMemo(() => {
    if (!filteredReadings.length) return [];
    return filteredReadings.map(reading => {
      // Convert temperature based on unit preference
      let tempValue = '--';
      if (reading.temperatureReading?.temperatureCelsius != null) {
        const celsius = reading.temperatureReading.temperatureCelsius;
        tempValue = tempUnit === 'celsius'
          ? celsius.toFixed(1)
          : ((celsius * 9/5) + 32).toFixed(1);
      }

      return {
        co2Ppm: reading.co2Reading?.co2Ppm?.toFixed(0) ?? '--',
        locationName: reading.location?.name ?? '--',
        temperature: tempValue,
        humidityPercentage: reading.humidityReading?.humidityPercentage?.toFixed(0) ?? '--',
        readingTime: dateFormatter.format(new Date(`${reading.readingTime}Z`)),
      };
    });
  }, [filteredReadings, dateFormatter, tempUnit]);

  const pageSize = config?.pageSize ?? 25;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
      ...(config?.defaultSort ? {
        sorting: [{
          id: config.defaultSort.field,
          desc: config.defaultSort.direction === 'desc',
        }],
      } : {}),
    },
  });

  const hasFilters = (config?.sensorIds?.length ?? 0) > 0 || (config?.locationIds?.length ?? 0) > 0;

  return (
    <DataStateWrapper
      loading={loading && !isFetched}
      error={error}
      data={filteredReadings.length > 0 ? filteredReadings : sensorReadings}
      loadingMessage="Loading sensor readings..."
      errorMessage={error ? `Error: ${error.message}` : 'Error loading data'}
      emptyMessage={hasFilters ? "No data for selected filters" : "No sensor readings available"}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-auto rounded-sm rounded-ss-none">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="sticky top-0 bg-airq-background text-airq-dark p-2 text-left text-sm">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className={`${i % 2 ? 'bg-airq-background/20' : 'bg-airq-light'}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-1 border-t text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-2 py-1 border-t bg-airq-background/50 text-xs">
            <span className="text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              {' '}({data.length} rows)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-0.5 bg-airq-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-0.5 bg-airq-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DataStateWrapper>
  );
});

SensorReadingTable.displayName = 'SensorReadingTable';

export default SensorReadingTable;