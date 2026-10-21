// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

// import { getGreeting } from "./common.mjs";
// import daysData from "./days.json" with { type: "json" };

// window.onload = function () {
//   document.querySelector("body").innerText =
//     `${getGreeting()} - there are ${daysData.length} known days`;
// };

const monthHeading = document.getElementById("month-heading");
const calendarBody = document.getElementById("calendar-body");

const today = new Date();
let displayedDate = new Date(today.getFullYear(), today.getMonth(), 1);

function renderCalendar(year, month) {
  // Calculate the first weekday and number of days.
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate the minimum number of cells needed.
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Display the current month and year.
  const date = new Date(year, month, 1);

  monthHeading.textContent = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // Clear existing calendar cells before rendering.
  calendarBody.replaceChildren();

  let row;

  // DOM GENERATION: Create each calendar cell.
  for (let i = 0; i < totalCells; i++) {
    // Create a new row every seven cells.
    if (i % 7 === 0) {
      row = document.createElement("tr");
      calendarBody.appendChild(row);
    }

    // Create an individual rectangle.
    const cell = document.createElement("td");

    // Calculate the day for this cell position.
    const day = i - firstDay + 1;

    if (day >= 1 && day <= daysInMonth) {
      // Create an accessible date element.
      const time = document.createElement("time");

      const dateString = [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-");

      time.dateTime = dateString;
      time.textContent = day;

      // Put the date inside its rectangle.
      cell.appendChild(time);
    } else {
      // Create an empty padding cell.
      cell.classList.add("empty");
      cell.setAttribute("aria-hidden", "true");
    }

    // Add the rectangle to the current row.
    row.appendChild(cell);
  }
  monthSelect.value = month;
  yearSelect.value = year;
}

const previousButton = document.getElementById("previous-month");
const nextButton = document.getElementById("next-month");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");

for (let year = 2020; year <= 2035; year++) {
  const option = document.createElement("option");

  option.value = year;
  option.textContent = year;

  yearSelect.appendChild(option);
}

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

monthNames.forEach((month, index) => {
  const option = document.createElement("option");

  option.value = index;
  option.textContent = month;

  monthSelect.appendChild(option);
});

monthSelect.addEventListener("change", () => {
  const selectedMonth = Number(monthSelect.value);

  displayedDate.setMonth(selectedMonth);

  renderCalendar(displayedDate.getFullYear(), displayedDate.getMonth());
});

yearSelect.addEventListener("change", () => {
  const selectedYear = Number(yearSelect.value);

  displayedDate.setFullYear(selectedYear);

  renderCalendar(displayedDate.getFullYear(), displayedDate.getMonth());
});

renderCalendar(displayedDate.getFullYear(), displayedDate.getMonth());

previousButton.addEventListener("click", () => {
  displayedDate.setMonth(displayedDate.getMonth() - 1);

  renderCalendar(displayedDate.getFullYear(), displayedDate.getMonth());
});

nextButton.addEventListener("click", () => {
  displayedDate.setMonth(displayedDate.getMonth() + 1);

  renderCalendar(displayedDate.getFullYear(), displayedDate.getMonth());
});
