import { COUNTRY_CODES, DEFAULT_COUNTRY, getCountryByCode } from "../../../src/constants";

describe("getCountryByCode", () => {
  it("returns the country for a known code", () => {
    const country = getCountryByCode("GB");
    expect(country.code).toBe("GB");
    expect(country.dialCode).toBe("+44");
  });

  it("finds every listed country by its own code", () => {
    COUNTRY_CODES.forEach((country) => expect(getCountryByCode(country.code)).toBe(country));
  });

  it.each(["XX", "", "in"])("falls back to the default country for %p", (code) => {
    expect(getCountryByCode(code)).toBe(DEFAULT_COUNTRY);
  });
});
