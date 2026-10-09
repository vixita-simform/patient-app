import { act } from "@testing-library/react-native";
import { router } from "expo-router";

import { MORE_ITEMS, STACK_ROUTES } from "../../../src/constants";
import useMoreScreen from "../../../src/screens/more/useMoreScreen";
import { RenderWrapperForHooks } from "../../Wrapper";

describe("useMoreScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the menu items", async () => {
    const { result } = await RenderWrapperForHooks(() => useMoreScreen());
    expect(result.current.items).toBe(MORE_ITEMS);
  });

  it.each(MORE_ITEMS.map((item) => [item.id]))("pushes the route for %s", async (id) => {
    const { result } = await RenderWrapperForHooks(() => useMoreScreen());
    await act(() => result.current.onPressItem(id));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES[id]);
  });

  it("keeps onPressItem stable across renders", async () => {
    const { result, rerender } = await RenderWrapperForHooks(() => useMoreScreen());
    const first = result.current.onPressItem;
    await rerender({});
    expect(result.current.onPressItem).toBe(first);
  });
});
