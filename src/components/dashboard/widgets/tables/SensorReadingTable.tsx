import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { memo, useMemo, useState, useEffect } from 'react';
import { useWidgetSensorData } from '~/hooks/useWidgetSensorData';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import type { TableWidgetConfig } from '~/types/widgetConfig';

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
  timestamp: number; // Epoch ms for proper sorting
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
  // Use widget-specific data fetching (same as charts) to get fresh data based on config
  const { sensorReadings, loading, error } = useWidgetSensorData({ config });

  // Get temperature unit from config
  const tempUnit = config?.temperatureUnit ?? 'fahrenheit';
  const tempLabel = tempUnit === 'celsius' ? 'Temp (°C)' : 'Temp (°F)';

  // Reactive pagination state - updates when config changes
  const pageSize = config?.pageSize ?? 25;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  // Reset pagination when pageSize config changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageSize, pageIndex: 0 }));
  }, [pageSize]);

  // Reactive sorting state - updates when config changes
  const [sorting, setSorting] = useState<SortingState>(
    config?.defaultSort
      ? [{ id: config.defaultSort.field, desc: config.defaultSort.direction === 'desc' }]
      : []
  );

  // Update sorting when config changes
  useEffect(() => {
    if (config?.defaultSort) {
      setSorting([{ id: config.defaultSort.field, desc: config.defaultSort.direction === 'desc' }]);
    }
  }, [config?.defaultSort]);

  // Data is already filtered by API (time range, sensors, locations)
  // Just cast to the expected type
  const filteredReadings = useMemo(() => {
    if (!sensorReadings?.length) return [];
    return sensorReadings as SensorReading[];
  }, [sensorReadings]);
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
          // Sort by timestamp (epoch) not formatted string to handle AM/PM correctly
          sortingFn: (rowA, rowB) => rowA.original.timestamp - rowB.original.timestamp,
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

      const date = new Date(`${reading.readingTime}Z`);
      return {
        co2Ppm: reading.co2Reading?.co2Ppm?.toFixed(0) ?? '--',
        locationName: reading.location?.name ?? '--',
        temperature: tempValue,
        humidityPercentage: reading.humidityReading?.humidityPercentage?.toFixed(0) ?? '--',
        readingTime: dateFormatter.format(date),
        timestamp: date.getTime(), // Store epoch for sorting
      };
    });
  }, [filteredReadings, dateFormatter, tempUnit]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Use controlled state so config changes apply immediately
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  });

  const hasFilters = (config?.sensorIds?.length ?? 0) > 0 || (config?.locationIds?.length ?? 0) > 0;

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={filteredReadings}
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