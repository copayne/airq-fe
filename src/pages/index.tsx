import React, { useState } from 'react';
import Head from "next/head";
import {
  useMutation,
  useQuery,
} from '@apollo/client';
import {
  CREATE_SENSOR_READING,
  GET_SENSOR_READINGS,
} from '../graphql/SensorReading';

export default function Home() {
  const [sensorId, setSensorId] = useState('6');
  const [locationId, setLocationId] = useState('5');
  const [humidity, setHumidity] = useState('74');
  const [temperature, setTemperature] = useState('82');
  const [co2Level, setCo2Level] = useState('961');
  const { data: sensorReadings } = useQuery(GET_SENSOR_READINGS);
  const [createSensorReading, { data, loading, error }] = useMutation(CREATE_SENSOR_READING);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    createSensorReading({
      variables: {
        input: {
          sensorId: parseInt(sensorId),
          locationId: parseInt(locationId),
          humidityPercentage: humidity ? parseFloat(humidity) : null,
          temperatureCelsius: temperature ? parseFloat(temperature) : null,
          co2Ppm: co2Level ? parseInt(co2Level) : null
        }
      }
    });
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <form onSubmit={handleSubmit}>
            <input type="number" value={sensorId} onChange={e => setSensorId(e.target.value)} placeholder="Sensor ID" required />
            <input type="number" value={locationId} onChange={e => setLocationId(e.target.value)} placeholder="Location ID" required />
            <input type="number" value={humidity} onChange={e => setHumidity(e.target.value)} placeholder="Humidity" step="0.1" />
            <input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="Temperature" step="0.1" />
            <input type="number" value={co2Level} onChange={e => setCo2Level(e.target.value)} placeholder="CO2 Level" />
            <button type="submit">Add Sensor Reading</button>
          </form>
        </div>
      </main>
    </>
  );
}
