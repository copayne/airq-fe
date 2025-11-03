import { useMutation } from '@apollo/client';
import { CREATE_SENSOR_READING, GET_SENSOR_READINGS } from '~/graphql/SensorReading';
import type {
  CreateSensorReadingInput,
  CreateSensorReadingData
} from '~/types/sensors';

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