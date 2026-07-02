*Last updated: 2026-07-02 07:40 (Turkey time)*

# Handover - CoffeeNutz roasting app session

For continuing this conversation in a fresh session (fable5). Read this top to bottom, then check the three files under "Files touched" against current git state before asserting anything.

## Contents
- [The one big idea](#the-one-big-idea)
- [Files touched this session](#files-touched-this-session)
- [What got built this session](#what-got-built-this-session)
- [Open decisions (need Omer)](#open-decisions-need-omer)
- [Next steps](#next-steps)
- [Parked creative ideas](#parked-creative-ideas)
- [Key code anchors in roast-guide.html](#key-code-anchors-in-roast-guidehtml)
- [Working rules (honor these)](#working-rules-honor-these)

## The one big idea
Omer reframed the whole project mid-session. The spine now:

- A temperature probe reads **drum/environment temperature**, not the beans. Never call it "bean temp." Temp is context (energy applied), not truth.
- The **source of truth is sound**. Crack acoustics are a direct readout of the beans' heat-transfer state. The value is NOT detecting first-crack onset ("no coffee buyer for A0"). The value is the **continuous** signal: crack **gain** (intensity), loudness envelope, rate, cadence, spectral shift.
- On the HSR15 the cracks are louder (more mass), which helps detection, not hurts.
- Sound is a lagging confirmation (says where beans ARE, not what's 20s out), so it anchors ground truth and makes any prediction honest; it doesn't remove a predictive layer.

Full detail saved to memory: `project_acoustic_source_of_truth.md`.

## Files touched this session
All in the `roastingplan` repo. Sandbox path prefix `/sessions/vibrant-charming-cerf/mnt/roastingplan/`; user path `/Users/omeraydin/Documents/GitHub/roastingplan/`.

- `roast-guide.html` - the main single-file app (~140KB). Capture mode + charge-temp table + drop fix landed here.
- `tr-strings.md` - Turkish mirror doc. Updated whenever in-app copy changes.
- `crack-listen.html` - NEW standalone iPhone crack-gain listener (Web Audio). Not yet integrated into the app; a detection tester.

Not yet confirmed pushed by Omer at handover time - tell him to commit + push all three via GitHub Desktop, then hard-refresh.

## What got built this session
1. Capture mode reworked to behave like Deep Calibration: one stage wheel that walks CHG -> YLW -> CIN -> A0 -> A1 -> B0 -> B1 -> C0 -> C1 -> C2 -> DROP, one step per Record (no phase-skipping). CIN/A0/DROP also drive the cockpit gauge.
2. Single primary button reads "Start" (green pulse) at idle, flips to "Record" once running. Start logs CHG + begins the clock. `updateCaptureBtn()`.
3. Removed READ from the roast wheel; "+ temp" logs a between-stage reading without moving the stage wheel. Undo pops the last point and steps the wheel back (rolls the gauge back if it was a crack).
4. Removed the big FIRST CRACK / Undo-last-mark buttons from the live screen; the big button survives only as "New roast" at the done state (`draw()` sets its display).
5. Charge-temp-by-batch-size table. Seeded: Bullet 500g=190C; HSR15 1000/2500/5000/7500g = 140/150/160/165C. Batch-size selector on the setup screen; editable "Charge temps" panel; stored in localStorage `gCharge`; `predictNext()` pre-fills the CHG temp wheel from machine+batch (exact match else nearest).
6. Moved the lock / 30x / 60x / Back block to the bottom of the live screen.
7. Fixed: DROP now always ends the roast and freezes the clock, whatever order stages were recorded (was only firing when the strict CIN->A0->dev path was hit).
8. Mockups: first pass (#1 ROR coaching, #4 Agtron projection) was rejected because it leaned on fake "bean temp." Redrew with sound as truth (crack rate hero, temp demoted). Then Omer corrected onset-detection framing; pivoted to gain/intensity.
9. Built `crack-listen.html`: iPhone mic listener measuring crack gain. Web Audio with `autoGainControl:false` + `noiseSuppression:false` (iOS otherwise flattens transients), a high-pass filter to cut drum/fan rumble, transient detection via fast-vs-background energy ratio with a 70ms refractory. Live gain, meter with background floor, scrolling gain trace with crack marks, count/rate/last/peak, tunable Sensitivity + High-pass sliders.

## Open decisions (need Omer)
- **Mic fork, UNRESOLVED.** Full auto-listen (mic detects and drives everything) vs hybrid (sound leads, a tap confirms, buttons as fallback). This reverses the older "buttons-first (not audio)" stance in `project_roasting_app_positioning`. Do not silently pick one.
- **Detection proof, UNRESOLVED and gating.** Everything acoustic depends on `crack-listen.html` separating cracks from HSR15 roar on a real batch. Omer was asked to test on a live roast; awaiting his result. Do not build acoustic UI on top until this holds.
- Agtron projection: if built, show a range (e.g. 55-60) not a single integer, and gate it behind a solid calibration.

## Next steps
1. Get Omer's result from running `crack-listen.html` on a real HSR15 roast (tune High-pass then Sensitivity). This is the gate.
2. If detection holds: build the **gain envelope as the ROR replacement** (acoustic energy-release rate curve, temp fully demoted to context).
3. Resolve the mic fork before wiring listening into `roast-guide.html`.
4. Charge temps are device-local (localStorage `gCharge`) - Supabase sync is pending if he wants cross-device.

## Parked creative ideas
From the "thermal state is talking" thread, none are onset-detection: gain envelope = real ROR; crack loudness = moisture/pressure read (loudness decay = drying out); inter-crack cadence = batch evenness score; acoustic fingerprint matching (coach a live roast to sound like a roast that cupped great); drop-by-gain (intensity-weighted, not a raw count).

## Key code anchors in roast-guide.html
- Roast phase machine: `st.phase` idle -> pre0 -> pre1 -> dev -> done. `tap()` advances; `startRoast()`, `finishRoast()` (async, stops tick, logs, cools), `undoMark()`.
- Capture dock: `ROAST_CAP_STAGES`, `nextCapStage()`, `captureRecord()`, `captureTemp()`, `captureUndo()`, `updateCaptureBtn()`, `buildCaptureWheels()`, `capTempVal()`, `capTempReset()`.
- Charge temps: `CHARGE_DEFAULTS`, `chargeMap()`/`saveChargeMap()`, `chargeTempFor()`, `populateBatchSel()`, `toggleChargePanel()`/`renderChargeEditor()`/`addChargeRow()`/`saveChargeEditor()`. `predictNext()` returns `chargeTempFor()` when no readings yet.
- Temp curve: `predictNext()`, `tempAt()`, `updateTempChart()`, `updateTempDue()`, ROR plugins.
- Gauge: `draw()`, `renderGauge()`, `drawSetupGauge()`, stage-mark plugins; `dropOffset()`, `devCues()`, calibration offsets `st.calOffs`/`st.calDrop`.
- Deep Calibration: `CALIB` state, `calibToggle()`/`recordSample()`/`finishCalib()`/`saveCalibMap()`, `STAGE_FULL`/`STAGE_SOFT`, per-machine defaults `gMachDef`.
- i18n: `DICT.tr`, `T()`, `data-i18n` attributes, `applyLang()`. Label text wrapping an input must sit in its own `<span data-i18n>` so translating does not wipe the input.
- Storage: localStorage `gLog`, `gCalib`, `gMachDef`, `gCharge`, `cnLang`. Supabase project "Roast Assist" (recipes/logs).

## Working rules (honor these)
- **Deploy:** the sandbox never pushes (token security). Omer commits + pushes via GitHub Desktop. If `.git/index.lock` sticks, he runs `rm -f .git/index.lock` in Terminal. Verify a deploy via the GitHub API contents endpoint `size`, not the raw file (raw caches).
- **Verify JS:** extract the largest `<script>` to a temp file and run `node --check`. jsdom in the sandbox is flaky and does no layout (wheel pickers read scrollTop, so they read as 0). Syntax check is the reliable minimum.
- **tr-strings.md:** update it whenever in-app copy changes.
- **No em dashes** anywhere in content for Omer or in conversation with him. No atmospheric qualifier adverbs (softly, quietly, gently) in drafted content.
- **Advisor voice:** never open with agreement; tag confidence [Certain]/[Likely]/[Guessing]; lead with the uncomfortable answer; no warm-up paragraphs; disagree with structure; hold position unless given new information.
- **Visual formats are normally in-house.** App UI mockups are an exception Omer explicitly requested here; do not extend that to marketing/brand visuals.
- Omer means Shopify-confirmed payment by "reserved"; the drum is "tambur" never "tava"; keep to marketing/PR, never programmatic personal-sales outreach.
