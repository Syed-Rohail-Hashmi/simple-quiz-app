const quizData = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "Hyper Text Marking Language", "Hyper Transfer Markup Language"],
    correct: 1
  },
  {
    question: "Which CSS property is used to change text color?",
    options: ["font-color", "text-color", "color", "foreground-color"],
    correct: 2
  },
  {
    question: "Which HTML tag is used to link an external CSS file?",
    options: ["<style>", "<script>", "<link>", "<css>"],
    correct: 2
  },
  {
    question: "In JavaScript, which keyword declares a variable that cannot be reassigned?",
    options: ["var", "let", "const", "static"],
    correct: 2
  },
  {
    question: "Which symbol is used to write comments in CSS?",
    options: ["// comment", "<!-- comment -->", "/* comment */", "# comment"],
    correct: 2
  },
  {
    question: "What does the acronym 'DOM' stand for in web development?",
    options: ["Document Object Model", "Data Object Management", "Display Object Mode", "Document Order Method"],
    correct: 0
  },
  {
    question: "Which HTTP method is typically used to submit form data without exposing it in the URL?",
    options: ["GET", "POST", "PUT", "HEAD"],
    correct: 1
  }
];

const startScreen = document.getElementById("start-screen");
const questionScreen = document.getElementById("question-screen");
const resultScreen = document.getElementById("result-screen");

const scoreSummaryEl = document.getElementById("score-summary");
const lastScoreValueEl = document.getElementById("last-score-value");
const bestScoreValueEl = document.getElementById("best-score-value");
const startBtn = document.getElementById("start-btn");

const questionCounterEl = document.getElementById("question-counter");
const progressTrackEl = document.getElementById("progress-track");
const progressFillEl = document.getElementById("progress-fill");
const questionTextEl = document.getElementById("question-text");
const optionsListEl = document.getElementById("options-list");
const liveRegionEl = document.getElementById("live-region");

const resultHeadingEl = document.getElementById("result-heading");
const scoreDisplayEl = document.getElementById("score-display");
const resultMessageEl = document.getElementById("result-message");
const reviewListEl = document.getElementById("review-list");
const restartBtn = document.getElementById("restart-btn");

const themeToggleBtn = document.getElementById("theme-toggle");

const LAST_SCORE_KEY = "quizdeck_last_score";
const BEST_SCORE_KEY = "quizdeck_best_score";
const THEME_KEY = "quizdeck_theme";

let quizQuestions = [];
let currentIndex = 0;
let score = 0;
let isAnswered = false;
let userAnswers = [];

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(screenEl) {
  [startScreen, questionScreen, resultScreen].forEach((screen) => {
    if (screen === screenEl) {
      screen.classList.remove("hidden");
    } else {
      screen.classList.add("hidden");
    }
  });
}

function loadScoreSummary() {
  const lastSaved = localStorage.getItem(LAST_SCORE_KEY);
  const bestSaved = localStorage.getItem(BEST_SCORE_KEY);
  let hasData = false;

  if (lastSaved) {
    try {
      const parsed = JSON.parse(lastSaved);
      if (typeof parsed.score === "number" && typeof parsed.total === "number") {
        lastScoreValueEl.textContent = `${parsed.score} / ${parsed.total}`;
        hasData = true;
      }
    } catch (e) {
      localStorage.removeItem(LAST_SCORE_KEY);
    }
  }

  if (bestSaved) {
    try {
      const parsed = JSON.parse(bestSaved);
      if (typeof parsed.score === "number" && typeof parsed.total === "number") {
        bestScoreValueEl.textContent = `${parsed.score} / ${parsed.total}`;
        hasData = true;
      }
    } catch (e) {
      localStorage.removeItem(BEST_SCORE_KEY);
    }
  }

  if (hasData) {
    scoreSummaryEl.classList.remove("hidden");
  }
}

function saveScores(finalScore, total) {
  localStorage.setItem(LAST_SCORE_KEY, JSON.stringify({ score: finalScore, total: total }));

  const savedBest = localStorage.getItem(BEST_SCORE_KEY);
  let shouldSaveBest = true;
  if (savedBest) {
    try {
      const parsed = JSON.parse(savedBest);
      if (typeof parsed.score === "number" && typeof parsed.total === "number") {
        const savedRatio = parsed.total > 0 ? parsed.score / parsed.total : 0;
        const newRatio = total > 0 ? finalScore / total : 0;
        shouldSaveBest = newRatio > savedRatio;
      }
    } catch (e) {
      shouldSaveBest = true;
    }
  }
  if (shouldSaveBest) {
    localStorage.setItem(BEST_SCORE_KEY, JSON.stringify({ score: finalScore, total: total }));
  }
}

function buildQuizQuestions() {
  const shuffledQuestions = shuffleArray(quizData);
  return shuffledQuestions.map((q) => {
    const options = q.options.map((text, i) => ({ text: text, isCorrect: i === q.correct }));
    return { question: q.question, options: shuffleArray(options) };
  });
}

function startQuiz() {
  if (!Array.isArray(quizData) || quizData.length === 0) {
    questionTextEl.textContent = "No questions are available right now. Please check back later.";
    optionsListEl.innerHTML = "";
    showScreen(questionScreen);
    return;
  }
  quizQuestions = buildQuizQuestions();
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  showScreen(questionScreen);
  renderQuestion();
}

