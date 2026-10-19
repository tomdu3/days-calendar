/**
 * Get the date from a day object
 * @param {number} year - The year
 * @param {string} monthName - The name of the month
 * @param {string} dayName - The name of the day
 * @param {string} occurrence - The occurrence of the day (first, second, third, fourth, last)
 * @returns {Date} - The date
 */
export function getDateFromDaysObject(year, monthName, dayName, occurrence) {
  // Constants for months in a year, days of the week, and occurrences of the day of the week in a month for date calculation
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const occurrenceNumbers = { first: 1, second: 2, third: 3, fourth: 4 };

  // Get the index of the month and day of the week
  const monthIndex = monthNames.indexOf(monthName);
  const targetWeekday = dayNames.indexOf(dayName);

  if (monthIndex === -1) throw new Error(`Unknown month: ${monthName}`);
  if (targetWeekday === -1) throw new Error(`Unknown weekday: ${dayName}`);

  // Find the number of days in the month
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  // Calculate the day of the month based on the occurrence
  // If the occurrence is "last", find the last occurrence of the day of the week
  if (occurrence === "last") {
    const lastWeekday = new Date(
      Date.UTC(year, monthIndex, daysInMonth),
    ).getUTCDay();
    const dayOfMonth = daysInMonth - ((lastWeekday - targetWeekday + 7) % 7);
    return new Date(Date.UTC(year, monthIndex, dayOfMonth));
  }

  const n = occurrenceNumbers[occurrence];
  if (!n) throw new Error(`Unknown occurrence: ${occurrence}`);

  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const firstOccurrence = 1 + ((targetWeekday - firstWeekday + 7) % 7);
  const dayOfMonth = firstOccurrence + 7 * (n - 1);
  if (dayOfMonth > daysInMonth) {
    throw new Error(`No ${occurrence} ${dayName} in ${monthName} ${year}`);
  }

  return new Date(Date.UTC(year, monthIndex, dayOfMonth));
}

/**
 * Get all occurrences of a day in a specific month and year.
 * @param {number} year - The year
 * @param {string} monthName - The name of the month
 * @param {Array<Object>} days - The list of days to get the occurrences for
 * @returns {Array<Object>} - The occurrences of the day in the specified month and year
 */
export function getOccurencesForTheMonth(year, monthName, days) {
  // Filter the days to get only the ones for the specified month
  return days
    .filter((day) => day.monthName === monthName)
    .map((day) => {
      const date = getDateFromDaysObject(
        year,
        day.monthName,
        day.dayName,
        day.occurrence,
      );
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        name: day.name,
      };
    });
}