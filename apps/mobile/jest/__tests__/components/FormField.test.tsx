import { screen } from '@testing-library/react-native';

import { CustomText, FormField } from '../../../src/components';
import { RenderWrapper } from '../../Wrapper';

describe('FormField', () => {
  it('renders the label above its control', async () => {
    await RenderWrapper(
      <FormField label="Gender">
        <CustomText>control</CustomText>
      </FormField>
    );
    const texts = screen.getAllByText(/.+/).map((node) => node.props.children);
    expect(texts).toEqual(['Gender', 'control']);
  });

  it('renders the error under the control', async () => {
    await RenderWrapper(
      <FormField error="Required" label="Gender">
        <CustomText>control</CustomText>
      </FormField>
    );
    const texts = screen.getAllByText(/.+/).map((node) => node.props.children);
    expect(texts).toEqual(['Gender', 'control', 'Required']);
  });
});
