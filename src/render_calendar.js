import { getEntryDocument, getUser, readJournalEntry } from "./calanderdata.js";
import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

let streak_gradient2 = ["F1EA51", "EEE250", "EBDB4F", "E8D34E", "E5CB4D", "E1C44C", "DEBC4B", "DBB44A", "D8AD49", "D5A548", "D29D47", "CF9646", "CC8E45", "C98644", "C67F43", "C27743", "BF7042", "BC6841", "B96040", "B6593F", "B3513E", "B0493D", "AD423C", "AA3A3B", "A7323A", "A32B39", "A02338", "9D1B37", "9A1436", "970C35", "940934"]
let streak_gradient = ["#f1ea51", "#f1da51", "#f1c251", "#f19251", "#f15156"]

let date_info = new Date()
const current_date = date_info.getDate()
const current_month = date_info.getMonth() + 1
const current_year = date_info.getFullYear()

let currentUser = null;

let selected_day = undefined
let selected_month = current_month
let selected_year = current_year

function getMonthName(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1]
}

function getDaysInMonth(month) {
    return new Date(selected_year, month, 0).getDate()
}

function firstDayOfWeekOfMonth(month) {
    return new Date(selected_year, month - 1, 1).getDay()
}

const grid = document.getElementById('calendar-grid')
const month_name = document.getElementById('month-name')
const year_name = document.getElementById('year-name')
const day_name = document.getElementById('day-name')

function onCellInteraction(event, id) {
    if (event.type === 'click') {
        console.log("click")
        let selected_cell = document.getElementById(id)

        // Immediately update the selected cell's highlight
        selected_cell.classList.remove("selected-cell");
        selected_cell.classList.add("selected-cell");

        selected_day = Number(selected_cell.querySelector(".cell-date").innerHTML)

        let selectedDate = `${selected_year}-${String(selected_month).padStart(2, '0')}-${String(selected_day).padStart(2, '0')}`

        document.dispatchEvent(new CustomEvent('calendar-day-selected', {
            detail: { date: selectedDate }
        }))

        document.dispatchEvent(new CustomEvent('highlight-cells-with-data', {
            detail: { date: selectedDate, total_days: getDaysInMonth(selected_month)}
        }))

        renderGrid(selected_day, currentUser)
    } else if (event.type === 'mousedown') {
        console.log("mousedown")
    } else if (event.type === 'mouseup') {
        console.log("mouseup")
    } else if (event.type === 'mouseover') {
        console.log("mouseover")
    }
}

