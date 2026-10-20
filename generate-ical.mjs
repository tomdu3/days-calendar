import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getDateFromDaysObject } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

/**
 * Formats a Date object into an iCalendar DATE value: YYYYMMDD.
 */
export function formatIcalDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Returns the immediate next calendar day in UTC (used for exclusive DTEND in whole-day events).
 */
export function getNextDate(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );
}

/**
 * Formats a Date object into an iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ.
 */
export function formatIcalDateTime(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "") // ISO 8601 format has hyphens and colons which need to be removed for iCalendar
    .replace(/\.\d{3}/, ""); // remove milliseconds - iCalendar doesn't support them
}

/**
 * Escapes characters with special meaning in iCalendar text values (RFC 5545).
 */
export function escapeIcalText(text) {
  return text
    .replace(/\\/g, "\\\\") // escape backslashes
    .replace(/;/g, "\\;") // escape semicolons
    .replace(/,/g, "\\,") // escape commas
    .replace(/\r\n|\r|\n/g, "\\n"); // escape newlines
}

/**
 * Creates a deterministic, URL-friendly slug from a dayName string.
 * @param {string} dayName - The name of the day (dayName in the days.json file)
 * @returns {string} - The slug
 */
export function slugify(dayName) {
  return dayName
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric characters with hyphens
    .replace(/(^-|-$)/g, ""); // remove leading and trailing hyphens
}

/**
 * Folds a content line to a maximum of 75 octets per RFC 5545 Section 3.1.
 */
export function foldLine(line, maxLength = 75) {
  if (Buffer.byteLength(line, "utf8") <= maxLength) {
    return line;
  }
  let result = "";
  let current = line;
  let isFirst = true;
  while (current.length > 0) {
    const limit = isFirst ? maxLength : maxLength - 1;
    let sliceLen = limit;
    while (Buffer.byteLength(current.slice(0, sliceLen), "utf8") > limit) {
      sliceLen--;
    }
    const chunk = current.slice(0, sliceLen);
    result += (isFirst ? "" : "\r\n ") + chunk;
    current = current.slice(sliceLen);
    isFirst = false;
  }
  return result;
}

/**
 * Generates an iCalendar VEVENT block for a single commemorative day in a given year.
 * Produces a "whole day" event without start/end times.
 */
export function createIcalEvent(day, year, options = {}) {
  const startDate = getDateFromDaysObject(
    year,
    day.monthName,
    day.dayName,
    day.occurrence,
  );
  const endDate = getNextDate(startDate);
  const startDateStr = formatIcalDate(startDate);
  const endDateStr = formatIcalDate(endDate);

  const uid = options.uid || `${slugify(day.name)}-${year}@days-calendar`;
  const dtstamp =
    options.dtstamp || formatIcalDateTime(options.now || new Date());
  const summary = escapeIcalText(day.name);

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${summary}`,
    `DTSTART;VALUE=DATE:${startDateStr}`,
    `DTEND;VALUE=DATE:${endDateStr}`,
    "TRANSP:TRANSPARENT",
  ];

  if (day.description) {
    // TODO: keep it if description is implemented
    lines.push(`DESCRIPTION:${escapeIcalText(day.description)}`);
  }

  lines.push("END:VEVENT");

  return lines.map((line) => foldLine(line)).join("\r\n");
}

/**
 * Generates the full iCalendar file content for a list of days across a range of years.
 * No recurring events are used; each occurrence is a separate VEVENT.
 * @param {Array<Object>} days - The list of days to generate the iCalendar for
 * @param {number} startYear - The starting year
 * @param {number} endYear - The ending year
 * @param {Object} options - Optional parameters
 * @returns {string} - The iCalendar content
 */
export function createIcal(
  days,
  startYear = 2020,
  endYear = 2030,
  options = {},
) {
  if (startYear > endYear) {
    throw new Error(`startYear (${startYear}) must be <= endYear (${endYear})`);
  }

  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cool Dudes Inc//CoolEvents Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  const events = [];
  for (let year = startYear; year <= endYear; year++) {
    for (const day of days) {
      events.push(createIcalEvent(day, year, options));
    }
  }

  const footer = ["END:VCALENDAR"];

  return [...header, ...events, ...footer].join("\r\n") + "\r\n";
}

/**
 * Writes the generated iCalendar data to days.ics.
 * @param {string} outputPath - The path to write the iCalendar file to
 * @param {Array<Object>} days - The list of days to generate the iCalendar for
 * @param {number} startYear - The starting year
 * @param {number} endYear - The ending year
 * @returns {Promise<string>} - The path to the generated iCalendar file
 */
export async function generateIcalFile(
  outputPath = new URL("./days.ics", import.meta.url),
  days = daysData,
  startYear = 2020,
  endYear = 2030,
) {
  const icalContent = createIcal(days, startYear, endYear);
  await writeFile(outputPath, icalContent, "utf-8");
  return outputPath;
}

const isMainModule =
  import.meta.main ||
  (process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url));

if (isMainModule) {
  try {
    await generateIcalFile();
    console.log("Successfully generated days.ics");
  } catch (err) {
    console.error("Failed to generate days.ics:", err);
    process.exit(1);
  }
}
