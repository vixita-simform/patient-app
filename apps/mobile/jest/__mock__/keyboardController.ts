// Uses the JS mock shipped with the library (native module is unavailable under Jest).
jest.mock('react-native-keyboard-controller', () =>
  jest.requireActual('react-native-keyboard-controller/jest')
);
