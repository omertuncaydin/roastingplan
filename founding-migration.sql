-- founding-migration.sql
-- CoffeeNutz Guide entitlements: founding-account numbering + plan duration.
--
-- Matches the Guide client (roast-guide.html) as it actually reads the table:
--   entitlements(email <unique>, access <jsonb>, updated_at <timestamptz>)
--   - loadAccess():   SELECT * ... WHERE email = <lower(email)>  (reads access, and now founding_no)
--   - saveEntitlement(): UPSERT { email, access, updated_at } ON CONFLICT (email)
--     access carries { roast, cup, grade, value, plan, until }.
--     Gating is access-based (per module 'full'/'lite'); the client does NOT enforce
--     expiry, so plan_until / access.until are records, not a hard cut-off.
--
-- The client reads founding_no from the top-level column first, then from access.founding_no.
-- Run the three ALTERs once. The bulk-grant block below stays commented: drop in the
-- real emails, extend the sequences, then uncomment to run.

ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS founding_no integer;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS cupper_no   integer;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS plan_until  date;

-- Optional: never hand the same number out twice.
-- CREATE UNIQUE INDEX IF NOT EXISTS entitlements_founding_no_key ON entitlements(founding_no) WHERE founding_no IS NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS entitlements_cupper_no_key   ON entitlements(cupper_no)   WHERE cupper_no  IS NOT NULL;

-- ============================================================================
-- BULK GRANT TEMPLATE  (commented: fill emails, extend rows, then uncomment)
-- ----------------------------------------------------------------------------
-- 60 alumni Roaster grants: 12 months, founding_no 1..60.
--   access mirrors the Roaster plan object so save-gating works the instant it lands.
-- 6 Cupper grants: 36 months, founding_no 61..66, cupper_no 1..6.
--   access mirrors the Cupper plan object (everything 'full').
-- plan_until and access.until are kept in step; adjust the anchor dates to taste.
-- ----------------------------------------------------------------------------
--
-- -- Roaster alumni (repeat the row pattern through founding_no 60) --
-- INSERT INTO entitlements (email, access, founding_no, plan_until, updated_at) VALUES
--   ('roaster01@REPLACE.me', '{"roast":"full","cup":"lite","grade":"lite","value":"lite","plan":"Roaster","until":"2027-07-11"}',  1, DATE '2027-07-11', now()),
--   ('roaster02@REPLACE.me', '{"roast":"full","cup":"lite","grade":"lite","value":"lite","plan":"Roaster","until":"2027-07-11"}',  2, DATE '2027-07-11', now()),
--   ('roaster03@REPLACE.me', '{"roast":"full","cup":"lite","grade":"lite","value":"lite","plan":"Roaster","until":"2027-07-11"}',  3, DATE '2027-07-11', now())
--   -- ... continue through ('roaster60@REPLACE.me', ..., 60, DATE '2027-07-11', now()) ...
-- ON CONFLICT (email) DO UPDATE SET
--   access      = EXCLUDED.access,
--   founding_no = COALESCE(entitlements.founding_no, EXCLUDED.founding_no),
--   plan_until  = EXCLUDED.plan_until,
--   updated_at  = EXCLUDED.updated_at;
--
-- -- Cupper alumni (repeat through founding_no 66 / cupper_no 6) --
-- INSERT INTO entitlements (email, access, founding_no, cupper_no, plan_until, updated_at) VALUES
--   ('cupper01@REPLACE.me', '{"roast":"full","cup":"full","grade":"full","value":"full","plan":"Cupper","until":"2029-07-11"}', 61, 1, DATE '2029-07-11', now()),
--   ('cupper02@REPLACE.me', '{"roast":"full","cup":"full","grade":"full","value":"full","plan":"Cupper","until":"2029-07-11"}', 62, 2, DATE '2029-07-11', now()),
--   ('cupper03@REPLACE.me', '{"roast":"full","cup":"full","grade":"full","value":"full","plan":"Cupper","until":"2029-07-11"}', 63, 3, DATE '2029-07-11', now())
--   -- ... continue through ('cupper06@REPLACE.me', ..., 66, 6, DATE '2029-07-11', now()) ...
-- ON CONFLICT (email) DO UPDATE SET
--   access      = EXCLUDED.access,
--   founding_no = COALESCE(entitlements.founding_no, EXCLUDED.founding_no),
--   cupper_no   = COALESCE(entitlements.cupper_no,   EXCLUDED.cupper_no),
--   plan_until  = EXCLUDED.plan_until,
--   updated_at  = EXCLUDED.updated_at;
-- ============================================================================
