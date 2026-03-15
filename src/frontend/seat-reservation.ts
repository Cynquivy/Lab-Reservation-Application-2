// @ts-nocheck

import { BUILDING_LABELS, getLabLayout, normalizeBuildingCode, parseFloorNumber } from "../shared/labSeatConfig.js";

const ROOM_PARAM = "room";
const DATE_PARAM = "date";
const START_TIME_PARAM = "startTime";
const END_TIME_PARAM = "endTime";

const pageParams = new URLSearchParams(window.location.search);

const room = pageParams.get(ROOM_PARAM) ?? sessionStorage.getItem("room");
const buildingCode = normalizeBuildingCode(pageParams.get("building") ?? sessionStorage.getItem("building"));
const floor = parseFloorNumber(pageParams.get("floor") ?? sessionStorage.getItem("floor"));
const date = pageParams.get(DATE_PARAM) ?? sessionStorage.getItem("date");
const startTime = normalizeTimeParam(pageParams.get(START_TIME_PARAM) ?? sessionStorage.getItem("time") ?? sessionStorage.getItem("startTime"));
const endTime = normalizeTimeParam(pageParams.get(END_TIME_PARAM) ?? sessionStorage.getItem("endTime"));

const displaySeat = document.querySelector(".display-seat");
const headerContainer = document.querySelector(".seat-reservation-information");
const heading = headerContainer?.querySelector("h1");
const description = headerContainer?.querySelector("p");
const reservationCounterSection = document.querySelector(".reservation-counter");

let occupiedSeats = [];
let selectedSeats = new Set();
let refreshTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    const authOkay = await ensureAuthenticated();

    if (!authOkay) {
        return;
    }

    if (!room || !date || !startTime || !endTime || !buildingCode || !floor) {
        renderFatalState("Missing reservation details. Please start from the availability page.");
        return;
    }

    renderHeader();
    renderControls();
    attachControlEvents();
    await refreshSeatMap();
    startAutoRefresh();
});

window.addEventListener("beforeunload", () => {
    if (refreshTimer) {
        window.clearInterval(refreshTimer);
    }
});

async function ensureAuthenticated() {
    try {
        const response = await fetch("/auth/me");

        if (response.ok) {
            return true;
        }

        window.location.href = "index.html";
        return false;
    } catch (error) {
        renderFatalState("Unable to verify your session. Please log in again.");
        return false;
    }
}

function renderHeader() {
    if (heading) {
        heading.textContent = `${room} - Seat Reservation`;
    }

    if (description) {
        const buildingLabel = BUILDING_LABELS[buildingCode] ?? buildingCode;
        description.textContent = `${buildingLabel}, Floor ${floor} • ${formatDateHeading(date)} • ${formatTimeRange(startTime, endTime)}`;
    }
}

function renderControls() {
    if (!reservationCounterSection) {
        return;
    }

    reservationCounterSection.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.6rem; align-items:flex-start; flex:1;">
            <h1 style="font-size:1.4rem;">Reservation Count: <span id="reservation-counter">0</span></h1>
            <label style="display:flex; align-items:center; gap:0.5rem; color: var(--color-white);">
                <input id="anonymous-toggle" type="checkbox" />
                <span>Make this reservation anonymous</span>
            </label>
            <p id="reservation-message" style="min-height:1.4rem; color: var(--color-white);"></p>
        </div>
        <div style="display:flex; gap:1rem; align-items:center;">
            <button id="reserve-all-button" type="button">Reserve Selected Seats</button>
        </div>
    `;
}

function attachControlEvents() {
    const reserveButton = document.getElementById("reserve-all-button");

    reserveButton?.addEventListener("click", submitReservation);

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".seat")) {
            document.querySelectorAll(".seat-dropdown").forEach((dropdown) => {
                dropdown.style.display = "none";
            });
        }
    });
}

async function refreshSeatMap() {
    try {
        const query = new URLSearchParams({
            room,
            date,
            startTime,
            endTime
        });

        const response = await fetch(`/reservations/occupied?${query.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load occupied seats");
        }

        occupiedSeats = Array.isArray(data) ? data : [];
        removeSelectionsThatBecameOccupied();
        renderSeatMap();
    } catch (error) {
        showMessage(error.message || "Unable to load seat availability", true);
    }
}

