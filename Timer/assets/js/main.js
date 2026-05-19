// Timing Engine State
let countdownTargetTime = 0; // The timestamp when timer should hit 0
let timeLeft = 0;            // Tracks remaining ms when paused
let timerInterval = null;
let isRunning = false;
let isSet = false;           // Tracks if a timer session has begun

// DOM Elements
const inputContainer = document.getElementById('input-container');
const displayContainer = document.getElementById('display-container');
const display = document.getElementById('display');

const inputHrs = document.getElementById('input-hours');
const inputMins = document.getElementById('input-minutes');
const inputSecs = document.getElementById('input-seconds');

const startStopBtn = document.getElementById('start-stop-btn');
const resetBtn = document.getElementById('reset-btn');
const themeToggle = document.getElementById('theme-toggle');

// ==================== TIME FORMATTING FUNCTION ====================
function formatTime(totalMs) {
    if (totalMs < 0) totalMs = 0;
    
    let hrs = Math.floor(totalMs / 3600000);
    let mins = Math.floor((totalMs % 3600000) / 60000);
    let secs = Math.floor((totalMs % 60000) / 1000);
    let ms = totalMs % 1000;

    const pad = (num, size = 2) => String(num).padStart(size, '0');

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}<span class="ms">.${pad(ms, 3)}</span>`;
}

// ==================== MAIN CORE LOGIC ====================
function updateTimer() {
    const now = Date.now();
    const remaining = countdownTargetTime - now;

    if (remaining <= 0) {
        // Timer Completed
        clearInterval(timerInterval);
        display.innerHTML = "00:00:00<span class=\"ms\">.000</span>";
        
        // Reset states cleanly
        isRunning = false;
        isSet = false;
        startStopBtn.textContent = 'Start';
        resetBtn.disabled = true;
        
        toggleUI(false); // Return UI back to input setup
        
        // Brief delay ensures rendering thread processes DOM before alert modal freezes thread
        setTimeout(() => {
            alert("Time's up!");
        }, 50);
        return;
    }

    display.innerHTML = formatTime(remaining);
}

function startStop() {
    if (!isRunning) {
        if (!isSet) {
            // First time hitting start: Parse inputs
            const hrs = parseInt(inputHrs.value || 0) * 3600000;
            const mins = parseInt(inputMins.value || 0) * 60000;
            const secs = parseInt(inputSecs.value || 0) * 1000;
            
            timeLeft = hrs + mins + secs;

            // Enforce input guard constraint
            if (timeLeft <= 0) {
                alert("Please set a valid duration first.");
                return;
            }

            isSet = true;
            toggleUI(true); // Swap input displays for the active timer layout
        }

        // Run / Resume action
        countdownTargetTime = Date.now() + timeLeft;
        timerInterval = setInterval(updateTimer, 10); // Check every 10ms for smooth millisecond updates
        
        startStopBtn.textContent = 'Pause';
        resetBtn.disabled = false;
        isRunning = true;
    } else {
        // Pause action
        clearInterval(timerInterval);
        timeLeft = countdownTargetTime - Date.now();
        
        startStopBtn.textContent = 'Resume';
        isRunning = false;
    }
}

function reset() {
    clearInterval(timerInterval);
    
    // Clear all technical states
    isRunning = false;
    isSet = false;
    timeLeft = 0;
    countdownTargetTime = 0;

    // Reset layout defaults
    startStopBtn.textContent = 'Start';
    resetBtn.disabled = true;
    
    inputHrs.value = '';
    inputMins.value = '';
    inputSecs.value = '';
    
    toggleUI(false);
}

// Switches visible components between setting time & counting down
function toggleUI(showActiveCountdown) {
    if (showActiveCountdown) {
        inputContainer.classList.add('hidden');
        displayContainer.classList.remove('hidden');
        display.innerHTML = formatTime(timeLeft);
    } else {
        displayContainer.classList.add('hidden');
        inputContainer.classList.remove('hidden');
    }
}

// ==================== THEME TOGGLE ====================
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.mode-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// ==================== EVENT LISTENERS ====================
startStopBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', reset);