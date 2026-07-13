-- game-samples-research.sql
-- Item 7 of missed-benefits-audit-2026-07-13.md: the research consent rider.
-- Adds an OPT-IN flag so consented community submissions can also feed the
-- ZHAW acoustic roast-mapping study. Default false: game/replay consent alone
-- never implies research use. The Listener's consent modal gains a separate
-- optional checkbox that sets this on submission.
ALTER TABLE game_samples ADD COLUMN IF NOT EXISTS research_ok boolean NOT NULL DEFAULT false;
