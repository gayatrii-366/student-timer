let startTime;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let totalStudyTime = 0;
let lapTimes = [];
let subjectTimes = {};
let isPomodoroActive = false;
let pomodoroInterval;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const themeToggle = document.getElementById('themeToggle');
const pomodoroBtn = document.getElementById('pomodoroBtn');
const studyGoal = document.getElementById('studyGoal');
const subjectSelect = document.getElementById('subjectSelect');
const totalTimeDisplay = document.getElementById('totalTime');
const lapTimesDisplay = document.getElementById('lapTimes');
const goalProgress = document.getElementById('goalProgress');
const subjectTimeDisplay = document.getElementById('subjectTime');

// Dark mode toggle
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

// Load saved theme
document.body.dataset.theme = localStorage.getItem('theme') || '';

// Timer functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 10);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        updateSubjectTime();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
    }
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;
    display.textContent = '00:00:00';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    lapTimes = [];
    updateLapDisplay();
}

function updateTimer() {
    elapsedTime = Date.now() - startTime;
    display.textContent = formatTime(elapsedTime);
    updateGoalProgress();
}

function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}

// Lap functionality
function addLap() {
    if (isRunning) {
        lapTimes.push(elapsedTime);
        updateLapDisplay();
    }
}

function updateLapDisplay() {
    lapTimesDisplay.innerHTML = lapTimes.map((time, index) => 
        `<div>Lap ${index + 1}: ${formatTime(time)}</div>`
    ).join('');
}

// Pomodoro Timer
function togglePomodoro() {
    if (!isPomodoroActive) {
        startPomodoro();
        pomodoroBtn.textContent = 'Stop Pomodoro';
    } else {
        stopPomodoro();
        pomodoroBtn.textContent = 'Start Pomodoro';
    }
    isPomodoroActive = !isPomodoroActive;
}

function startPomodoro() {
    let isStudyPhase = true;
    let timeLeft = 25 * 60; // 25 minutes in seconds

    pomodoroInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            if (isStudyPhase) {
                timeLeft = 5 * 60; // 5 minute break
                notify('Time for a break!');
            } else {
                timeLeft = 25 * 60; // 25 minute study session
                notify('Break over! Back to studying!');
            }
            isStudyPhase = !isStudyPhase;
        }
        updatePomodoroDisplay(timeLeft, isStudyPhase);
    }, 1000);
}

function stopPomodoro() {
    clearInterval(pomodoroInterval);
}

function updatePomodoroDisplay(timeLeft, isStudyPhase) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const phase = isStudyPhase ? 'Study' : 'Break';
    display.textContent = `${phase}: ${pad(minutes)}:${pad(seconds)}`;
}

// Goal Tracking
function updateGoalProgress() {
    const goal = parseInt(studyGoal.value);
    if (goal) {
        const progress = (elapsedTime / (goal * 60 * 1000)) * 100;
        goalProgress.textContent = `Progress: ${Math.min(100, Math.round(progress))}%`;
    }
}

// Subject Tracking
function updateSubjectTime() {
    const subject = subjectSelect.value;
    if (subject && isRunning) {
        subjectTimes[subject] = (subjectTimes[subject] || 0) + 1;
        subjectTimeDisplay.textContent = Object.entries(subjectTimes)
            .map(([sub, time]) => `${sub}: ${Math.round(time / 60)} mins`)
            .join('\n');
    }
}

// Notifications
function notify(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(message);
            }
        });
    }
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', addLap);
pomodoroBtn.addEventListener('click', togglePomodoro);
studyGoal.addEventListener('input', updateGoalProgress);

// Initial setup
pauseBtn.style.display = 'none';