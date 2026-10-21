# Days calendar project

- [Deployed link](https://day-calendar-jorvan-tom.netlify.app/)

- [GitHub repo](https://github.com/tomdu3/days-calendar)

There are some commemorative days which occur annually, but not on a fixed date.

For example, Ada Lovelace Day happens on the second Tuesday every October.

The _date_ that it occurs is different every year. But it has a fixed pattern.

This project uses a JSON file ([`days.json`](./days.json)) which contains descriptions of several of these days.

The goal of this project is to present this data usefully to users. The data is displayed in a calendar view, where each day is a rectangle. Each row of rectangles shows one week. The first column shows Sundays. The first day of the month is shown in the first row.

The occurrences are being displayed dynamically in the corresponding day of the month cell.

The other functionality of the project includes a script which creates an `ics` file of the calculated dates of the occurrences for the years from 2020 until 2030 (inclusive) which can be later imported by a Calendar app like Google Calendar, Outlook Calendar, Apple Calendar, etc. More information about `ICS File` and its format can be found on [text-2-ics.com](https://www.text-2-ics.com/blog/ics-file-format-structure-guide)

## How to run project locally:

To run this project locally, you need to have Node.js installed.

1. Open your terminal
2. Navigate to the project directory
3. Run `npm install`
4. Run `npx serve`
5. Open `http://localhost:3000` (or the URL shown in the terminal) in your browser.

To run tests locally, run `npm test` in the terminal.

To generate `ics` file locally, run `npm run generate:ical` in the terminal.
The `ics` file will be saved as `days.ics` in the project directory.

## Contributors

- [Jorvan White](https://github.com/JorvanW)
- [Tomislav Dukez](https://github.com/tomdu3)
