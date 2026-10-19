// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getGreeting } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

// window.onload = function () {
//   document.querySelector("body").innerText =
//     `${getGreeting()} - there are ${daysData.length} known days`;
// };

const monthHeading = document.getElementById("month-heading");
const calendarBody = document.getElementById("calendar-body");

const today = new Date();

const year = today.getFullYear();
const month = today.getMonth();

function renderCalendar(year, month) {
  // Find the weekday of the first day of the month.
  const firstDay = new Date(year, month, 1).getDay();

  // Find how many days the month contains.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate the number of complete weeks needed.
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Display the month and year.
  const date = new Date(year, month, 1);

  monthHeading.textContent = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // Clear any previously rendered calendar.
  calendarBody.replaceChildren();

  let row;

  for (let i = 0; i < totalCells; i++) {
    // Start a new table row every seven cells.
    if (i % 7 === 0) {
      row = document.createElement("tr");
      calendarBody.appendChild(row);
    }

    const cell = document.createElement("td");

    // Work out which day belongs in this cell.
    const day = i - firstDay + 1;

    if (day >= 1 && day <= daysInMonth) {
      const dateString = [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-");

      const time = document.createElement("time");
      time.dateTime = dateString;
      time.textContent = day;

      cell.appendChild(time);
    } else {
      // This cell is padding before or after the month.
      cell.classList.add("empty");
      cell.setAttribute("aria-hidden", "true");
    }

    row.appendChild(cell);
  }
}

// Render the current month on page load.
renderCalendar(year, month);
