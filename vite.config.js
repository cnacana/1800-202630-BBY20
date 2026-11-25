import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: resolve(projectRoot, "index.html"),
        login: resolve(projectRoot, "login.html"),
        dayJournal: resolve(projectRoot, "day_journal.html"),
        calendar: resolve(projectRoot, "calendar.html"),
      },
    },
  },
});
