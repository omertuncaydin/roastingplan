-- noise-lib.sql · global noise library (admin-curated "not a crack" fingerprints)
-- Served read-only to every Listener on load; only the admin account can write.
-- Run in Supabase SQL Editor. The Guide push-card that feeds this table ships separately.
CREATE TABLE IF NOT EXISTS noise_lib (
  id bigint generated always as identity primary key,
  f int not null,          -- spectral centroid, Hz
  hf real not null,        -- high-band share (>=13 kHz)
  w int not null,          -- transient width, ms slots
  label text default 'admin',
  created_at timestamptz default now()
);
ALTER TABLE noise_lib ENABLE ROW LEVEL SECURITY;
CREATE POLICY noise_lib_read ON noise_lib FOR SELECT TO anon USING (true);
CREATE POLICY noise_lib_admin_ins ON noise_lib FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()->>'email')='omer_aydin@coffeenutz.net');
CREATE POLICY noise_lib_admin_del ON noise_lib FOR DELETE TO authenticated
  USING ((auth.jwt()->>'email')='omer_aydin@coffeenutz.net');