async function renderGrid(selected_highlighted_day, user) {
    console.log(user.uid);

    let days_in_month = getDaysInMonth(selected_month)
    let empty_days_in_month = firstDayOfWeekOfMonth(selected_month)
    let total_calendar_cells = days_in_month + empty_days_in_month
    let total_calendar_rows = Math.ceil(total_calendar_cells / 7)

    month_name.innerHTML = getMonthName(selected_month)
    year_name.innerHTML = String(selected_year)
    // day_name.innerHTML = String(selected_day - empty_days_in_month)

    grid.style.gridTemplateRows = `repeat(${total_calendar_rows}, 1fr)`

    // Get all dates in the selected month
    const dates = [];

    for (let i = 1; i <= days_in_month; i++) {
        const date = `${selected_year}-${String(selected_month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        dates.push({
            date: date,
            day: i
        });
    }

    // Retrieve all journal entries simultaneously
    const snapshots = await Promise.all(
        dates.map(({ date }) =>
            getDoc(getEntryDocument(user.uid, date))
        )
    );

    // Keep track of which days contain journal entries
    const datesWithData = new Set();

    snapshots.forEach((snapshot, index) => {
        if (snapshot.exists() && snapshot.data().text) {
            datesWithData.add(dates[index].day);
        }
    });

    grid.replaceChildren();

    let streak = 0

    for (let i = 0; i < total_calendar_cells; i++) {
        const cell = document.createElement('div')
        let first_day_of_year = new Date(selected_year, 0, 1)
        let current_day_of_year = new Date(selected_year, selected_month - 1, (i + 1 - empty_days_in_month))
        cell.className = 'cell'
        cell.id = String(Math.round((current_day_of_year - first_day_of_year) / (1000 * 3600 * 24) + 1)) // First day of 0 is 1 and not 0

        if (i >= empty_days_in_month) {
            cell.classList.add('calendar-day')
            const cell_date = document.createElement('p')
            cell_date.className = 'cell-date'
            cell_date.innerText = String(i + 1 - empty_days_in_month)
            cell.appendChild(cell_date)
        }

        // let selected_date = `${selected_year}-${String(selected_month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
        // console.log(selected_date)
        // let cell_has_data = getEntryDocument(user, selected_date)
        // console.log(cell_has_data.text)
        // console.log(getUser().uid)
        // const snapshot = await getDoc(getEntryDocument(user, selected_date));
        // cell_has_data = snapshot.exists() ? snapshot.data().text : "";
        // console.log(cell_has_data)

        const day = i + 1 - empty_days_in_month;

        if (datesWithData.has(day)) {
            streak += 1

            cell.classList.add('cell-has-data');

            cell.style.color = streak_gradient[streak]
        } else {
            streak = 0
        }

        if (selected_month === current_month && selected_year === current_year && (i + 1 - empty_days_in_month) === current_date) {
            cell.classList.add('cell-today')
        }

        if (selected_day === day && selected_highlighted_day !== undefined) {
            cell.classList.add('cell-selected')
        } // else if (cell_has_data.converter !== null) {
            // cell.classList.add('cell-has-data')
        // }

        cell.addEventListener("mousedown", function (event) {
            onCellInteraction(event, cell.id)
        })

        cell.addEventListener("mouseup", function (event) {
            onCellInteraction(event, cell.id)
        })

        cell.addEventListener("click", function (event) {
            onCellInteraction(event, cell.id)
        })

        cell.addEventListener('mouseover', function (event) {
            onCellInteraction(event, cell.id)
        });

        grid.appendChild(cell)
    }
}

function changeMonth(increment) {
    selected_month += increment

    if (selected_month === current_month) {
        selected_day = current_date
    } else {
        selected_day = 1
    }

    if (selected_month > 12) {
        selected_year += 1
        selected_month -= 12
    } else if (selected_month < 1) {
        selected_year -= 1
        selected_month += 12
    }

    renderGrid(undefined, currentUser)
}

function changeYear(increment) {
    selected_year += increment

    renderGrid(undefined, currentUser)
}

/*
function changeDay(increment) {
    selected_day += increment
    console.log(selected_day) // Date go-to
    console.log(getDaysInMonth(selected_month)) // Total days in a month
    console.log(selected_year) // the year in selection

    if (selected_day > getDaysInMonth(selected_month) + firstDayOfWeekOfMonth(selected_month)) { // if day goes higher than it can,
        console.log("Add one month")
        selected_month += 1 // go to next month
        selected_day = firstDayOfWeekOfMonth(selected_month) + 1 // day starts at first day selected month
    } else if (selected_day < firstDayOfWeekOfMonth(selected_month) + 1) {
        console.log("Minus one month")
        selected_month -= 1
        selected_day = getDaysInMonth(selected_month) + firstDayOfWeekOfMonth(selected_month)
    }

    if (selected_month > 12) {
        selected_year += 1
        selected_month = 1
        selected_day = firstDayOfWeekOfMonth(selected_month) + 1
    } else if (selected_month < 1) {
        selected_year -= 1
        selected_month = 12
        selected_day = getDaysInMonth(selected_month) + firstDayOfWeekOfMonth(selected_month)
    }

    renderGrid(selected_day, currentUser)
}
 */

async function initializeCalendar() {
    currentUser = await getUser();

    if (!currentUser) {
        console.log("No user is signed in.");
        return;
    }

    console.log("Signed in as:", currentUser.uid);

    await renderGrid(selected_day, currentUser);
}

initializeCalendar();

window.changeMonth = changeMonth;
window.changeYear = changeYear;