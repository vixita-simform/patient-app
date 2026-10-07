// The library ships its mock as a default export, so unwrap it before handing it to jest.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default
);
