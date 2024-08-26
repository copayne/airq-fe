import React, { useState } from 'react';
import Head from "next/head";
import {
  useMutation,
  useQuery,
} from '@apollo/client';
import AirQualityDashboard from '~/components/dashboard/AirQualityDashboard';
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
        <title>Hudson Air Quality Project</title>
        <meta name="description" content="Hudson Air Quality Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AirQualityDashboard />
    </>
  );
}
