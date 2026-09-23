# tests

Checks for the Grup-Al Jüri page. They live in the repo on purpose: the sandbox that held the previous suite was wiped (23.09.2026).

- `grupal.test.js` — jsdom checks (phone deck, desktop grid/sidebar/drawer, filters, resize, lobby).
- `mock-meydan.json` — a `/meydan` fixture (24 coffees, 18 kapora on 9).
- `shot-desk.mjs` — Playwright screenshots at 1366 and 390 px, three themes (needs a Chromium; set `executablePath`).

Run from the repo root (once: `npm i -D jsdom playwright-core` somewhere and point NODE_PATH at it):

    NODE_PATH=/path/to/node_modules node tests/grupal.test.js
    NODE_PATH=/path/to/node_modules node tests/shot-desk.mjs
