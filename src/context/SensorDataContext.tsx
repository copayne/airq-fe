import React, { createContext, useContext, useReducer, type ReactNode, useMemo, useCallback } from 'react';

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

// Split contexts to reduce unnecessary re-renders
interface SensorDataCriteriaContextType {
  criteria: SensorDataCriteria;
  updateCriteria: (updates: Partial<SensorDataCriteria>) => void;
}

interface SensorDataStatusContextType {
  isFetched: boolean;
  updateIsFetched: (isFetched: boolean) => void;
}

interface SensorDataState {
  criteria: SensorDataCriteria;
  isFetched: boolean;
}

type SensorDataAction =
  | { type: 'UPDATE_CRITERIA'; payload: Partial<SensorDataCriteria> }
  | { type: 'UPDATE_IS_FETCHED'; payload: boolean }

interface SensorDataContextType {
  state: SensorDataState;
  updateCriteria: (updates: Partial<SensorDataCriteria>) => void;
  updateIsFetched: (isFetched: boolean) => void;
}

const SensorDataContext = createContext<SensorDataContextType | undefined>(undefined);
const SensorDataCriteriaContext = createContext<SensorDataCriteriaContextType | undefined>(undefined);
const SensorDataStatusContext = createContext<SensorDataStatusContextType | undefined>(undefined);

// Define default criteria
const defaultCriteria: SensorDataCriteria = {
  startDate: undefined, // Last 90 days
  endDate: undefined,
  minCO2: 0,
  maxCO2: 5000,
  minTemperature: -20,
  maxTemperature: 50,
  minHumidity: 0,
  maxHumidity: 100,
};

const initialState: SensorDataState = {
  criteria: defaultCriteria,
  isFetched: false,
};

function sensorDataReducer(state: SensorDataState, action: SensorDataAction): SensorDataState {
  switch (action.type) {
    case 'UPDATE_CRITERIA':
      return {
        ...state,
        criteria: { ...state.criteria, ...action.payload },
      };
    case 'UPDATE_IS_FETCHED':
      return {
        ...state,
        isFetched: action.payload,
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

  const updateIsFetched = useCallback((isFetched: boolean) => {
    dispatch({ type: 'UPDATE_IS_FETCHED', payload: isFetched })
  }, []);

  const contextValue = useMemo(() => ({ state, updateCriteria, updateIsFetched }), [state, updateCriteria, updateIsFetched]);
  
  const criteriaContextValue = useMemo(() => ({ 
    criteria: state.criteria, 
    updateCriteria 
  }), [state.criteria, updateCriteria]);
  
  const statusContextValue = useMemo(() => ({ 
    isFetched: state.isFetched, 
    updateIsFetched 
  }), [state.isFetched, updateIsFetched]);

  return (
    <SensorDataContext.Provider value={contextValue}>
      <SensorDataCriteriaContext.Provider value={criteriaContextValue}>
        <SensorDataStatusContext.Provider value={statusContextValue}>
          {children}
        </SensorDataStatusContext.Provider>
      </SensorDataCriteriaContext.Provider>
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

// Split hooks for better performance
export const useSensorDataCriteria = () => {
  const context = useContext(SensorDataCriteriaContext);
  if (context === undefined) {
    throw new Error('useSensorDataCriteria must be used within a SensorDataProvider');
  }
  return context;
};

export const useSensorDataStatus = () => {
  const context = useContext(SensorDataStatusContext);
  if (context === undefined) {
    throw new Error('useSensorDataStatus must be used within a SensorDataProvider');
  }
  return context;
};