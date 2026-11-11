import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

function getEntryDocument(userId, day) {
  return doc(db, "Userdata", "Journalentries", "entries", `${userId}_${day}`);
}

export async function readJournalEntry(day) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in before viewing journal entries.");
  }

  const snapshot = await getDoc(getEntryDocument(user.uid, day));
  return snapshot.exists() ? snapshot.data().text : "";
}

export async function saveJournalEntry(day, text) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in before saving a note.");
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Enter some text before saving.");
  }

  await setDoc(doc(db, "Userdata", "Journalentries"), {
    type: "journalEntries",
  }, { merge: true });

  await setDoc(getEntryDocument(user.uid, day), {
    userId: user.uid,
    day,
    text: trimmedText,
    updatedAt: serverTimestamp(),
  });
}

const journalEntry = document.getElementById("journal-entry");
const saveButton = document.getElementById("save-journal-entry");
const saveStatus = document.getElementById("journal-save-status");
let selectedDate = null;
let readRequestId = 0;

document.addEventListener("calendar-day-selected", async (event) => {
  selectedDate = event.detail.date; //set date to the day clicked//
  const requestId = ++readRequestId;
  journalEntry.value = "";
  saveButton.disabled = true;
  saveStatus.textContent = `Loading note for ${selectedDate}...`;

  try {
    const text = await readJournalEntry(selectedDate);
    if (requestId !== readRequestId) {
      return;
    }

    journalEntry.value = text;
    saveStatus.textContent = `Showing note for ${selectedDate}.`;
  } catch (error) {
    if (requestId !== readRequestId) {
      return;
    }

    console.error("Could not load journal entry:", error);
    saveStatus.textContent = error instanceof Error
      ? `Could not load note: ${error.message}`
      : "Could not load note. Please try again.";
  } finally {
    if (requestId === readRequestId) {
      saveButton.disabled = false;
    }
  }
});

saveButton.addEventListener("click", async () => {
  saveStatus.textContent = "";

  if (!selectedDate) {
    saveStatus.textContent = "Select a calendar day before saving.";
    return;
  }

  try {
    await saveJournalEntry(selectedDate, journalEntry.value);
    saveStatus.textContent = `Note saved for ${selectedDate}.`;
  } catch (error) {
    console.error("Could not save journal entry:", error);
    saveStatus.textContent = error instanceof Error
      ? `Could not save note: ${error.message}`
      : "Could not save note. Please try again.";
  }
});
