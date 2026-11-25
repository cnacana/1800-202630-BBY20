# Backtrack

Backtrack is a daily journal and calendar app. Journal entries and their optional compressed pictures are stored in Firestore per signed-in user and date.

## Features

- Write and save a journal entry for today.
- Browse dated entries and pictures in the calendar.
- Keep a local to-do list on the daily journal page.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local development URL. Configure the `VITE_FIREBASE_*` environment variables before using Firebase-backed features.

## Build and deploy

Build the four active pages into `dist/`:

```sh
npm run build
```

Select your Firebase project in the Firebase CLI, then deploy the static site:

```sh
firebase deploy --only hosting
```

Firestore security rules are in `firestore.rules` and can be deployed separately:

```sh
firebase deploy --only firestore:rules
```

`firebase.json` configures Firebase Hosting to serve the Vite build from `dist/`.

## Project structure

```text
calendar.html
day_journal.html
index.html
login.html
src/
  components/
  authentication.js
  calanderdata.js
  firebaseConfig.js
  journalEntries.js
  journalImages.js
  loginSignup.js
  main.js
  render_calendar.js
styles/
images/
  newicon.png
unused/          archived pages and assets, excluded from the build
vite.config.js
firebase.json
firestore.rules
```


## Contributors
- Caleb Nacana - BCIT CST Student with some experience in HTML, CSS, JavaScript, and Python. Fun fact: plays softball on weekends when not busy.
- Kelvin Tse, CST student. Fun fact: does not like approving pull requests at 3AM
- Kyle Seda, CST student. Eager and ready to learn about coding.


## Acknowledgments

- Built with Firebase, Vite, Bootstrap, and standard browser APIs.

---

## Limitations and Future Work

### Limitations

- To-do items are stored locally in the current browser and are not synced across devices.

### Future work

- Sync to-do items to Firestore.
- Add journal export and additional calendar views.

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
