const quizData = [
    { question: "How many players does each team have on the pitch in a standard football match?", options: ["9", "10", "11", "12"], answer: "11" },
    { question: "How long is a standard football match (excluding stoppage time and extra time)?", options: ["60 minutes", "80 minutes", "90 minutes", "100 minutes"], answer: "90 minutes" },
    { question: "How many points is a win worth in most football leagues?", options: ["1", "2", "3", "5"], answer: "3" },
    { question: "What is the restart called after a goal is scored?", options: ["Drop ball", "Kick-off", "Throw-in", "Goal kick"], answer: "Kick-off" },
    { question: "Which card means a player is sent off?", options: ["Yellow", "Red", "Green", "Blue"], answer: "Red" },
    { question: "What does VAR stand for in football?", options: ["Video Assistant Referee", "Verified Action Replay", "Virtual Assistant Review", "Video Attack Ruling"], answer: "Video Assistant Referee" },
    { question: "Which country won the first FIFA World Cup in 1930?", options: ["Brazil", "Uruguay", "Italy", "Argentina"], answer: "Uruguay" },
    { question: "From which restart can a player NOT be offside?", options: ["Throw-in", "Free kick", "Open play", "Penalty kick"], answer: "Throw-in" },
    { question: "How far is the penalty spot from the goal line?", options: ["6 yards", "12 yards", "18 yards", "22 yards"], answer: "12 yards" },
    { question: "From which type of free kick can you score directly without another touch?", options: ["Direct free kick", "Indirect free kick", "Both", "Neither"], answer: "Direct free kick" }
];

let currentQuestion = 0;
let score = 0;
let attempted = 0;
let userAnswers = [];
let timeLeft = 15;
let timerInterval;
let streak = 0;
let bestStreak = 0;

const timerEl = document.getElementById('time');
const questionEl = document.querySelector('.question');
const optionsEl = document.querySelector('.options');
const feedbackEl = document.getElementById('feedback');
const resultEl = document.querySelector('.result');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const percentEl = document.getElementById('percent');
const summaryEl = document.getElementById('summary');
const reviewEl = document.getElementById('review');
const restartBtn = document.querySelector('.restart-btn');
const streakEl = document.getElementById('streak-count');
const progressFill = document.getElementById('progress-fill');
const explanationEl = document.getElementById('explanation');

function clearFeedback() {
    if (!feedbackEl) return;
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'wrong');
}

function setFeedback(isCorrect) {
    if (!feedbackEl) return;
    feedbackEl.classList.remove('correct', 'wrong');

    if (isCorrect) {
        feedbackEl.textContent = 'Correct ✓';
        feedbackEl.classList.add('correct');
    } else {
        feedbackEl.textContent = 'Wrong ✗';
        feedbackEl.classList.add('wrong');
    }
}

function lockOptions() {
    const buttons = optionsEl.querySelectorAll('button.option');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('locked');
    });
}

function recordAnswer(selectedOption) {
    const q = quizData[currentQuestion];
    const isCorrect = selectedOption === q.answer;

    attempted++;
    userAnswers.push({
        question: q.question,
        selected: selectedOption,
        correct: q.answer,
        isCorrect
    });

    if (isCorrect) {
        score++;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        if (streakEl) {
            streakEl.textContent = streak;
            streakEl.parentElement.classList.add('streak-active');
        }
    } else {
        streak = 0;
        if (streakEl) {
            streakEl.textContent = streak;
            streakEl.parentElement.classList.remove('streak-active');
        }
    }
}

function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        endQuiz();
        return;
    }
    clearInterval(timerInterval);
    timeLeft = 15;
    timerEl.textContent = timeLeft;
    startTimer();
    const currentQuiz = quizData[currentQuestion];
    
    const questionNumberEl = document.getElementById('question-number');
    if (questionNumberEl) {
        questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    }
    
    const progressPercent = ((currentQuestion) / quizData.length) * 100;
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    questionEl.textContent = currentQuiz.question;
    optionsEl.innerHTML = '';
    clearFeedback();
    
    currentQuiz.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option;
        button.onclick = () => handleOptionClick(button, option);
        optionsEl.appendChild(button);
    });
}