function renderQuestion() {
  isAnswered = false;
  const total = quizQuestions.length;
  const current = quizQuestions[currentIndex];

  questionCounterEl.textContent = `Question ${currentIndex + 1} of ${total}`;

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  progressFillEl.style.width = `${progressPercent}%`;
  progressTrackEl.setAttribute("aria-valuenow", String(progressPercent));

  questionTextEl.classList.remove("fade-in");
  void questionTextEl.offsetWidth;
  questionTextEl.classList.add("fade-in");
  questionTextEl.textContent = current.question;

  optionsListEl.innerHTML = "";
  liveRegionEl.textContent = "";

  current.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn fade-in";
    btn.setAttribute("data-index", String(index));

    const labelSpan = document.createElement("span");
    labelSpan.className = "option-label";
    labelSpan.textContent = option.text;

    const iconSpan = document.createElement("span");
    iconSpan.className = "option-icon";
    iconSpan.setAttribute("aria-hidden", "true");

    btn.appendChild(labelSpan);
    btn.appendChild(iconSpan);

    btn.addEventListener("click", () => selectOption(index));
    optionsListEl.appendChild(btn);
  });
}

function selectOption(selectedIndex) {
  if (isAnswered) return;
  isAnswered = true;

  const current = quizQuestions[currentIndex];
  const selectedOption = current.options[selectedIndex];
  const buttons = optionsListEl.querySelectorAll(".option-btn");

  buttons.forEach((btn) => {
    const btnIndex = Number(btn.getAttribute("data-index"));
    const option = current.options[btnIndex];
    btn.disabled = true;

    if (option.isCorrect) {
      btn.classList.add("correct");
      btn.querySelector(".option-icon").textContent = "✓";
    }
    if (btnIndex === selectedIndex && !option.isCorrect) {
      btn.classList.add("wrong");
      btn.querySelector(".option-icon").textContent = "✗";
    }
  });

  if (selectedOption.isCorrect) {
    score++;
    liveRegionEl.textContent = "Correct!";
  } else {
    const correctOption = current.options.find((o) => o.isCorrect);
    liveRegionEl.textContent = `Wrong. The correct answer was: ${correctOption.text}`;
  }

  userAnswers.push({
    question: current.question,
    selectedText: selectedOption.text,
    correctText: current.options.find((o) => o.isCorrect).text,
    isCorrect: selectedOption.isCorrect
  });

  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const total = quizQuestions.length;
  scoreDisplayEl.textContent = `You scored ${score} out of ${total}`;

  const ratio = total > 0 ? score / total : 0;
  let message;
  if (ratio === 1) {
    message = "Perfect score! Your web fundamentals are rock solid.";
  } else if (ratio >= 0.7) {
    message = "Good job! You've got a solid handle on the basics.";
  } else if (ratio >= 0.4) {
    message = "Decent start. A bit more practice with the fundamentals will help.";
  } else {
    message = "Keep practicing. Review the basics and give it another go.";
  }
  resultMessageEl.textContent = message;

  if (ratio === 1) {
    resultHeadingEl.classList.add("celebrate");
  } else {
    resultHeadingEl.classList.remove("celebrate");
  }

  reviewListEl.innerHTML = "";
  userAnswers.forEach((answer, i) => {
    const item = document.createElement("div");
    item.className = `review-item ${answer.isCorrect ? "correct" : "wrong"}`;

    const qEl = document.createElement("p");
    qEl.className = "review-question";
    qEl.textContent = `${i + 1}. ${answer.question}`;

    const yourAnswerEl = document.createElement("p");
    yourAnswerEl.className = "review-answer";
    yourAnswerEl.textContent = `Your answer: ${answer.selectedText}`;

    item.appendChild(qEl);
    item.appendChild(yourAnswerEl);

    if (!answer.isCorrect) {
      const correctAnswerEl = document.createElement("p");
      correctAnswerEl.className = "review-correct-answer";
      correctAnswerEl.textContent = `Correct answer: ${answer.correctText}`;
      item.appendChild(correctAnswerEl);
    }

    reviewListEl.appendChild(item);
  });

  saveScores(score, total);
  loadScoreSummary();
  showScreen(resultScreen);
}

function restartQuiz() {
  score = 0;
  currentIndex = 0;
  showScreen(startScreen);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark", isDark);
  themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restartQuiz);
themeToggleBtn.addEventListener("click", toggleTheme);

document.addEventListener("keydown", (e) => {
  if (!questionScreen.classList.contains("hidden") && !isAnswered) {
    if (["1", "2", "3", "4"].includes(e.key)) {
      const index = Number(e.key) - 1;
      const buttons = optionsListEl.querySelectorAll(".option-btn");
      if (index < buttons.length) {
        selectOption(index);
      }
    }
  }

  if (e.key === "Enter") {
    if (!startScreen.classList.contains("hidden")) {
      startQuiz();
    } else if (!resultScreen.classList.contains("hidden")) {
      restartQuiz();
    }
  }
});

initTheme();
loadScoreSummary();