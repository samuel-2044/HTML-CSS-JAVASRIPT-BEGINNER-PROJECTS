// Copyright @makostech

// Initialize date variables
let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

// Select DOM elements
const day = document.querySelector(".calendar-dates");
const currdate = document.querySelector(".calendar-current-date");
const prenexIcons = document.querySelectorAll(".calendar-navigation span");

// Month names array
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Variables for clicked day tracking
let clickedDay = null;
let selectedDayElement = null;

// Function to check if a date is a holiday
const isHoliday = (day, month, year) => {
  const holidays = [
    { month: 0, day: 1 }, // New Year's Day
    { month: 2, day: 8 }, // International Women's Day
    { month: 4, day: 1 }, // International Workers' Day
    { month: 10, day: 11 }, // Armistice Day
    { month: 11, day: 25 }, // Christmas
    { month: 5, day: 1 }, // Madaraka Day (Kenya)
    { month: 11, day: 12 }, // Jamhuri Day (Kenya)
  ];
  return holidays.some(h => h.month === month && h.day === day);
};

// Function to render the calendar
const manipulate = () => {
  // Calculate first day, last date, etc.
  let dayone = new Date(year, month, 1).getDay();
  let lastdate = new Date(year, month + 1, 0).getDate();
  let dayend = new Date(year, month, lastdate).getDay();
  let monthlastdate = new Date(year, month, 0).getDate();

  let lit = "";

  // Add inactive days from previous month
  for (let i = dayone; i > 0; i--) {
    lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
  }

  // Add current month days
  for (let i = 1; i <= lastdate; i++) {
    let isToday = (i === date.getDate()
      && month === new Date().getMonth()
      && year === new Date().getFullYear()) ? "active" : "";

    let highlightClass = (clickedDay === i) ? "highlight" : "";

    let holidayClass = isHoliday(i, month, year) ? "holiday" : "";

    lit += `<li class="${isToday} ${highlightClass} ${holidayClass}" data-day="${i}">${i}</li>`;
  }

  // Add inactive days from next month
  for (let i = dayend; i < 6; i++) {
    lit += `<li class="inactive">${i - dayend + 1}</li>`;
  }

  // Update header and body
  currdate.innerText = `${months[month]} ${year}`;
  day.innerHTML = lit;

  // Add event listeners
  addClickListenersToDays();
};

// Function to add click listeners to active days
function addClickListenersToDays() {
  const allDays = day.querySelectorAll('li:not(.inactive)');
  allDays.forEach(li => {
    li.addEventListener('click', () => {
      // Remove previous highlight
      if (selectedDayElement) {
        selectedDayElement.classList.remove('highlight');
      }

      // Add highlight to clicked day
      li.classList.add('highlight');
      selectedDayElement = li;

      clickedDay = parseInt(li.getAttribute('data-day'));

      console.log('Clicked day:', clickedDay);
    });
  });
}

// Initial render
manipulate();

// Add event listeners to navigation buttons
prenexIcons.forEach(icon => {
  icon.addEventListener("click", () => {
    // Update month
    month = icon.id === "calendar-prev" ? month - 1 : month + 1;

    // Handle year change
    if (month < 0 || month > 11) {
      date = new Date(year, month, new Date().getDate());
      year = date.getFullYear();
      month = date.getMonth();
    } else {
      date = new Date();
    }

    // Reset clicked day
    clickedDay = null;
    selectedDayElement = null;

    // Re-render calendar
    manipulate();
  });
});