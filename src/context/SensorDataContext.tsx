import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';

export interface SensorDataCriteria {
  startDate?: Date;
  endDate?: Date;
  minCO2?: number;
  maxCO2?: number;
  minTemperature?: number;
  maxTemperature?: number;
  minHumidity?: number;
  maxHumidity?: number;
  sensorIds?: string[];
  locationIds?: string[];
}

interface SensorDataState {
  criteria: SensorDataCriteria;
}

type SensorDataAction =
  | { type: 'UPDATE_CRITERIA'; payload: Partial<SensorDataCriteria> }

interface SensorDataContextType {
  state: SensorDataState;
  updateCriteria: (updates: Partial<SensorDataCriteria>) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);

// Define default criteria
const defaultCriteria: SensorDataCriteria = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 90)), // Last 90 days
  endDate: new Date(),
  minCO2: 0,
  maxCO2: 5000,
  minTemperature: -20,
  maxTemperature: 50,
  minHumidity: 0,
  maxHumidity: 100,
};

const initialState: SensorDataState = {
  criteria: defaultCriteria,
};

function sensorDataReducer(state: SensorDataState, action: SensorDataAction): SensorDataState {
  switch (action.type) {
    case 'UPDATE_CRITERIA':
      return {
        ...state,
        criteria: { ...state.criteria, ...action.payload },
      };
    default:
      return state;
  }
}

export const SensorDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sensorDataReducer, initialState);

  const updateCriteria = useCallback((updates: Partial<SensorDataCriteria>) => {
    dispatch({ type: 'UPDATE_CRITERIA', payload: updates });
  }, []);

  const contextValue = useMemo(() => ({ state, updateCriteria }), [state, updateCriteria]);

  return (
    <SensorDataContext.Provider value={contextValue}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorDataContext = () => {
  const context = useContext(SensorDataContext);
  if (context === undefined) {
    throw new Error('useSensorDataContext must be used within a SensorDataProvider');
  }
  return context;
};