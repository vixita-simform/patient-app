import {
  doctorProfileDummyData,
  findADoctorDummyData,
  getDoctorProfileDetails
} from '../../../src/constants';

describe('getDoctorProfileDetails', () => {
  it('returns the profile for a known id', () => {
    expect(getDoctorProfileDetails('doc_204')).toBe(doctorProfileDummyData.doc_204);
  });

  it('has a profile for every listed doctor', () => {
    findADoctorDummyData.doctors.forEach(({ id }) =>
      expect(getDoctorProfileDetails(id)).toBeDefined()
    );
  });

  it.each(['doc_missing', 'constructor', '__proto__', 'hasOwnProperty', ''])(
    'returns undefined for %p',
    (id) => {
      expect(getDoctorProfileDetails(id)).toBeUndefined();
    }
  );
});
