import { useMutation } from '@apollo/client';
import { CREATE_SENSOR_READING, GET_SENSOR_READINGS } from '~/graphql/SensorReading';

interface CreateSensorReadingInput {
  sensorId: number;
  humidityPercentage?: number;
  temperatureCelsius?: number;
  co2Ppm?: number;
}

interface SensorReading {
  id: string;
  readingTime: string;
  sensor: {
    id: string;
    name: string;
  };
  humidityReading?: {
    humidityPercentage: number;
  };
  temperatureReading?: {
    temperatureCelsius: number;
  };
  co2Reading?: {
    co2Ppm: number;
  };
}

interface CreateSensorReadingPayload {
  success: boolean;
  message: string;
  errors: string[];
  sensorReading?: SensorReading;
}

interface CreateSensorReadingData {
  createSensorReading: CreateSensorReadingPayload;
}

export function useCreateSensorReading() {
  const [createSensorReadingMutation, { loading, error }] = useMutation<CreateSensorReadingData>(
    CREATE_SENSOR_READING,
    {
      // Refetch sensor readings after successful creation
      refetchQueries: [
        { query: GET_SENSOR_READINGS },
        // Note: We could also refetch filtered readings, but it depends on the filters used
      ],
      awaitRefetchQueries: true,
    }
  );

  const createSensorReading = async (input: CreateSensorReadingInput) => {
    try {
      const result = await createSensorReadingMutation({
        variables: { input },
      });

      return result.data?.createSensorReading;
    } catch (error) {
      console.error('Create sensor reading mutation error:', error);
      throw error;
    }
  };

  return {
    createSensorReading,
    loading,
    error,
  };
}