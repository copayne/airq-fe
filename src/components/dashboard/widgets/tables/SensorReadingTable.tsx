import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { memo, useMemo } from 'react';
import { useSensorReadingData } from '../../../../hooks/useSensorReadingData';

interface TableData {
  readingTime: string;
  co2Ppm: string;
  temperatureFahrenheit: string;
  humidityPercentage: string;
  locationName: string;
}

const columnHelper = createColumnHelper<TableData>();

const SensorReadingTable = memo(() => {
  const {
    error,
    isFetched,
    loading,
    sensorReadings,
  } = useSensorReadingData();
  const columns = useMemo(
    () => [
      columnHelper.accessor('readingTime', {
        header: 'Time',
        cell: info => {
          const timeValue = info.getValue();
          const [datePart, timePart] = timeValue.split(', ');
          
          return (
            <div>
              <p className="text-sm">{timePart}</p>
              <span className="text-xs p-0 m-0">{datePart}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('co2Ppm', {
        header: 'CO2 PPM',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('temperatureFahrenheit', {
        header: 'Temp (°F)',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('humidityPercentage', {
        header: 'Humidity %',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('locationName', {
        header: 'Location',
        cell: info => info.getValue(),
        enableResizing: true,
      }),
    ],
    []
  );
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }), []);

  const data = useMemo(() => {
    if (!sensorReadings) return [];
    return sensorReadings.map(reading => ({
      co2Ppm: reading.co2Reading.co2Ppm.toFixed(0),
      locationName: reading.location.name,
      temperatureFahrenheit: ((reading.temperatureReading.temperatureCelsius* 9/5) + 32).toFixed(1),
      humidityPercentage: reading.humidityReading.humidityPercentage.toFixed(0),
      readingTime: dateFormatter.format(new Date(`${reading.readingTime}Z`)),
    }));
  }, [sensorReadings, dateFormatter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading && !isFetched) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full h-full overflow-auto rounded-sm rounded-ss-none">
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
  );
});

SensorReadingTable.displayName = 'SensorReadingTable';

export default SensorReadingTable;