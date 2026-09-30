# tests

Checks for the Grup-Al Jüri page and the grupal-proxy edge function. They live in the repo on purpose: the sandbox that held the previous suite was wiped (23.09.2026).

- `grupal.test.js` — jsdom checks (phone deck, desktop grid/sidebar/drawer, filters, resize, lobby, v10a Grup-Al / Hemen-Al lanes, invitation sheet, table line, guest `?d=` banner).
- `mock-meydan.json` — a `/meydan` fixture (24 coffees, 18 kapora on 9). Lane fixtures (`hemen`, `img_url`) are added in-test.
- `admin.test.js` — jsdom checks of the admin's Düzenle link resolution (v30d `cartLinkFrom`: cart permalink pass-through, `?variant=` conversion, proxy `/admin/variants` pick, select fallback, old-proxy alert).
- `shot-overlay.mjs` — desktop 1366: opening a card overlays the card below; asserts no card moved, the panel extends beyond the 400 px cell, and a click on empty space closes it (v10p).
- `shot-gate.mjs` — phone shots of the one-time WhatsApp gate (first Kapora koy → sheet → Devam → kapora continues; bind sheet).
- `shot-tickets.mjs` — phone (390 × `VH`, default 900) shots of the five ticket states on the real page: no kapora · kapora in basket (ghost ticket) · paid holder (Gönder / Masaya bırak) · used + on table (geri al) · stranger with a table seat.
- `shot-lanes-desk.mjs` — desktop grid card with both lanes open at 1366 and 1728 px; asserts the lanes sit side by side without overflow (v10g).
- `shot-desk.mjs` — Playwright screenshots at 1366 and 390 px, three themes.
- `shot-lanes.mjs` — Playwright screenshots of the two-price card, the lanes sheet (open / sold out), the invitation sheet and the guest banner.
- `proxy-harness.mjs` + `proxy.test.mjs` — the proxy `.ts` transpiled with `typescript` and run against an in-memory PostgREST (settings / offers / votes tables) with a fake `Deno`; covers the Hemen-Al lane, pool, invitations, table, counting toward 40, limits, expiry, admin settings, `/hemen-link` discount codes, `/admin/variants`, `/admin/inv-backfill`, jury gate (member = order, `/wa-ok`, `/dev-bind`, device merge, `/admin/users`; the dormant `/auth/*` OTP routes), forced lock (`/admin/offer-lock`), completion codes (`/done-link`), members backfill. Point `PROXY=` at the `.ts` (default `../proxy/proxy.ts`; the delivered copy is `deliver-grupal-proxy-function-v3_48.ts` in the CoffeeNutz folder).

Run from the repo root (once: `npm i -D jsdom playwright-core typescript` somewhere and point NODE_PATH at it; ESM files need a `node_modules` link next to the repo):

    NODE_PATH=/path/to/node_modules node tests/grupal.test.js
    NODE_PATH=/path/to/node_modules node tests/admin.test.js
    node tests/middleware.test.mjs
    PROXY=/path/to/deliver-grupal-proxy-function-v3_48.ts node tests/proxy.test.mjs
    node tests/shot-desk.mjs && node tests/shot-lanes.mjs
