import { auth } from "./firebaseConfig.js";

import { onAuthStateChanged } from "firebase/auth";
import {
  compressJournalImage,
  getJournalEntryDocument,
  MAX_JOURNAL_IMAGE_FILE_SIZE,
  readJournalImage,
  saveJournalImage,
} from "./journalImages.js";
import {
  readJournalEntryForUser,
  saveJournalEntryForUser,
} from "./journalEntries.js";

export function getUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

export function getEntryDocument(userId, day) {
  return getJournalEntryDocument(userId, day);
}

export async function readJournalEntry(day) {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error("Please sign in before viewing journal entries.");
  }

  return readJournalEntryForUser(user.uid, day);
}

export async function saveJournalEntry(day, text) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in before saving a note.");
  }

  return saveJournalEntryForUser(user.uid, day, text);
}

const journalEntry = document.getElementById("journal-entry");
const saveButton = document.getElementById("save-journal-entry");
const saveStatus = document.getElementById("journal-save-status");
const imageInput = document.getElementById("journal-image-upload");
const imageThumbnail = document.getElementById("journal-image-thumbnail");
const imagePreview = document.getElementById("journal-image-preview");
const imageLightbox = document.getElementById("journal-image-lightbox");
const imageLightboxImage = document.getElementById("journal-image-lightbox-image");
const imageLightboxClose = document.getElementById("journal-image-lightbox-close");
let selectedDate = null;
let readRequestId = 0;

function resizeJournalEntry() {
  journalEntry.style.height = "auto";
  journalEntry.style.height = `${journalEntry.scrollHeight}px`;
}

function renderJournalImage(image) {
  if (image) {
    imagePreview.src = image;
    imageThumbnail.hidden = false;
  } else {
    imagePreview.removeAttribute("src");
    imageThumbnail.hidden = true;
    closeImageLightbox(false);
  }
}

function closeImageLightbox(restoreFocus = true) {
  if (imageLightbox.hidden) {
    return;
  }

  imageLightbox.hidden = true;
  imageLightboxImage.removeAttribute("src");
  if (restoreFocus && !imageThumbnail.hidden) {
    imageThumbnail.focus();
  }
}

imageThumbnail.addEventListener("click", () => {
  if (imageThumbnail.hidden || !imagePreview.src) {
    return;
  }

  imageLightboxImage.src = imagePreview.src;
  imageLightbox.hidden = false;
  imageLightboxClose.focus();
});

imageLightbox.addEventListener("click", event => {
  if (event.target === imageLightbox) {
    closeImageLightbox();
  }
});

imageLightboxClose.addEventListener("click", () => closeImageLightbox());

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeImageLightbox();
  }
});

journalEntry.addEventListener("input", resizeJournalEntry);
window.addEventListener("resize", resizeJournalEntry);

document.addEventListener("calendar-day-selected", async (event) => {
  selectedDate = event.detail.date; //set date to the day clicked//
  const requestId = ++readRequestId;
  journalEntry.value = "";
  resizeJournalEntry();
  renderJournalImage(null);
  saveButton.disabled = true;
  imageInput.disabled = true;
  saveStatus.textContent = `Loading note for ${selectedDate}...`;

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Please sign in before viewing journal entries.");
    }

    const [text, image] = await Promise.all([
      readJournalEntry(selectedDate),
      readJournalImage(user.uid, selectedDate),
    ]);
    if (requestId !== readRequestId) {
      return;
    }

    journalEntry.value = text;
    resizeJournalEntry();
    renderJournalImage(image);
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
      imageInput.disabled = !auth.currentUser;
    }
  }
});

imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  if (!file) {
    return;
  }
  if (!selectedDate) {
    saveStatus.textContent = "Select a calendar day before uploading a picture.";
    imageInput.value = "";
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    saveStatus.textContent = "Please sign in before uploading a picture.";
    imageInput.value = "";
    return;
  }
  if (file.size > MAX_JOURNAL_IMAGE_FILE_SIZE) {
    saveStatus.textContent = "Picture must be 2 MB or smaller.";
    imageInput.value = "";
    return;
  }
  if (!file.type.startsWith("image/")) {
    saveStatus.textContent = "Choose an image file.";
    imageInput.value = "";
    return;
  }

  const targetDate = selectedDate;
  const requestId = readRequestId;
  imageInput.disabled = true;
  saveStatus.textContent = `Saving picture for ${targetDate}...`;
  try {
    const image = await compressJournalImage(file);
    await saveJournalImage(user.uid, targetDate, image);
    if (selectedDate === targetDate) {
      renderJournalImage(image);
      saveStatus.textContent = `Picture saved for ${targetDate}.`;
    }
  } catch (error) {
    console.error("Could not save journal picture:", error);
    if (selectedDate === targetDate) {
      saveStatus.textContent = error instanceof Error
        ? `Could not save picture: ${error.message}`
        : "Could not save picture. Please try again.";
    }
  } finally {
    imageInput.value = "";
    if (requestId === readRequestId) {
      imageInput.disabled = !auth.currentUser;
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
