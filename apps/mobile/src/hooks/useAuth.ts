import { useSyncExternalStore } from "react";

import { clearAuthToken, getAuthToken, setAuthToken } from "../utils";

interface AuthState {
  isLoading: boolean;
  /** Only whether a token exists; the token itself stays in secure storage. */
  isSignedIn: boolean;
}

export interface UseAuthReturn {
  isLoading: boolean;
  isSignedIn: boolean;
}

let state: AuthState = { isLoading: true, isSignedIn: false };
const listeners = new Set<() => void>();

const setState = (next: AuthState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

/**
 * Reads the persisted token once at startup; a read failure counts as signed out.
 * @returns {Promise<void>}
 */
export const loadAuthToken = async (): Promise<void> => {
  let token: string | null = null;
  try {
    token = await getAuthToken();
  } catch {
    token = null;
  } finally {
    // Always clear loading so the splash never hangs, even on an unexpected error.
    setState({ isLoading: false, isSignedIn: token !== null });
  }
};

/**
 * Persists the token and flips the route guards to the protected screens.
 * @param {string} token - Token issued on sign in.
 * @returns {Promise<void>}
 */
export const signIn = async (token: string): Promise<void> => {
  await setAuthToken(token);
  setState({ isLoading: false, isSignedIn: true });
};

/**
 * Clears the token and flips the route guards back to sign in.
 * @returns {Promise<void>}
 */
export const signOut = async (): Promise<void> => {
  await clearAuthToken();
  setState({ isLoading: false, isSignedIn: false });
};

/**
 * Shared auth state for route guards and screens.
 * @returns {UseAuthReturn} Whether the token is still loading and whether one exists.
 */
const useAuth = (): UseAuthReturn => {
  const { isLoading, isSignedIn } = useSyncExternalStore(subscribe, getSnapshot);

  return { isLoading, isSignedIn };
};

export default useAuth;
