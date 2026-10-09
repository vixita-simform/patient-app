import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  CLIENT_CODES,
  DOCUMENTS,
  MESSAGES,
  STACK_ROUTES,
  Strings,
  TEAM,
} from "../../../../src/constants";
import { HomeScreen } from "../../../../src/screens";
import { RenderWrapper } from "../../../Wrapper";

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the client header, sections and data", async () => {
    await RenderWrapper(<HomeScreen />);
    expect(screen.getByText(Strings.HomeScreen.goodMorning)).toBeOnTheScreen();
    expect(screen.getByText(CLIENT_CODES[0].name)).toBeOnTheScreen();
    expect(screen.getByText(Strings.HomeScreen.recentDocuments)).toBeOnTheScreen();
    expect(screen.getByText(Strings.HomeScreen.yourTeam)).toBeOnTheScreen();
    expect(screen.getAllByText(DOCUMENTS[0].name).length).toBeGreaterThan(0);
    expect(
      screen.getByText(`${DOCUMENTS[0].type}${Strings.Common.metaSeparator}${DOCUMENTS[0].date}`),
    ).toBeOnTheScreen();
    expect(screen.getByText(MESSAGES[0].topic)).toBeOnTheScreen();
    expect(screen.getByText(TEAM[1].role)).toBeOnTheScreen();
  });

  it("navigates to notifications from the bell", async () => {
    await RenderWrapper(<HomeScreen />);
    await fireEvent.press(screen.getByRole("button", { name: Strings.HomeScreen.notifications }));
    expect(router.push).toHaveBeenCalledWith(STACK_ROUTES.notifications);
  });

  it("switches client from the client sheet", async () => {
    await RenderWrapper(<HomeScreen />);
    await fireEvent.press(
      screen.getByRole("button", { name: Strings.HomeScreen.switchClientCode }),
    );
    const next = CLIENT_CODES[1];
    await fireEvent.press(
      screen.getByRole("button", {
        name: `${next.code}${Strings.Common.listSeparator}${next.name}`,
      }),
    );
    expect(screen.getByText(next.farm)).toBeOnTheScreen();
  });
});
