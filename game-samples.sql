-- game_samples: community-submitted crack recordings for the CoffeeNutz crack game.
-- The game (crack-game.html) reads approved rows over the Supabase REST API with the
-- anon key and merges them into the round pool alongside the built-in samples.

create table game_samples (
  id           uuid        default gen_random_uuid() primary key,
  coffee       text        not null,
  cracks       jsonb       not null,                 -- [[t,g],...], t seconds (rebased to first crack = 0)
  terminal_ag  numeric     not null,                 -- measured ground Agtron at drop; drives the 115 -> terminal_ag curve
  credit       text,                                 -- roaster name, shown on the reveal
  company      text,                                 -- roaster company, shown on the reveal
  replay_ok    boolean     not null default true,    -- submitter consent to replay this sample
  approved     boolean     not null default false,   -- curation flag; only Omer flips this
  created_at   timestamptz default now()
);

-- Row Level Security.
alter table game_samples enable row level security;

-- anon may INSERT, but only unapproved submissions (they land as approved = false).
create policy game_samples_anon_insert on game_samples
  for insert to anon
  with check (approved = false);

-- anon may SELECT any row that is replay-consented.
create policy game_samples_anon_select on game_samples
  for select to anon
  using (replay_ok = true);

-- Curation: Omer approves a submission by flipping `approved` to true in the Supabase
-- Table Editor. The game additionally filters approved=eq.true on read, so a row only
-- reaches players once it is both approved here and still replay_ok = true.
