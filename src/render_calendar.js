
let date_info = new Date()
const current_day_of_week = date_info.getDay()
const current_date = date_info.getDate()
const current_month = date_info.getMonth() + 1
const current_year = date_info.getFullYear()

let selected_day_of_week = current_day_of_week
let selected_month = current_month
let selected_year = current_year

function getDaysInMonth(month) {
    return new Date(selected_year, selected_month, 0).getDate()
}

function firstDayOfWeekOfMonth(month) {
    return new Date(selected_year, selected_month - 1, 1).getDay()
}

const grid = document.getElementById('calendar-grid')
const month_name = document.getElementById('month-name')
const year_name = document.getElementById('year-name')

function renderGrid() {
    month_name.innerHTML = String(selected_month)
    year_name.innerHTML = String(selected_year)

    grid.replaceChildren()

    let days_in_month = getDaysInMonth(selected_month)
    let empty_days_in_month = firstDayOfWeekOfMonth(selected_month)
    let total_calendar_cells = days_in_month + empty_days_in_month
    let total_calendar_rows = Math.ceil(total_calendar_cells / 7)

    grid.style.gridTemplateRows = `repeat(${total_calendar_rows}, 1fr)`

    for (let i = 0; i < total_calendar_cells; i++) {
        const cell = document.createElement('div')
        cell.className = 'cell'

        if (i >= empty_days_in_month) {
            const cell_date = document.createElement('p')
            cell_date.className = 'cell-date'
            cell_date.innerText = String(i + 1 - empty_days_in_month)
            cell.appendChild(cell_date)
        }

        grid.appendChild(cell)
    }
}

function changeMonth(increment) {
    selected_month += increment

    if (selected_month > 12) {
        selected_year += 1
        selected_month -= 12
    } else if (selected_month < 1) {
        selected_year -= 1
        selected_month += 12
    }

    renderGrid()
}

renderGrid()