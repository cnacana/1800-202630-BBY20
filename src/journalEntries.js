import { db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getJournalEntryDocument } from "./journalImages.js";

export async function readJournalEntryForUser(userId, day) {
  const snapshot = await getDoc(getJournalEntryDocument(userId, day));
  const text = snapshot.exists() ? snapshot.data().text : "";
  return typeof text === "string" ? text : "";
}

export async function saveJournalEntryForUser(userId, day, text) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("Enter some text before saving.");
  }

  await setDoc(doc(db, "Userdata", "Journalentries"), {
    type: "journalEntries",
  }, { merge: true });

  await setDoc(getJournalEntryDocument(userId, day), {
    userId,
    day,
    text: trimmedText,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
