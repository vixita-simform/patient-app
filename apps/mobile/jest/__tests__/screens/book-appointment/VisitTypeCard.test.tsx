import { screen, userEvent } from "@testing-library/react-native";

import { VideoIcon } from "../../../../src/assets/icons";
import { Strings, VISIT_MODE } from "../../../../src/constants";
import { VisitTypeCard } from "../../../../src/screens/book-appointment/components";
import { theme } from "../../../../src/theme";
import { RenderWrapper } from "../../../Wrapper";

const title = Strings.Common.videoCall;

const renderCard = (active: boolean, onPress = jest.fn()) =>
  RenderWrapper(
    <VisitTypeCard
      active={active}
      Icon={VideoIcon}
      iconColor={theme.colors.blue}
      id={VISIT_MODE.video}
      subtitle={Strings.BookAppointmentScreen.fromHome}
      title={title}
      onPress={onPress}
    />,
  );

describe("VisitTypeCard", () => {
  it.each([true, false])("matches the snapshot when active=%p", async (active) => {
    await renderCard(active);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each([true, false])("reports checked=%p to accessibility", async (active) => {
    await renderCard(active);
    const radio = screen.getByRole("radio", { name: title });
    if (active) {
      expect(radio).toBeChecked();
    } else {
      expect(radio).not.toBeChecked();
    }
  });

  it("passes its visit mode to onPress", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderCard(false, onPress);
    await user.press(screen.getByRole("radio", { name: title }));
    expect(onPress).toHaveBeenCalledWith(VISIT_MODE.video);
  });
});