function handleOptionClick(clickedButton, selectedOption) {
    const isCorrect = selectedOption === quizData[currentQuestion].answer;

    lockOptions();
    
    clickedButton.classList.add(isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
        const correctAnswer = quizData[currentQuestion].answer;
        const buttons = optionsEl.querySelectorAll('button.option');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    
    setFeedback(isCorrect);

    recordAnswer(selectedOption);
    clearInterval(timerInterval);
    setTimeout(() => {
        currentQuestion++;
        loadQuestion();
    }, 750);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            recordAnswer(null);
            currentQuestion++;
            loadQuestion();
        }
    }, 1000);
}

function endQuiz() {
    clearInterval(timerInterval);
    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    if (feedbackEl) feedbackEl.style.display = 'none';
    resultEl.style.display = 'block';
    scoreEl.textContent = score;

    const total = quizData.length;
    const wrong = attempted - score;
    const unanswered = total - attempted;
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);

    if (totalEl) totalEl.textContent = total;
    if (percentEl) percentEl.textContent = percent;

    if (summaryEl) {
        let label = "Keep going";
        if (percent >= 90) label = "Excellent";
        else if (percent >= 75) label = "Strong";
        else if (percent >= 50) label = "Good start";

        summaryEl.textContent = `${label}: ${score}/${total} correct • ${wrong} wrong • ${unanswered} unanswered`;
    }

    if (reviewEl) {
        reviewEl.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'review-title';
        title.textContent = 'Answer review';
        reviewEl.appendChild(title);

        quizData.forEach((q, index) => {
            const attempt = userAnswers[index];
            const selected = attempt ? attempt.selected : null;
            const correct = attempt ? attempt.correct : q.answer;
            const isCorrect = attempt ? attempt.isCorrect : false;

            const item = document.createElement('div');
            item.className = `review-item ${isCorrect ? 'is-correct' : 'is-wrong'}`;

            const qEl = document.createElement('div');
            qEl.className = 'review-question';
            qEl.textContent = `${index + 1}. ${q.question}`;

            const meta = document.createElement('div');
            meta.className = 'review-meta';

            const your = document.createElement('div');
            your.className = 'review-line';
            your.innerHTML = `<span class="review-label">Your answer:</span> <span class="review-value">${selected ?? 'Unanswered'}</span>`;

            const right = document.createElement('div');
            right.className = 'review-line';
            right.innerHTML = `<span class="review-label">Correct:</span> <span class="review-value">${correct}</span>`;

            const badge = document.createElement('span');
            badge.className = `badge ${isCorrect ? 'ok' : (selected === null ? 'na' : 'bad')}`;
            badge.textContent = isCorrect ? 'Correct' : (selected === null ? 'Unanswered' : 'Wrong');

            meta.appendChild(badge);
            meta.appendChild(your);
            meta.appendChild(right);

            item.appendChild(qEl);
            item.appendChild(meta);
            reviewEl.appendChild(item);
        });
    }

    restartBtn.style.display = 'block';
}

restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    attempted = 0;
    userAnswers = [];
    timeLeft = 15;
    streak = 0;
    timerEl.textContent = timeLeft;
    if (streakEl) streakEl.textContent = '0';

    questionEl.style.display = 'block';
    optionsEl.style.display = 'flex';
    if (feedbackEl) feedbackEl.style.display = 'block';
    resultEl.style.display = 'none';
    restartBtn.style.display = 'none';

    if (summaryEl) summaryEl.textContent = '';
    if (reviewEl) reviewEl.innerHTML = '';
    clearFeedback();

    loadQuestion();
});

loadQuestion();
