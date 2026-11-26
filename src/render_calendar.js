import { getEntryDocument, getUser, readJournalEntry } from "./calanderdata.js";
import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

let alternate_streak_gradient = ["#F1EA51", "#F1BD51", "#F1AC51", "#E97939", "#E45A2A", "#E1431F", "#DF3619", "#DD2913", "#DB1D0D", "#D91409", "#D70804", "#D60000", "#D20001", "#CE0002", "#CB0002", "#C80002", "#C50003", "#C10004", "#BE0004", "#BB0005", "#BA0005", "#B80005", "#B40006", "#B00006", "#AD0007", "#AD0017", "#AD0027", "#AD0037", "#AD0047", "#AD0057", "#A90079", "#8800A3"]
let streak_gradient = ["#f1ea51", "#f1e44f", "#f2de4c", "#f2d84a", "#f2d247", "#f2cc45", "#f2c642", "#f2c040", "#f1ba3d", "#f1b43b", "#f1ae38", "#f0a836", "#efa133", "#ef9b31", "#ee952e", "#ed8f2c", "#ec8829", "#eb8227", "#ea7b24", "#e87522", "#e76e1f", "#e76e1f", "#e6671c", "#e4601a", "#e35817", "#e15114", "#df4811", "#de400e", "#dc360a", "#da2a06", "#d81c03", "#d60000"]


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