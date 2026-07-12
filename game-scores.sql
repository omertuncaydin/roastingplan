-- game_scores: global ladder for the Agtron Challenge crack game.
-- Lower score is better. One row per posted match result.
-- Anon clients POST their own result and SELECT the public ladder.

create table if not exists public.game_scores (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  company    text,
  score      numeric     not null,
  event      text,
  created_at timestamptz not null default now()
);

alter table public.game_scores enable row level security;

-- Anyone (anon) may add a score row.
create policy game_scores_anon_insert
  on public.game_scores
  for insert
  to anon
  with check (true);

-- The ladder is public: anyone (anon) may read.
create policy game_scores_anon_select
  on public.game_scores
  for select
  to anon
  using (true);

-- Ladder is ordered by score ascending (lower is better).
create index if not exists game_scores_score_idx
  on public.game_scores (score asc);
