import assert from "node:assert";
import test from "node:test";
import { readFile, unlink } from "node:fs/promises";
import {
  formatIcalDate,
  getNextDate,
  formatIcalDateTime,
  escapeIcalText,
  slugify,
  foldLine,
  createIcalEvent,
  createIcal,
  generateIcalFile,
} from "./generate-ical.mjs";
import daysData from "./days.json" with { type: "json" };

test("formatIcalDate formats Date into YYYYMMDD string", () => {
  assert.strictEqual(
    formatIcalDate(new Date(Date.UTC(2024, 9, 8))),
    "20241008",
  );
  assert.strictEqual(
    formatIcalDate(new Date(Date.UTC(2025, 0, 5))),
    "20250105",
  );
});

test("getNextDate returns the immediate next calendar day in UTC", () => {
  const start = new Date(Date.UTC(2024, 9, 8));
  const next = getNextDate(start);
  assert.deepStrictEqual(next, new Date(Date.UTC(2024, 9, 9)));

  // Over month boundary
  const monthEnd = new Date(Date.UTC(2024, 9, 31));
  assert.deepStrictEqual(getNextDate(monthEnd), new Date(Date.UTC(2024, 10, 1)));

  // Over year boundary
  const yearEnd = new Date(Date.UTC(2024, 11, 31));
  assert.deepStrictEqual(getNextDate(yearEnd), new Date(Date.UTC(2025, 0, 1)));
});


test("formatIcalDateTime produces RFC 5545 UTC timestamp", () => {
  const d = new Date("2026-10-20T19:08:08.123Z");
  assert.strictEqual(formatIcalDateTime(d), "20261020T190808Z");
});

test("escapeIcalText escapes backslashes, semicolons, commas, and newlines", () => {
  assert.strictEqual(
    escapeIcalText("Hello, World; test\\backslash\nnew line\r\nanother"),
    "Hello\\, World\\; test\\\\backslash\\nnew line\\nanother",
  );
});

test("slugify produces lowercase alphanumeric slug", () => {
  assert.strictEqual(slugify("Ada Lovelace Day"), "ada-lovelace-day");
  assert.strictEqual(
    slugify("International Binturong Day!"),
    "international-binturong-day",
  );
});

test("foldLine leaves lines <= 75 octets untouched", () => {
  const shortLine = "SUMMARY:Ada Lovelace Day";
  assert.strictEqual(foldLine(shortLine), shortLine);
});

test("foldLine folds lines longer than 75 octets using CRLF and space", () => {
  const longLine = "DESCRIPTION:" + "A".repeat(80);
  const folded = foldLine(longLine);
  assert.ok(folded.includes("\r\n "));
  // When continuation spaces and CRLFs are stripped, original text is preserved
  const unfolded = folded.replace(/\r\n /g, "");
  assert.strictEqual(unfolded, longLine);
});

test("createIcalEvent creates a whole-day VEVENT without time components", () => {
  const ada = daysData.find((d) => d.name === "Ada Lovelace Day");
  const event = createIcalEvent(ada, 2024, {
    now: new Date("2026-01-01T00:00:00Z"),
  });

  assert.ok(event.startsWith("BEGIN:VEVENT"));
  assert.ok(event.endsWith("END:VEVENT"));
  assert.ok(event.includes("SUMMARY:Ada Lovelace Day"));
  assert.ok(event.includes("DTSTART;VALUE=DATE:20241008"));
  assert.ok(event.includes("DTEND;VALUE=DATE:20241009"));
  assert.ok(event.includes("TRANSP:TRANSPARENT"));
  assert.ok(event.includes("UID:ada-lovelace-day-2024@days-calendar"));
  assert.ok(event.includes("DTSTAMP:20260101T000000Z"));

  // Must not have time or timezone in DTSTART or DTEND
  assert.ok(!/DT(?:START|END)[^:]*:.*T\d{6}/.test(event));
  assert.ok(!event.includes("TZID"));
  // Must not have recurring rule
  assert.ok(!event.includes("RRULE"));
});

