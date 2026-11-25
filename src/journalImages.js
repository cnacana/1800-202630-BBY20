import { db } from "./firebaseConfig.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export const MAX_JOURNAL_IMAGE_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FIRESTORE_IMAGE_DATA_URL_LENGTH = 600_000;

export function getJournalEntryDocument(userId, day) {
  return doc(db, "Userdata", "Journalentries", "entries", `${userId}_${day}`);
}

export async function compressJournalImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (file.size > MAX_JOURNAL_IMAGE_FILE_SIZE) {
    throw new Error("Picture must be 2 MB or smaller.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image compression is unavailable in this browser.");
    }

    let scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    while (scale >= 0.2) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
        const compressedImage = canvas.toDataURL("image/jpeg", quality);
        if (compressedImage.length <= MAX_FIRESTORE_IMAGE_DATA_URL_LENGTH) {
          return compressedImage;
        }
      }

      scale *= 0.75;
    }

    throw new Error("This picture could not be compressed to fit Firestore.");
  } finally {
    bitmap.close();
  }
}

export async function readJournalImage(userId, day) {
  const snapshot = await getDoc(getJournalEntryDocument(userId, day));
  const image = snapshot.exists() ? snapshot.data().image : null;
  return typeof image === "string" && image.startsWith("data:image/") ? image : null;
}

export async function saveJournalImage(userId, day, image) {
  await setDoc(getJournalEntryDocument(userId, day), {
    userId,
    day,
    image,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
