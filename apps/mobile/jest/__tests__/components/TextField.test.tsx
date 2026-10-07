import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { CustomText, TextField } from '../../../src/components';
import { Colors } from '../../../src/theme';
import { RenderWrapper } from '../../Wrapper';

const LABEL = 'Patient ID';

/** Border colour of the nearest bordered ancestor of the TextInput (the field container). */
const borderColorOf = (): unknown => {
  let node = screen.getByLabelText(LABEL).parent;

  while (node) {
    const color = StyleSheet.flatten(node.props.style)?.borderColor;

    if (color) {
      return color;
    }
    node = node.parent;
  }
  return undefined;
};

describe('TextField', () => {
  describe('editable', () => {
    it('matches the snapshot with leading content', async () => {
      await RenderWrapper(
        <TextField
          label={LABEL}
          leading={<CustomText>+91</CustomText>}
          placeholder="e.g. CW-102938"
          value=""
          onChangeText={jest.fn()}
        />
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it('labels the input with the field label and reports edits', async () => {
      const user = userEvent.setup();
      const onChangeText = jest.fn();
      await RenderWrapper(
        <TextField label={LABEL} trailingText="98250 11223" value="" onChangeText={onChangeText} />
      );
      const input = screen.getByLabelText(LABEL);
      expect(input).toBeEnabled();
      expect(screen.queryByRole('button')).not.toBeOnTheScreen();
      expect(screen.getByText('98250 11223')).toBeOnTheScreen();
      await user.type(input, 'A');
      expect(onChangeText).toHaveBeenCalledWith('A');
    });

    it('highlights the border on focus and calls onBlur when focus leaves', async () => {
      const onBlur = jest.fn();
      await RenderWrapper(<TextField label={LABEL} value="" onBlur={onBlur} />);
      expect(borderColorOf()).toBe(Colors.light.line);

      await fireEvent(screen.getByLabelText(LABEL), 'focus');
      expect(borderColorOf()).toBe(Colors.light.green);

      await fireEvent(screen.getByLabelText(LABEL), 'blur');
      expect(borderColorOf()).toBe(Colors.light.line);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('shows the error message and the error border', async () => {
      await RenderWrapper(<TextField error="Enter your patient ID" label={LABEL} value="" />);
      expect(screen.getByText('Enter your patient ID')).toBeOnTheScreen();
      expect(borderColorOf()).toBe(Colors.light.coral);
    });
  });

  describe('pressable', () => {
    it('labels only the button and opens on press', async () => {
      const user = userEvent.setup();
      const onPress = jest.fn();
      await RenderWrapper(<TextField label={LABEL} value="14 Mar 1992" onPress={onPress} />);
      expect(screen.getAllByLabelText(LABEL)).toHaveLength(1);
      const button = screen.getByRole('button', { name: LABEL });
      expect(button).toHaveAccessibilityValue({ text: '14 Mar 1992' });
      await user.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('keeps the inner input read-only', async () => {
      await RenderWrapper(<TextField label={LABEL} value="14 Mar 1992" onPress={jest.fn()} />);
      expect(
        screen.getByDisplayValue('14 Mar 1992', { includeHiddenElements: true }).props.editable
      ).toBe(false);
    });
  });
});
