import { getEntryDocument, getUser, readJournalEntry } from "./calanderdata.js";
import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

let date_info = new Date()
const current_date = date_info.getDate()

  await setDoc(getEntryDocument(user.uid, day), {
    userId: user.uid,
    day,
    text: trimmedText,
    updatedAt: serverTimestamp(),
  });

try {
    const text = await readJournalEntry(current_date);
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