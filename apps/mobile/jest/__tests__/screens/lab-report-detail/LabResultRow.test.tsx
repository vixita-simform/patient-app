import { screen } from '@testing-library/react-native';

import { STATUS_BADGE_TONE, Strings } from '../../../../src/constants';
import { LabResultRow } from '../../../../src/screens/lab-report-detail/components';
import type { LabResultRowData } from '../../../../src/screens/lab-report-detail/LabReportDetailScreenTypes';
import { RenderWrapper } from '../../../Wrapper';

const result: LabResultRowData = {
  id: 'hemoglobin',
  name: 'Hemoglobin',
  value: 13.5,
  unit: 'g/dL',
  normalMin: 12,
  normalMax: 16,
  status: STATUS_BADGE_TONE.green,
  statusLabel: Strings.LabReportDetailScreen.normal,
  markerPercent: 50
};

describe('LabResultRow', () => {
  it('matches the snapshot', async () => {
    await RenderWrapper(<LabResultRow isDivided={false} result={result} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders the result name, status label and unit', async () => {
    await RenderWrapper(<LabResultRow isDivided result={result} />);
    expect(screen.getByText(result.name)).toBeOnTheScreen();
    expect(screen.getByText(result.statusLabel)).toBeOnTheScreen();
    expect(screen.getByText(result.unit)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${Strings.LabReportDetailScreen.normalRangePrefix} 12${Strings.Common.rangeSeparator}16`
      )
    ).toBeOnTheScreen();
  });

  it('groups large values with Indian digit grouping', async () => {
    await RenderWrapper(<LabResultRow isDivided result={{ ...result, value: 74000 }} />);
    expect(screen.getByText(/74,000/)).toBeOnTheScreen();
  });
});
