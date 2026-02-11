function init() {
    const accountJSON = sessionStorage.getItem("account");
    console.log("stared");
    if (!accountJSON)
        return;
    console.log("accountjson found");
    const account = JSON.parse(accountJSON);
    const currentFilePath = window.location.pathname;
    if (currentFilePath.endsWith("dashboard-testing") /*|| currentFilePath.endsWith("dashboard-admin-testing.html")*/) {
        console.log("init dashboard");
        initDashboard(account.accountType, account.reservations);
    }
    else if (currentFilePath.endsWith("my-reservations-testing")) {
        initMyReservation(account.accountType, account.reservations);
    }
    else if (currentFilePath.endsWith("profile-testing")) {
        initProfile(account);
    }
}
function initDashboard(accountType, reservations) {
    initProfileHeader(accountType);
    const noReservations = document.querySelector("#no-reservations");
    if (noReservations)
        noReservations.innerHTML = reservations.length.toString();
    const noUpcoming = document.querySelector("#no-upcoming");
    if (noUpcoming)
        noUpcoming.innerHTML = reservations.filter((reservation) => reservation.status === "Upcoming").length.toString();
    const upcomingReservationTable = document.getElementById("upcoming-reservations");
    if (!upcomingReservationTable)
        return;
    const tbody = upcomingReservationTable.querySelector("tbody");
    tbody === null || tbody === void 0 ? void 0 : tbody.replaceChildren();
    for (const reservation of reservations) {
        const row = document.createElement("tr");
        const labratory = document.createElement("td");
        const dateTimeRequested = document.createElement("td");
        const dateTimeSchedule = document.createElement("td");
        const seat = document.createElement("td");
        const status = document.createElement("td");
        labratory.innerHTML = reservation.labratory;
        dateTimeRequested.innerHTML = formatShortDateTime(reservation.dateTimeRequested);
        dateTimeSchedule.innerHTML = formatShortDateTime(reservation.dateTimeSchedule);
        seat.innerHTML = reservation.seat.toString();
        status.innerHTML = reservation.status;
        reservation.status === "Today" ?
            status.classList.add("warning") : status.classList.add("success");
        row.appendChild(labratory);
        row.appendChild(dateTimeRequested);
        row.appendChild(dateTimeSchedule);
        row.appendChild(seat);
        row.appendChild(status);
        tbody === null || tbody === void 0 ? void 0 : tbody.appendChild(row);
    }
}
function initMyReservation(accountType, reservations) {
    initProfileHeader(accountType);
    const noUpcoming = document.querySelector("#stat-upcoming-badge");
    if (noUpcoming)
        noUpcoming.innerHTML = reservations.filter((reservation) => reservation.status === "Upcoming").length.toString();
    const noToday = document.querySelector("#stat-today-badge");
    if (noToday)
        noToday.innerHTML = reservations.filter((reservation) => reservation.status === "Today").length.toString();
    const noReservations = document.querySelector("#stat-total-badge");
    if (noReservations)
        noReservations.innerHTML = reservations.length.toString();
    const reservationTBody = document.querySelector("#reservations-tbody");
    if (!reservationTBody)
        return;
    reservationTBody.replaceChildren();
    for (const reservation of reservations) {
        const row = document.createElement("tr");
        const id = document.createElement("td");
        const lab = document.createElement("td");
        const dateTimeRequested = document.createElement("td");
        const dateTimeSchedule = document.createElement("td");
        const time = document.createElement("td");
        const seat = document.createElement("td");
        const visibility = document.createElement("td");
        const status = document.createElement("td");
        const action = document.createElement("td"); // empty column
        id.innerHTML = reservation.id;
        lab.innerHTML = reservation.labratory;
        dateTimeSchedule.innerHTML = formatShortDateTime(reservation.dateTimeSchedule);
        dateTimeRequested.innerHTML = formatOneWordTime(reservation.dateTimeSchedule);
        time.innerHTML = `${reservation.time.hour}:${reservation.time.minute.toString().padStart(2, "0")}`;
        seat.innerHTML = reservation.seat.toString();
        visibility.innerHTML = reservation.visibility;
        status.innerHTML = reservation.status;
        if (reservation.status === "Today")
            status.classList.add("warning");
        else
            status.classList.add("success");
        row.append(id, lab, dateTimeRequested, dateTimeSchedule, time, seat, visibility, status, action);
        reservationTBody.appendChild(row);
    }
}
function initProfile(account) {
}
function initProfileHeader(accountType) {
    const userType = document.querySelector("#user-type");
    if (userType)
        userType.innerHTML = accountType;
}
export function formatDateTime(dateTime) {
    const { year, month, day, time } = dateTime;
    const { hour, minute } = time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${month}/${day}/${year}, ${hour12}:${minuteStr}:00 ${ampm}`;
}
export function formatShortDateTime(dt) {
    const dayDiff = computeDayDifferenceFromToday(dt);
    let dayStr;
    if (dayDiff === 0)
        dayStr = "Today";
    else if (dayDiff === 1)
        dayStr = "Tomorrow";
    else if (dayDiff === -1)
        dayStr = "Yesterday";
    else
        dayStr = `${dt.month}/${dt.day}/${dt.year}`;
    const hour = dt.time.hour;
    const minute = dt.time.minute;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${dayStr} · ${hour12}:${minuteStr} ${ampm}`;
}
export function formatOneWordTime(dt) {
    const dayDiff = computeDayDifferenceFromToday(dt);
    let oneWord;
    if (dayDiff === 0)
        oneWord = "Today";
    else if (dayDiff === 1)
        oneWord = "Tomorrow";
    else if (dayDiff === -1)
        oneWord = "Yesterday";
    else
        oneWord = `${dt.month}/${dt.day}/${dt.year}`;
    return oneWord;
}
export function computeDayDifferenceFromToday(dt) {
    const now = new Date();
    const dtDate = new Date(dt.year, dt.month - 1, dt.day, dt.time.hour, dt.time.minute);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const dayDiff = Math.floor((dtDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / oneDayMs);
    return dayDiff;
}
init();