test("createIcal creates valid iCalendar string for 2020 to 2030", () => {
  const ical = createIcal(daysData, 2020, 2030);

  assert.ok(ical.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ical.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ical.includes("VERSION:2.0\r\n"));
  assert.ok(ical.includes("PRODID:-//Cool Dudes Inc//CoolEvents Calendar//EN\r\n"));

  // Check line endings: all newlines in file should be preceded by \r
  const rawLines = ical.split("\n");
  for (let i = 0; i < rawLines.length - 1; i++) {
    assert.ok(
      rawLines[i].endsWith("\r"),
      `Line ${i + 1} does not end with \\r: ${JSON.stringify(rawLines[i])}`,
    );
  }

  // Exactly 55 VEVENT entries (5 days * 11 years)
  const veventStarts = (ical.match(/BEGIN:VEVENT/g) || []).length;
  const veventEnds = (ical.match(/END:VEVENT/g) || []).length;
  assert.strictEqual(veventStarts, 55);
  assert.strictEqual(veventEnds, 55);

  // Must not contain any RRULE
  assert.ok(!ical.includes("RRULE"));
});

test("createIcal throws if startYear is greater than endYear", () => {
  assert.throws(() => createIcal(daysData, 2030, 2020));
});

test("createIcal contains correct dates matching rubric examples", () => {
  const ical = createIcal(daysData, 2020, 2030);

  // October 2020: Ada Lovelace Day on Oct 13, World Lemur Day on Oct 30
  assert.ok(
    ical.includes(
      "SUMMARY:Ada Lovelace Day\r\nDTSTART;VALUE=DATE:20201013\r\nDTEND;VALUE=DATE:20201014",
    ),
  );
  assert.ok(
    ical.includes(
      "SUMMARY:World Lemur Day\r\nDTSTART;VALUE=DATE:20201030\r\nDTEND;VALUE=DATE:20201031",
    ),
  );

  // October 2024: Ada Lovelace Day on Oct 8, World Lemur Day on Oct 25
  assert.ok(
    ical.includes(
      "SUMMARY:Ada Lovelace Day\r\nDTSTART;VALUE=DATE:20241008\r\nDTEND;VALUE=DATE:20241009",
    ),
  );
  assert.ok(
    ical.includes(
      "SUMMARY:World Lemur Day\r\nDTSTART;VALUE=DATE:20241025\r\nDTEND;VALUE=DATE:20241026",
    ),
  );

  // October 2025: Ada Lovelace Day on Oct 14
  assert.ok(
    ical.includes(
      "SUMMARY:Ada Lovelace Day\r\nDTSTART;VALUE=DATE:20251014\r\nDTEND;VALUE=DATE:20251015",
    ),
  );

  // May 2030: International Binturong Day on May 11
  assert.ok(
    ical.includes(
      "SUMMARY:International Binturong Day\r\nDTSTART;VALUE=DATE:20300511\r\nDTEND;VALUE=DATE:20300512",
    ),
  );

  // September 2024: International Vulture Awareness Day on Sep 7
  assert.ok(
    ical.includes(
      "SUMMARY:International Vulture Awareness Day\r\nDTSTART;VALUE=DATE:20240907\r\nDTEND;VALUE=DATE:20240908",
    ),
  );

  // September 2024: International Red Panda Day on Sep 21
  assert.ok(
    ical.includes(
      "SUMMARY:International Red Panda Day\r\nDTSTART;VALUE=DATE:20240921\r\nDTEND;VALUE=DATE:20240922",
    ),
  );
});

test("createIcal works dynamically when new commemorative days are provided", () => {
  const dynamicDays = [
    {
      name: "International Dawn Chorus Day",
      monthName: "May",
      dayName: "Sunday",
      occurrence: "first",
    },
  ];

  const ical = createIcal(dynamicDays, 2024, 2024);
  assert.ok(ical.includes("SUMMARY:International Dawn Chorus Day"));
  // First Sunday of May 2024 is May 5
  assert.ok(
    ical.includes(
      "DTSTART;VALUE=DATE:20240505\r\nDTEND;VALUE=DATE:20240506",
    ),
  );
});

test("generateIcalFile writes days.ics file to disk", async () => {
  const testOutputPath = new URL("./test-days.ics", import.meta.url);
  try {
    await generateIcalFile(testOutputPath, daysData, 2020, 2021);
    const content = await readFile(testOutputPath, "utf-8");
    assert.ok(content.startsWith("BEGIN:VCALENDAR"));
    assert.ok(content.includes("SUMMARY:Ada Lovelace Day"));
  } finally {
    try {
      await unlink(testOutputPath);
    } catch {
      // ignore
    }
  }
});
