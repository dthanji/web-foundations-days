// Note Counter - Day 4 assignment

const MAX_CHARS = 200;
const WARNING_AT = 180;
const DRAFT_KEY = "noteDraft";
const THEME_KEY = "noteTheme";

// Select all the elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Update both counters and the warning classes
function updateCounts() {
  const text = noteText.value;
  const chars = text.length;
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  charCount.textContent = `${chars} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle("warning", chars > WARNING_AT);
  charCount.classList.toggle("over", chars > MAX_CHARS);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, noteText.value);
}

function clearNote() {
  noteText.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
  noteText.focus();
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

function toggleTheme() {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

// Events
noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

clearBtn.addEventListener("click", clearNote);
themeToggle.addEventListener("click", toggleTheme);

// On page load: restore draft and theme, then update the counters
const savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
updateCounts();
