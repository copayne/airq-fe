import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useSensorReadingData } from '../../hooks/useSensorReadingData';

const columnHelper = createColumnHelper();

const SensorReadingTable = () => {
  const {
    error,
    isFetched,
    loading,
    sensorReadings,
  } = useSensorReadingData();
  console.log(sensorReadings);
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
        enableResizing: true,
      }),
      columnHelper.accessor('locationName', {
        header: 'Location',
        cell: info => info.getValue(),
        enableResizing: true,
      }),
      columnHelper.accessor('co2Ppm', {
        header: 'CO2 PPM',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('temperatureCelsius', {
        header: 'Temp (°C)',
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
      columnHelper.accessor('sensor', {
        header: 'Sensor',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('readingTime', {
        header: 'Time',
        cell: info => info.getValue(),
      }),
    ],
    []
  );
  const data = useMemo(() => {
    if (!sensorReadings) return [];
    return sensorReadings.map(reading => ({
      id: reading.id,
      co2Ppm: reading.co2Reading.co2Ppm.toFixed(0),
      sensor: reading.sensor.name,
      locationName: reading.location.name,
      temperatureCelsius: reading.temperatureReading.temperatureCelsius.toFixed(1),
      temperatureFahrenheit: ((reading.temperatureReading.temperatureCelsius* 9/5) + 32).toFixed(1),
      humidityPercentage: reading.humidityReading.humidityPercentage.toFixed(0),
      readingTime: new Intl.DateTimeFormat(
        'en-US',
        {
          dateStyle: 'short',
          timeStyle: 'medium',
        }
      ).format(new Date(reading.readingTime)),
    }));
  }, [sensorReadings]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  console.log('fetch', isFetched);
  console.log('load', loading);

  if (loading && !isFetched) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full h-full overflow-auto border-default-dark border-[1px] rounded-sm rounded-ss-none">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="sticky top-0 bg-default-dark text-default-textLight p-2 text-left">
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
            <tr key={row.id} className={`${i % 2 ? 'bg-default-textLight' : 'bg-default-light'}`}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 border-t">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensorReadingTable;