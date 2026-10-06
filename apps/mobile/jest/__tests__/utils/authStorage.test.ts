import * as SecureStore from "expo-secure-store";

import { clearAuthToken, getAuthToken, setAuthToken } from "../../../src/utils";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
}));

const mockedStore = jest.mocked(SecureStore);

describe("authStorage", () => {
  it("reads the token from secure store", async () => {
    mockedStore.getItemAsync.mockResolvedValue("token_123");
    await expect(getAuthToken()).resolves.toBe("token_123");
    expect(mockedStore.getItemAsync).toHaveBeenCalledWith("authToken");
  });

  it("returns null when no token is stored", async () => {
    mockedStore.getItemAsync.mockResolvedValue(null);
    await expect(getAuthToken()).resolves.toBeNull();
  });

  it("persists the token, readable only on this device while unlocked", async () => {
    mockedStore.setItemAsync.mockResolvedValue();
    await setAuthToken("token_456");
    expect(mockedStore.setItemAsync).toHaveBeenCalledWith("authToken", "token_456", {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it("clears the token", async () => {
    mockedStore.deleteItemAsync.mockResolvedValue();
    await clearAuthToken();
    expect(mockedStore.deleteItemAsync).toHaveBeenCalledWith("authToken");
  });
});
