import {
  getLabReportDetail,
  LATEST_LAB_REPORT_ID,
  labReportDetailDummyData
} from '../../../src/constants';

describe('getLabReportDetail', () => {
  it('returns the detail for a known id', () => {
    expect(getLabReportDetail(LATEST_LAB_REPORT_ID)).toBe(
      labReportDetailDummyData[LATEST_LAB_REPORT_ID]
    );
    expect(getLabReportDetail(LATEST_LAB_REPORT_ID)?.id).toBe(LATEST_LAB_REPORT_ID);
  });

  it.each(['rec_missing', 'constructor', '__proto__', 'hasOwnProperty', ''])(
    'returns undefined for %p',
    (id) => {
      expect(getLabReportDetail(id)).toBeUndefined();
    }
  );
});
