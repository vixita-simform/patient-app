import { render, renderHook, type RenderHookOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PatientProvider } from '../src/context';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Providers the app root mounts in src/app/_layout.tsx.
 * @param {AppProvidersProps} props - tree to wrap.
 * @returns {ReactElement} The wrapped tree.
 */
const AppProviders = ({ children }: AppProvidersProps): ReactElement => (
  <PatientProvider>
    <SafeAreaProvider>
      <KeyboardProvider>{children}</KeyboardProvider>
    </SafeAreaProvider>
  </PatientProvider>
);

/**
 * Renders a component inside the app providers.
 * @param {ReactElement} ui - element to render.
 * @returns The RNTL render result.
 */
export const RenderWrapper = (ui: ReactElement) => render(ui, { wrapper: AppProviders });

/**
 * Renders a hook inside the app providers.
 * @param hook - hook to render.
 * @param options - initial props for the hook.
 * @returns The RNTL renderHook result.
 */
export const RenderWrapperForHooks = <Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) => renderHook(hook, { ...options, wrapper: AppProviders });
