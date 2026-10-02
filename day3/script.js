// Notes Toolkit - Day 3 assignment

let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const CATEGORIES = ["personal", "work", "study"];

// Returns notes whose text contains the word, ignoring case.
function searchNotes(word) {
  const target = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(target));
}

// Returns the note with the most characters, or null if there are none.
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// Returns an object counting notes per category.
function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  for (const note of notes) {
    counts[note.category] += 1;
  }
  return counts;
}

// Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const total = notes.length;
  const label = total === 1 ? "note" : "notes";
  if (total === 0) {
    return `0 ${label}.`;
  }
  const counts = countByCategory();
  const parts = CATEGORIES.filter((category) => counts[category] > 0).map(
    (category) => `${counts[category]} ${category}`
  );
  return `${total} ${label}: ${parts.join(", ")}.`;
}

// Trims, collapses extra spaces and lower-cases text for comparison.
function normalise(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

// True if a note with the same text (ignoring case and extra spaces) exists.
function isDuplicate(text) {
  const target = normalise(text);
  return notes.some((note) => normalise(note.text) === target);
}

// Adds a note if valid. Returns true when added, false otherwise.
function addNote(text, category) {
  const cleaned = text.trim();

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Not added: text must be 1-200 characters.");
    return false;
  }
  if (isDuplicate(cleaned)) {
    console.log("Not added: a note with this text already exists.");
    return false;
  }
  if (!CATEGORIES.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }

  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: nextId, text: cleaned, category });
  return true;
}

// ---------------------------------------------------------------
// Tests (expected output is in the comment beside each call)
// ---------------------------------------------------------------

console.log("--- searchNotes ---");
console.log(searchNotes("MILK")); // [ { id: 1, text: 'Buy milk and bread', category: 'personal' } ]
console.log(searchNotes("zebra")); // []

console.log("--- longestNote ---");
console.log(longestNote()); // { id: 3, text: 'Email the project report to Grace', category: 'work' }
const savedNotes = notes;
notes = [];
console.log(longestNote()); // null
notes = savedNotes;

console.log("--- countByCategory ---");
console.log(countByCategory()); // { personal: 2, work: 1, study: 2 }
notes = [];
console.log(countByCategory()); // { personal: 0, work: 0, study: 0 }
notes = savedNotes;

console.log("--- getSummary ---");
console.log(getSummary()); // 5 notes: 2 personal, 1 work, 2 study.
notes = [savedNotes[0]];
console.log(getSummary()); // 1 note: 1 personal.
notes = [];
console.log(getSummary()); // 0 notes.
notes = savedNotes;

console.log("--- isDuplicate ---");
console.log(isDuplicate("  buy MILK   and bread ")); // true
console.log(isDuplicate("Buy eggs")); // false

console.log("--- addNote ---");
console.log(addNote("Water the plants", "personal")); // true
console.log(getSummary()); // 6 notes: 3 personal, 1 work, 2 study.
console.log(addNote("buy milk and BREAD", "personal")); // Not added: a note with this text already exists. / false
console.log(addNote("   ", "work")); // Not added: text must be 1-200 characters. / false
console.log(addNote("x".repeat(201), "work")); // Not added: text must be 1-200 characters. / false
console.log(addNote("Plan the weekend", "hobby")); // Not added: category must be personal, work or study. / false
