-- UNIVERSE-NAMESPACED MAPS · run once in Supabase SQL editor (after user-maps.sql)
-- Each measurement universe owns its own map list; same coffee may exist in several universes.

ALTER TABLE user_maps ADD COLUMN IF NOT EXISTS universe_id text NOT NULL DEFAULT 'u0';
ALTER TABLE user_maps DROP CONSTRAINT user_maps_pkey;
ALTER TABLE user_maps ADD PRIMARY KEY (email, universe_id, coffee);

-- OPTIONAL cleanup, AFTER your first sync on the new versions has re-pushed your maps
-- under their real universe id (rows left under 'u0' are pre-migration orphans):
-- DELETE FROM user_maps WHERE universe_id = 'u0';
