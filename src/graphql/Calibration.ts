import { gql } from '@apollo/client';

// Get calibration status from sensor
export const GET_SENSOR_CALIBRATION_STATUS = gql`
  mutation GetSensorCalibrationStatus($sensorId: Int!) {
    getSensorCalibrationStatus(sensorId: $sensorId) {
      success
      message
      status {
        serialNumber
        ascEnabled
        temperatureOffset
        currentCo2
        currentTemperature
        currentHumidity
      }
    }
  }
`;

// Perform Forced Recalibration
export const CALIBRATE_SENSOR_FRC = gql`
  mutation CalibrateSensorFRC($sensorId: Int!, $referenceCo2: Int) {
    calibrateSensorFrc(sensorId: $sensorId, referenceCo2: $referenceCo2) {
      success
      message
      result {
        success
        message
        error
        preCalibrationCo2
        postCalibrationCo2
        correction
        referenceCo2
      }
      sensor {
        id
        lastCalibrationTime
        lastCalibrationReferenceCo2
      }
    }
  }
`;

// Enable/disable Automatic Self-Calibration
export const SET_SENSOR_ASC = gql`
  mutation SetSensorASC($sensorId: Int!, $enabled: Boolean!) {
    setSensorAsc(sensorId: $sensorId, enabled: $enabled) {
      success
      message
      sensor {
        id
        autoCalibrationEnabled
      }
    }
  }
`;

// Set temperature offset
export const SET_SENSOR_TEMPERATURE_OFFSET = gql`
  mutation SetSensorTemperatureOffset($sensorId: Int!, $offset: Float!) {
    setSensorTemperatureOffset(sensorId: $sensorId, offset: $offset) {
      success
      message
      sensor {
        id
        temperatureOffset
      }
    }
  }
`;

// Factory reset sensor calibration
export const FACTORY_RESET_SENSOR = gql`
  mutation FactoryResetSensor($sensorId: Int!) {
    factoryResetSensor(sensorId: $sensorId) {
      success
      message
      sensor {
        id
        lastCalibrationTime
        autoCalibrationEnabled
        temperatureOffset
      }
    }
  }
`;

// Types
export interface CalibrationStatus {
  serialNumber: string[] | null;
  ascEnabled: boolean | null;
  temperatureOffset: number | null;
  currentCo2: number | null;
  currentTemperature: number | null;
  currentHumidity: number | null;
}

export interface CalibrationResult {
  success: boolean;
  message: string | null;
  error: string | null;
  preCalibrationCo2: number | null;
  postCalibrationCo2: number | null;
  correction: number | null;
  referenceCo2: number | null;
}

export interface GetCalibrationStatusResponse {
  getSensorCalibrationStatus: {
    success: boolean;
    message: string | null;
    status: CalibrationStatus | null;
  };
}

export interface CalibrateFRCResponse {
  calibrateSensorFrc: {
    success: boolean;
    message: string | null;
    result: CalibrationResult | null;
    sensor: {
      id: string;
      lastCalibrationTime: string | null;
      lastCalibrationReferenceCo2: number | null;
    } | null;
  };
}

export interface SetASCResponse {
  setSensorAsc: {
    success: boolean;
    message: string | null;
    sensor: {
      id: string;
      autoCalibrationEnabled: boolean;
    } | null;
  };
}

export interface SetTemperatureOffsetResponse {
  setSensorTemperatureOffset: {
    success: boolean;
    message: string | null;
    sensor: {
      id: string;
      temperatureOffset: number;
    } | null;
  };
}

export interface FactoryResetResponse {
  factoryResetSensor: {
    success: boolean;
    message: string | null;
    sensor: {
      id: string;
      lastCalibrationTime: string | null;
      autoCalibrationEnabled: boolean;
      temperatureOffset: number;
    } | null;
  };
}
