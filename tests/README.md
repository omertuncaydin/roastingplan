# tests

Checks for the Grup-Al Jüri page and the grupal-proxy edge function. They live in the repo on purpose: the sandbox that held the previous suite was wiped (23.09.2026).

- `grupal.test.js` — jsdom checks (phone deck, desktop grid/sidebar/drawer, filters, resize, lobby, v10a Grup-Al / Hemen-Al lanes, invitation sheet, table line, guest `?d=` banner).
- `mock-meydan.json` — a `/meydan` fixture (24 coffees, 18 kapora on 9). Lane fixtures (`hemen`, `img_url`) are added in-test.
- `shot-desk.mjs` — Playwright screenshots at 1366 and 390 px, three themes.
- `shot-lanes.mjs` — Playwright screenshots of the two-price card, the lanes sheet (open / sold out), the invitation sheet and the guest banner.
- `proxy-harness.mjs` + `proxy.test.mjs` — the proxy `.ts` transpiled with `typescript` and run against an in-memory PostgREST (settings / offers / votes tables) with a fake `Deno`; covers the Hemen-Al lane, pool, invitations, table, counting toward 40, limits, expiry, admin settings. Point `PROXY=` at the `.ts` (default `../proxy/proxy.ts`; the delivered copy is `deliver-grupal-proxy-function-v3_38.ts` in the CoffeeNutz folder).

Run from the repo root (once: `npm i -D jsdom playwright-core typescript` somewhere and point NODE_PATH at it; ESM files need a `node_modules` link next to the repo):

    NODE_PATH=/path/to/node_modules node tests/grupal.test.js
    node tests/middleware.test.mjs
    PROXY=/path/to/deliver-grupal-proxy-function-v3_38.ts node tests/proxy.test.mjs
    node tests/shot-desk.mjs && node tests/shot-lanes.mjs