function startAutoRefresh() {
    refreshTimer = window.setInterval(refreshSeatMap, 15000);
}

function removeSelectionsThatBecameOccupied() {
    const occupiedSeatNumbers = new Set(occupiedSeats.map((seat) => seat.seatNumber));
    let removedCount = 0;

    selectedSeats.forEach((seatNumber) => {
        if (occupiedSeatNumbers.has(seatNumber)) {
            selectedSeats.delete(seatNumber);
            removedCount += 1;
        }
    });

    if (removedCount > 0) {
        showMessage(`${removedCount} selected seat(s) were just reserved by someone else. Please review your selection.`, true);
    }
}

function renderSeatMap() {
    if (!displaySeat) {
        return;
    }

    const occupiedBySeat = new Map(occupiedSeats.map((seat) => [seat.seatNumber, seat]));
    const layoutRows = getLabLayout(room);
    const rowsMarkup = layoutRows.map(renderLayoutRow.bind(null, occupiedBySeat)).join("");

    displaySeat.innerHTML = `<div class="background"></div>${rowsMarkup}`;
    attachSeatEvents();
    updateCounter();
}

function renderLayoutRow(occupiedBySeat, row) {
    return `
        <div class="display-seat-row ${row.className ?? "row-spread"}">
            ${row.items.map((item) => renderLayoutItem(item, occupiedBySeat)).join("")}
        </div>
    `;
}

function renderLayoutItem(item, occupiedBySeat) {
    if (item.type === "table") {
        const tableClass = item.orientation === "column" ? "table table-col" : "table";
        return `
            <div class="${tableClass}" ${item.style ? `style="${item.style}"` : ""}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect width="700" height="100" fill="var(--color-info-dark)" />
                </svg>
            </div>
        `;
    }

    if (item.type === "seat") {
        return buildSeatMarkup(item.seatNumber, occupiedBySeat.get(item.seatNumber), item.style);
    }

    const containerClass = item.orientation === "column" ? "seat-group-col" : "seat-group";
    return `
        <div class="${containerClass}" ${item.style ? `style="${item.style}"` : ""}>
            ${item.seatNumbers.map((seatNumber) => buildSeatMarkup(seatNumber, occupiedBySeat.get(seatNumber))).join("")}
        </div>
    `;
}

function buildSeatMarkup(seatNumber, occupiedSeat, style = "") {
    const isOccupied = Boolean(occupiedSeat);
    const isSelected = selectedSeats.has(seatNumber);
    const status = isOccupied ? "occupied" : isSelected ? "selected" : "available";

    return `
        <div class="seat" data-seat-number="${seatNumber}" data-status="${status}" ${style ? `style="${style}"` : ""}>
            ${buildSeatSvg(seatNumber, isOccupied, isSelected)}
            <div class="seat-dropdown">
                ${buildSeatDropdown(seatNumber, occupiedSeat, isSelected)}
            </div>
        </div>
    `;
}

function attachSeatEvents() {
    displaySeat?.querySelectorAll(".seat").forEach((seatElement) => {
        seatElement.addEventListener("click", (event) => {
            event.stopPropagation();

            const seatNumber = Number(seatElement.getAttribute("data-seat-number"));
            const status = seatElement.getAttribute("data-status");
            const dropdown = seatElement.querySelector(".seat-dropdown");

            document.querySelectorAll(".seat-dropdown").forEach((otherDropdown) => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.style.display = "none";
                }
            });

            if (status === "occupied") {
                dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
                dropdown.style.flexDirection = "column";
                return;
            }

            if (selectedSeats.has(seatNumber)) {
                selectedSeats.delete(seatNumber);
            } else {
                selectedSeats.add(seatNumber);
            }

            updateCounter();
            renderSeatMap();
        });
    });
}

