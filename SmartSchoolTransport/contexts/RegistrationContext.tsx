// contexts/RegistrationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ParentRegistration {
  name: string;
  email: string;
  password: string;
  contact: string;
  location: string;
}

interface DriverRegistration {
  name: string;
  email: string;
  password: string;
  contact: string;
  license: string;
  vehicle: {
    type: string;
    capacity: number;
    registration: string;
  };
  schools: string[];
  serviceAreas: string[];
}

interface RegistrationContextType {
  parentData: ParentRegistration;
  driverData: DriverRegistration;
  updateParentData: (data: Partial<ParentRegistration>) => void;
  updateDriverData: (data: Partial<DriverRegistration>) => void;
  resetData: () => void;
}

const defaultParentData: ParentRegistration = {
  name: '',
  email: '',
  password: '',
  contact: '',
  location: '',
};

const defaultDriverData: DriverRegistration = {
  name: '',
  email: '',
  password: '',
  contact: '',
  license: '',
  vehicle: {
    type: '',
    capacity: 0,
    registration: '',
  },
  schools: [],
  serviceAreas: [],
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
  const [parentData, setParentData] = useState<ParentRegistration>(defaultParentData);
  const [driverData, setDriverData] = useState<DriverRegistration>(defaultDriverData);

  const updateParentData = (data: Partial<ParentRegistration>) => {
    setParentData(prev => ({ ...prev, ...data }));
  };

  const updateDriverData = (data: Partial<DriverRegistration>) => {
    setDriverData(prev => ({ ...prev, ...data }));
  };

  const resetData = () => {
    setParentData(defaultParentData);
    setDriverData(defaultDriverData);
  };

  return (
    <RegistrationContext.Provider
      value={{
        parentData,
        driverData,
        updateParentData,
        updateDriverData,
        resetData
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};