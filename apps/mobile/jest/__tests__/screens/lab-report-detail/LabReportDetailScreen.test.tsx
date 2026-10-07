import { screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { labReportDetailDummyData, Strings } from '../../../../src/constants';
import { LabReportDetailScreen } from '../../../../src/screens';
import { RenderWrapper } from '../../../Wrapper';

const mockedParams = jest.mocked(useLocalSearchParams);

describe('LabReportDetailScreen', () => {
  afterEach(() => mockedParams.mockReturnValue({}));

  it('renders a known report with its alert and results', async () => {
    mockedParams.mockReturnValue({ id: 'rec_cbc' });
    await RenderWrapper(<LabReportDetailScreen />);
    const report = labReportDetailDummyData.rec_cbc;
    [
      report.title,
      'Thu, 24 Sep, 8:10 AM',
      report.orderedByDoctorName,
      report.reportId,
      report.alertMessage
    ].forEach((text) => expect(screen.getByText(text)).toBeOnTheScreen());
    report.results.forEach(({ name }) => expect(screen.getByText(name)).toBeOnTheScreen());
    expect(screen.queryByText(Strings.LabReportDetailScreen.notFound)).not.toBeOnTheScreen();
  });

  it('renders Share and Download PDF disabled until a backend exists', async () => {
    mockedParams.mockReturnValue({ id: 'rec_cbc' });
    await RenderWrapper(<LabReportDetailScreen />);
    expect(
      screen.getByRole('button', { name: Strings.LabReportDetailScreen.share })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: Strings.LabReportDetailScreen.downloadPdf })
    ).toBeDisabled();
  });

  it('shows the not-found text for an unknown id', async () => {
    mockedParams.mockReturnValue({ id: 'rec_missing' });
    await RenderWrapper(<LabReportDetailScreen />);
    expect(screen.getByText(Strings.LabReportDetailScreen.notFound)).toBeOnTheScreen();
    expect(screen.queryByText(Strings.LabReportDetailScreen.sampleCollected)).not.toBeOnTheScreen();
  });
});
