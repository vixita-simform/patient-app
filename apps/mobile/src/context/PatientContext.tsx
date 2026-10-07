import type { PatientDetail } from '@patient-app/shared-types';
import type { ReactElement, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { clearStoredPatient, getStoredPatient, setStoredPatient } from '../utils';
import type { PatientContextValue } from './PatientContextTypes';

const PatientContext = createContext<PatientContextValue | null>(null);

interface PatientProviderProps {
  children: ReactNode;
}

/**
 * Holds the signed-in patient. Restores it from secure storage on launch, and saves or
 * clears it when the patient signs in or out.
 * @param {PatientProviderProps} props - the tree that can read the patient.
 * @returns {ReactElement} The provider.
 */
export const PatientProvider = ({ children }: PatientProviderProps): ReactElement => {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Set once the patient is saved or cleared, so a slower launch restore cannot overwrite it.
  const hasChangedRef = useRef(false);

  useEffect(() => {
    let isActive = true;
    getStoredPatient()
      .catch(() => null)
      .then((stored) => {
        // A sign in or sign out that finished before the restore wins over the stored value.
        if (isActive) {
          if (!hasChangedRef.current) {
            setPatient(stored);
          }
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const savePatient = useCallback(async (next: PatientDetail): Promise<void> => {
    await setStoredPatient(next);
    hasChangedRef.current = true;
    setPatient(next);
  }, []);

  const clearPatient = useCallback(async (): Promise<void> => {
    hasChangedRef.current = true;
    setPatient(null);
    await clearStoredPatient();
  }, []);

  const value = useMemo<PatientContextValue>(
    () => ({ patient, isLoading, savePatient, clearPatient }),
    [patient, isLoading, savePatient, clearPatient]
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};

/**
 * The signed-in patient and the actions that change it.
 * @returns {PatientContextValue} Patient, restore state, save and clear actions.
 * @throws When used outside PatientProvider.
 */
export const usePatient = (): PatientContextValue => {
  const value = useContext(PatientContext);
  if (!value) {
    throw new Error('usePatient must be used inside PatientProvider');
  }
  return value;
};
