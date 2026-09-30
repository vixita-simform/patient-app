// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactNative = require("eslint-plugin-react-native");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "html/*", "design/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}", "jest/**/*.{ts,tsx}"],
    plugins: { "react-native": reactNative },
    rules: {
      "react-native/no-inline-styles": "error",
      "react-native/no-color-literals": "error",
      "react-native/no-unused-styles": "error",
      "react-native/no-raw-text": ["error", { skip: ["CustomText", "AppText"] }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "react/jsx-sort-props": [
        "error",
        { callbacksLast: true, shorthandFirst: true, ignoreCase: true },
      ],
    },
  },
]);
