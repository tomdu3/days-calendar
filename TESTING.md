# Project Testing & Evaluation Rubric

## 1. General Requirements (For Everyone)

### Calendar Initial State & Grid Layout (October 2024)

- [ ] Open the calendar and verify it defaults to showing the current month.
- [ ] Navigate to **October 2024** and observe the following layout details:
  - [ ] A calendar grid consisting of 5 rows by 7 columns.
  - [ ] **First row check:** Contains Tuesday, October 1 through Saturday, October 5. Sunday and Monday are either labeled for September 29/30 or left blank.
  - [ ] **Last row check:** Contains Sunday, October 27 through Thursday, October 31. Friday and Saturday are either labeled for November or left blank.

### Specific Date & Event Verifications

- [ ] **October 2024:** Verify that October 8th displays **Ada Lovelace Day** and October 25th displays **World Lemur Day**.
- [ ] **October 2020:** Navigate to October 2020 on the web page and verify:
  - [ ] October 13th: Ada Lovelace Day.
  - [ ] October 30th: World Lemur Day.
- [ ] **May 2030:** Navigate to May 2030 on the web page and verify:
  - [ ] May 11th: International Binturong Day.

### Month Boundary & Padding Verifications

- [ ] Verify that the following months start and end on the specified dates without extra days or padding boxes outside their required weeks:
  - [ ] **2024-12:** Starts on Sunday (no empty days before) and ends on Tuesday (4 empty days after).
  - [ ] **2025-02:** Starts on Saturday (6 empty days before) and ends on Friday (1 empty day after).
  - [ ] **2025-05:** Starts on Thursday (4 empty days before) and ends on Saturday (no empty days after).
  - [ ] **2026-02:** Starts on Sunday (no empty days before) and ends on Saturday (no empty days after).

### Navigation & UI Controls

- [ ] Test previous and next buttons, including at any defined end-points of the month/year selector.
- [ ] If selector end-points exist, verify that previous/next buttons work flawlessly when going beyond those limits.
- [ ] Confirm that the UI never displays placeholder strings such as `"undefined"`, `"null"`, `"NaN"`, or empty strings when the current month or year is rendered anywhere in the interface.
- [ ] Verify that calendar days continue to render correctly during edge-case navigation.
- [ ] Test for jumping directly to a specific month and year.

### Architecture & Code Quality

- [ ] Confirm that the UI is generated via DOM manipulation and that day generation is fully dynamic.
- [ ] Verify that the calendar handles arbitrary additional days added to the data file successfully.
- [ ] Run Lighthouse in **Desktop device mode** across all views on the website and verify a score of **100% for Accessibility**.
- [ ] Confirm that unit tests are written and passing for at least one non-trivial function.
- [ ] Audit the codebase to ensure zero dead code (all written JavaScript and CSS are actively used).

---

## 2. Group Requirements (For Groups of at Least 2)

### iCal Generation & Import

- [ ] Run the supplied script using Node.js to generate the `days.ics` file.
- [ ] Import the generated `days.ics` file into Google Calendar.
- [ ] Verify that all dates and events match the web UI correctly.

### Calendar Event Properties

- [ ] Verify that all imported calendar events are configured as **whole-day events** without specific start/end times.

### Code Sharing & Logic Integrity

- [ ] Verify that date-calculation logic is appropriately shared and reused between the web generator and the iCal generator.
