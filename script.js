"use strict";

// Access html element from js
const form = document.querySelector("#note-form");
const titleInput = document.querySelector("#title");
const contentInput = document.getElementById("content");
const searchInput = document.querySelector("#search");
const filterInput = document.querySelector("#filter");
const sortInput = document.querySelector("#sort");
const noteList = document.querySelector("#note-list");
const template = document.querySelector("#note-template");
const message = document.querySelector("#message");
const stats = document.querySelector("#stats");
const formHeading = document.querySelector("#form-heading");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");

//Main Database
let notes = [];
let editingId = null;
let searchTerm = "";
// 1
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    message.textContent = "Title and content cannot contain only spaces";
    return;
  }

  if (editingId !== null) {
    updateNote(editingId, title, content);
  } else {
    createNote(title, content);
  }
  resetForm();
});

function updateNote(id, title, content) {
  const now = Date.now();
  const nextNotes = notes.map((note) =>
    note.id === id ? { ...note, title, content, updatedAt: now } : note,
  );
  commitNotes(nextNotes, "Note updated");
}
function createId() {
  return (
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function commitNotes(nextNotes, successMessage) {
  notes = nextNotes;
  renderNotes();
  message.textContent = successMessage;
}

function createNote(title, content) {
  const now = Date.now();

  const newNote = {
    id: createId(),
    title,
    content,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };

  commitNotes([newNote, ...notes], "Note created");
}

function handleNoteClick(event) {
  const button = event.target.closest("button[data-action]");
  console.log(button);
  if (!button) return;

  const article = button.closest("article[data-id]");
  const id = article?.dataset.id;
  //   console.log(id);
  if (!id) return;

  switch (button.dataset.action) {
    case "edit":
      startEditing(id);
      break;
    case "pin":
      togglePin(id);
      break;
    case "delete":
      deleteNote(id);
      break;
  }
}

function togglePin(id) {
  console.log(notes);

  const nextNotes = notes.map((note) =>
    note.id === id ? { ...note, pinned: !note.pinned } : note,
  );
  commitNotes(nextNotes, "Pin status updated");
  //  [...noteList.querySelectorAll("article")].find()
}

function deleteNote(id) {
  if (!window.confirm("Delete this note?")) return;

  const nextNotes = notes.filter((note) => note.id !== id);
  commitNotes(nextNotes, "Note deleted");

  if (editingId == id) resetForm();
  else titleInput.focus();
}

function startEditing(id) {
  const note = notes.find((note) => note.id === id);
  //   console.log(note);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  formHeading.textContent = "Update Note";
  saveButton.textContent = "Edit Note";
  cancelButton.hidden = false;
  message.textContent =
    "Editing note. Update to save, or cancel to discard changes.";
  titleInput.focus();
}

function resetForm() {
  form.reset();
  editingId = null;
  formHeading.textContent = "Create Note";
  saveButton.textContent = "Add Note";
  cancelButton.hidden = true;
  titleInput.focus();
}

function cancelEditing() {
  resetForm();
  message.textContent = "Editing canceled. You can create a new note.";
}

function renderNotes() {
  const fragment = document.createDocumentFragment();

  const visibleNotes = getVisibleNotes();
  // console.log(notes);
  for (const note of visibleNotes) {
    const card = template.content.cloneNode(true);
    const article = card.querySelector("article");
    article.dataset.id = note.id;
    article.classList.toggle("is-pinned", note.pinned);
    console.log(note.pinned);

    card.querySelector(".note-title").textContent = note.title;
    card.querySelector(".note-content").textContent = note.content;
    card.querySelector(".note-date").textContent =
      `Updated:${new Date(note.updatedAt).toLocaleString()}`;
    const pinButton = card.querySelector('[data-action="pin"]');
    pinButton.textContent = note.pinned ? "Unpin" : "Pin";

    fragment.append(card);
  }
  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No notes yet. Add your first note";
    fragment.append(empty);
  }

  noteList.replaceChildren(fragment);
}

function getVisibleNotes() {
  const visible = notes.filter((note) => {
    const { title, content } = note;
    const text = `${title} ${content}.toLowerCase()`;
    const matchesSearch = text.includes(searchTerm);
    return matchesSearch;
  });
  return visible;
}

function debounce(callback, delay = 1000) {
  // Closure
  let timerId;
  return (...args) => {
    console.log(...args);
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
    console.log(timerId);
  };
}

function handleSearch(event) {
  searchTerm = event.target.value;
  renderNotes();
}

noteList.addEventListener("click", handleNoteClick);

cancelButton.addEventListener("click", cancelEditing);

renderNotes();

// titleInput.addEventListener("input", (e) => {
//   console.log(e.target.value.trim());
// });
searchInput.addEventListener("input", debounce(handleSearch));