module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/jest'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  clearMocks: true,
  globalSetup: '<rootDir>/jest/globalSetup.js',
  testEnvironment: 'node',
  testResultsProcessor: 'jest-sonar-reporter',
  snapshotSerializers: [],
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: true,
  transformIgnorePatterns: [
    //An array of regexp pattern strings that are matched against all source file paths before transformation. If the file path matches any of the patterns, it will not be transformed.
    '/node_modules/(?!(@react-native|react-native|expo|@expo|expo-router)/).*/' +
      'react-native-gesture-handler' +
      'react-native-safe-area-context'
    //   'react-native-reanimated'
  ],
  globals: {
    __DEV__: false
  },
  moduleNameMapper: {
    //If you mock any of the library in jest/mock for your project need to add that mocked file path so jest will refer that path while we run the testcase
    '\\.(jpg|jpeg|png|gif|svg|ttf|woff|woff2)$': '<rootDir>/jest/__mock__/ImageMock.js'
    // 'react-native-webview': '<rootDir>/jest/__mock__/react-native-webview.tsx',
    // 'react-native-splash-screen': '<rootDir>/jest/__mock__/react-native-splash-screen.js',
  },
  moduleDirectories: [
    // /An array of directory names to be searched recursively up from the requiring module's location. Setting this option will override the default.
    'node_modules',
    'src'
  ],
  testPathIgnorePatterns: [
    //An array of regexp pattern strings that are matched against all test paths before executing the test. If the test path matches any of the patterns, it will be skipped.
    '/node_modules/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/jest/Wrapper.tsx',
    '<rootDir>/src/assets/',
    '<rootDir>/jest/__mock__/',
    'jest.config.js'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/jest/Wrapper.tsx',
    '<rootDir>/src/assets/',
    '<rootDir>/jest/__mock__/',
    'jest.config.js'
  ],
  setupFiles: [
    //A list of paths to modules that run some code to configure or set up the testing environment. Each setupFile will be run once per test file.
    '<rootDir>/jest/setup.ts'
    // This is an example, you can add other setup files
    // './node_modules/react-native-gesture-handler/jestSetup.js'
  ],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$'
};
