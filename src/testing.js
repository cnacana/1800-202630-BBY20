import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export async function getUser() {
    return auth.currentUser
}

let readRequestId = 0
const requestId = ++readRequestId

try {
    if (requestId !== readRequestId) {
      console.log("Fail")
    }

} catch (error) {
    if (requestId !== readRequestId) {
      console.log("fail")
    }

    console.error("Could not load journal entry:", error);
    saveStatus.textContent = error instanceof Error
      ? `Could not load note: ${error.message}`
      : "Could not load note. Please try again.";
} finally {
    if (requestId === readRequestId) {
      console.log("Success")
    }
}