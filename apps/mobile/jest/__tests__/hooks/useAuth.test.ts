import { act } from "@testing-library/react-native";
import React from "react";

import { RenderWrapperForHooks } from "../../Wrapper";

type AuthModule = typeof import("../../../src/hooks/useAuth");
type UtilsModule = typeof import("../../../src/utils");

jest.mock("../../../src/utils", () => ({
  ...jest.requireActual("../../../src/utils"),
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(() => Promise.resolve()),
  clearAuthToken: jest.fn(() => Promise.resolve()),
}));

/**
 * useAuth keeps its state at module level, so each test loads a fresh copy of the
 * hook and its mocked storage to start from `isLoading: true`. React itself is pinned to
 * the outer instance so the isolated hook shares the renderer's dispatcher.
 */
const loadModules = (): { auth: AuthModule; utils: jest.Mocked<UtilsModule> } => {
  let auth!: AuthModule;
  let utils!: jest.Mocked<UtilsModule>;
  jest.isolateModules(() => {
    jest.doMock("react", () => React);
    auth = require("../../../src/hooks/useAuth");
    utils = require("../../../src/utils");
  });
  return { auth, utils };
};

describe("useAuth", () => {
  it("starts loading and signed out", async () => {
    const { auth } = loadModules();
    const { result } = await RenderWrapperForHooks(() => auth.default());
    expect(result.current).toEqual({ isLoading: true, isSignedIn: false });
  });

  it("finishes loading signed in when a token is stored", async () => {
    const { auth, utils } = loadModules();
    utils.getAuthToken.mockResolvedValue("token_123");
    const { result } = await RenderWrapperForHooks(() => auth.default());
    await act(async () => auth.loadAuthToken());
    expect(result.current).toEqual({ isLoading: false, isSignedIn: true });
  });

  it("finishes loading signed out when no token is stored", async () => {
    const { auth, utils } = loadModules();
    utils.getAuthToken.mockResolvedValue(null);
    const { result } = await RenderWrapperForHooks(() => auth.default());
    await act(async () => auth.loadAuthToken());
    expect(result.current).toEqual({ isLoading: false, isSignedIn: false });
  });

  it("treats a storage read failure as signed out and stops loading", async () => {
    const { auth, utils } = loadModules();
    utils.getAuthToken.mockRejectedValue(new Error("keychain unavailable"));
    const { result } = await RenderWrapperForHooks(() => auth.default());
    await act(async () => auth.loadAuthToken());
    expect(result.current).toEqual({ isLoading: false, isSignedIn: false });
  });

  it("signs in and out", async () => {
    const { auth, utils } = loadModules();
    const { result } = await RenderWrapperForHooks(() => auth.default());

    await act(async () => auth.signIn("token_456"));
    expect(utils.setAuthToken).toHaveBeenCalledWith("token_456");
    expect(result.current).toEqual({ isLoading: false, isSignedIn: true });

    await act(async () => auth.signOut());
    expect(utils.clearAuthToken).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ isLoading: false, isSignedIn: false });
  });
});
