/**
 * Whole years between a birth date and `now` (birthday not reached yet counts as one fewer).
 * @param {Date | string} dateOfBirth - birth date, or an ISO 8601 date string.
 * @param {Date} now - reference date; defaults to the current time.
 * @returns {number} age in completed years.
 */
export function getAgeInYears(dateOfBirth: Date | string, now: Date = new Date()): number {
  const birth = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  return now.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
}