function buildSeatSvg(seatNumber, isOccupied, isSelected) {
    const fill = isOccupied ? "#F06F65" : isSelected ? "#7380ec" : "#8FC991";

    return `
        <svg viewBox="0 0 100 100">
            <circle r="45" cx="50" cy="50" fill="${fill}" />
            <text class="number" x="50" y="55">${seatNumber}</text>
        </svg>
    `;
}

function buildSeatDropdown(seatNumber, occupiedSeat, isSelected) {
    if (occupiedSeat) {
        const reserverName = occupiedSeat.isAnonymous || !occupiedSeat.user
            ? "Anonymous"
            : `${occupiedSeat.user.firstName} ${occupiedSeat.user.lastName}`;

        const userMarkup = occupiedSeat.isAnonymous || !occupiedSeat.user
            ? `<p>By: ${reserverName}</p>`
            : `<p>By: <a href="profile.html?id=${occupiedSeat.user._id}" class="user">${reserverName}</a></p>`;

        return `
            <p>Status: Reserved</p>
            ${userMarkup}
            <p>${formatTimeRange(occupiedSeat.startTime, occupiedSeat.endTime)}</p>
        `;
    }

    return `
        <p>Status: ${isSelected ? "Selected" : "Available"}</p>
        <p>Seat ${seatNumber}</p>
        <p>${isSelected ? "Click again to remove" : "Click to select"}</p>
    `;
}

function updateCounter() {
    const counterElement = document.getElementById("reservation-counter");

    if (counterElement) {
        counterElement.textContent = String(selectedSeats.size);
    }
}

async function submitReservation() {
    if (selectedSeats.size === 0) {
        showMessage("Select at least one seat before reserving.", true);
        return;
    }

    const reserveButton = document.getElementById("reserve-all-button");
    const anonymousToggle = document.getElementById("anonymous-toggle");

    if (reserveButton) {
        reserveButton.disabled = true;
    }

    try {
        const response = await fetch("/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                building: BUILDING_LABELS[buildingCode] ?? buildingCode,
                floor,
                room,
                date,
                startTime,
                endTime,
                seatNumbers: Array.from(selectedSeats).sort((left, right) => left - right),
                isAnonymous: Boolean(anonymousToggle?.checked)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Reservation failed");
        }

        sessionStorage.setItem("room", room);
        sessionStorage.setItem("date", date);
        sessionStorage.setItem("startTime", startTime);
        sessionStorage.setItem("endTime", endTime);
        showMessage("Reservation created successfully. Redirecting to My Reservations...", false);
        window.location.href = "my-reservations.html";
    } catch (error) {
        showMessage(error.message || "Unable to create reservation", true);
        await refreshSeatMap();
    } finally {
        if (reserveButton) {
            reserveButton.disabled = false;
        }
    }
}

function showMessage(message, isError) {
    const messageElement = document.getElementById("reservation-message");

    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = isError ? "#ffbb55" : "#41f1b6";
    }
}

function renderFatalState(message) {
    if (heading) {
        heading.textContent = "Seat Reservation";
    }

    if (description) {
        description.textContent = message;
    }

    if (displaySeat) {
        displaySeat.innerHTML = `
            <div class="background"></div>
            <p style="position:relative; z-index:1; color:#fff; font-size:1.1rem; padding:2rem;">${message}</p>
        `;
    }

    if (reservationCounterSection) {
        reservationCounterSection.innerHTML = `
            <p style="color:#fff;">${message}</p>
        `;
    }
}

function normalizeTimeParam(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(value.trim())) {
        return value.trim().toUpperCase();
    }

    if (/^\d{1,2}:\d{2}$/.test(value.trim())) {
        const [rawHours, rawMinutes] = value.trim().split(":");
        let hours = Number(rawHours);
        const minutes = rawMinutes.padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }

        return `${hours}:${minutes} ${period}`;
    }

    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).toUpperCase();
    }

    return null;
}

function formatDateHeading(dateValue) {
    const parsedDate = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue;
    }

    return parsedDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function formatTimeRange(startValue, endValue) {
    return `${normalizeTimeParam(startValue) ?? startValue} to ${normalizeTimeParam(endValue) ?? endValue}`;
}
