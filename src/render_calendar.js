let date_info = new Date()
const current_day_of_week = date_info.getDay()
const current_date = date_info.getDate()
const current_month = date_info.getMonth() + 1
const current_year = date_info.getFullYear()

let selected_day_of_week = current_day_of_week
let selected_day = current_date
let selected_month = current_month
let selected_year = current_year

function getMonthName(month) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]
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
        const day = Number(event.currentTarget.id)
        if (!Number.isInteger(day) || day < 1 || day > getDaysInMonth(selected_month)) {
            return
        }

        const selectedDate = `${selected_year}-${String(selected_month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        document.dispatchEvent(new CustomEvent('calendar-day-selected', {
            detail: { date: selectedDate }
        }))
        console.log("click")
        let selected_cell = document.getElementById(id)
        selected_day = Number(selected_cell.querySelector(".cell-date").innerHTML) + firstDayOfWeekOfMonth(selected_month)
        renderGrid(selected_day)
    } else if (event.type === 'mousedown') {
        console.log("mousedown")
    } else if (event.type === 'mouseup') {
        console.log("mouseup")
    }
}

function renderGrid(selected_highlighted_day) {
    let days_in_month = getDaysInMonth(selected_month)
    let empty_days_in_month = firstDayOfWeekOfMonth(selected_month)
    let total_calendar_cells = days_in_month + empty_days_in_month
    let total_calendar_rows = Math.ceil(total_calendar_cells / 7)

    month_name.innerHTML = getMonthName(selected_month)
    year_name.innerHTML = String(selected_year)
    day_name.innerHTML = String(selected_day - empty_days_in_month)

    grid.replaceChildren()

    grid.style.gridTemplateRows = `repeat(${total_calendar_rows}, 1fr)`

    for (let i = 0; i < total_calendar_cells; i++) {
        const cell = document.createElement('div')
        let first_day_of_year = new Date(selected_year, 0, 1)
        let current_day_of_year = new Date(selected_year, selected_month - 1, (i + 1 - empty_days_in_month))
        cell.className = 'cell'
        cell.id = String(Math.round((current_day_of_year - first_day_of_year) / (1000 * 3600 * 24) + 1)) // First day of 0 is 1 and not 0

        if (i >= empty_days_in_month) {
            const cell_date = document.createElement('p')
            cell_date.className = 'cell-date'
            cell_date.innerText = String(i + 1 - empty_days_in_month)
            cell.appendChild(cell_date)
        }

        if (selected_month === current_month && selected_year === current_year && (i + 1 - empty_days_in_month) === current_date) {
            cell.classList.add('cell-today')
        } else if (selected_day === (i + 1)) {
            cell.classList.add('cell-selected')
        }

        cell.addEventListener("mousedown", function (event) {
            onCellInteraction(event, cell.id)
        })

        cell.addEventListener("mouseup", function (event) {
            onCellInteraction(event, cell.id)
        })

        cell.addEventListener("click", function (event) {
            onCellInteraction(event, cell.id)
        })

        grid.appendChild(cell)
    }
}

function changeMonth(increment) {
    selected_month += increment

    if (selected_month === current_month) {
        selected_day = current_date
    } else {
        selected_day = firstDayOfWeekOfMonth(selected_month) + 1
    }

    if (selected_month > 12) {
        selected_year += 1
        selected_month -= 12
    } else if (selected_month < 1) {
        selected_year -= 1
        selected_month += 12
    }

    renderGrid()
}

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

    renderGrid(selected_day)
}

renderGrid()