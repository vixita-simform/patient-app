import { screen, userEvent } from '@testing-library/react-native';

import { Strings } from '../../../../src/constants';
import { TagList } from '../../../../src/screens/personal-and-medical-info/components';
import { RenderWrapper } from '../../../Wrapper';

const { addAllergy, removeAllergy } = Strings.PersonalAndMedicalInfoScreen;
const TAGS = [
  { id: 'penicillin', label: 'Penicillin' },
  { id: 'peanuts', label: 'Peanuts' }
];

const renderTagList = (onRemove = jest.fn(), onAdd = jest.fn()) =>
  RenderWrapper(
    <TagList
      addLabel={addAllergy}
      removeLabel={removeAllergy}
      tags={TAGS}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );

describe('TagList', () => {
  it('renders every tag and the add chip', async () => {
    await renderTagList();
    ['Penicillin', 'Peanuts', addAllergy].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen()
    );
  });

  it('removes a tag by id', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    await renderTagList(onRemove);
    await user.press(screen.getByRole('button', { name: `${removeAllergy} Peanuts` }));
    expect(onRemove).toHaveBeenCalledWith('peanuts');
  });

  it('calls onAdd from the labelled add chip', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    await renderTagList(jest.fn(), onAdd);
    await user.press(screen.getByRole('button', { name: addAllergy }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
