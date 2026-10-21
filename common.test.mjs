import { getDateFromDaysObject, getOccurencesForTheMonth } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";
import days from "./days.json" with { type: "json" };

// Tests for getDateFromDaysObject function
test("getDateFromDaysObject for Ada Lovelace Day is correct", () => {
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "October", "Tuesday", "second"),
    new Date(Date.UTC(2024, 9, 8)), // Second Tuesday is 8th of October 2024
  );
  assert.deepStrictEqual(
    getDateFromDaysObject(2025, "October", "Tuesday", "second"),
    new Date(Date.UTC(2025, 9, 14)), // Second Tuesday is 14th of October 2025
  );
});

test("getDateFromDaysObject for last occurrence of day of week is correct", () => {
  assert.deepStrictEqual(
    getDateFromDaysObject(2024, "October", "Tuesday", "last"),
    new Date(Date.UTC(2024, 9, 29)), // Last Tuesday is 29th of October 2024
  );
});

test("getDateFromDaysObject throws error when month not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "Unknown", "Tuesday", "second"),
  );
});

test("getDateFromDaysObject throws error when day of week not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "October", "Unknown", "second"),
  );
});

test("getDateFromDaysObject throws error when occurrence not found", () => {
  assert.throws(() =>
    getDateFromDaysObject(2024, "October", "Tuesday", "fifth"),
  );
});

// Tests for getOccurencesForTheMonth function

test("getOccurencesForTheMonth for October 2024 is correct", () => {
  assert.deepStrictEqual(getOccurencesForTheMonth(2024, "October", days), [
    { year: 2024, month: 10, day: 8, name: "Ada Lovelace Day" }, // Second Tuesday is 8th of October 2024
    { year: 2024, month: 10, day: 25, name: "World Lemur Day" }, // Last Friday is 25th of October 2024
  ]);
});

test("getOccurencesForTheMonth for October 2025 is correct", () => {
  assert.deepStrictEqual(getOccurencesForTheMonth(2025, "October", days), [
    { year: 2025, month: 10, day: 14, name: "Ada Lovelace Day" }, // Second Tuesday is 14th of October 2025
    { year: 2025, month: 10, day: 31, name: "World Lemur Day" }, // Last Friday is 31st of October 2025
  ]);
});

test("getOccurencesForTheMonth for May 2025 is correct", () => {
  assert.deepStrictEqual(getOccurencesForTheMonth(2025, "May", days), [
    {
      year: 2025,
      month: 5,
      day: 10, // Second Saturday is 10th of May 2025
      name: "International Binturong Day",
    },
  ]);
});

test("getOccurencesForTheMonth for January 2025 is correct", () => {
  assert.deepStrictEqual(getOccurencesForTheMonth(2025, "January", days), []);
});

test("getOccurencesForTheMonth for August 2026 is correct", () => {
  const newDays = [
    {
      name: "Summer Bank Holiday",
      monthName: "August",
      dayName: "Monday",
      occurrence: "last",
    },
  ];
  assert.deepStrictEqual(getOccurencesForTheMonth(2026, "August", newDays), [
    {
      year: 2026,
      month: 8,
      day: 31, // Last Monday is 31st of August 2026
      name: "Summer Bank Holiday",
    },
  ]);
});
