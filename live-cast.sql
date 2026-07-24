-- live_cast · polling road for the native watch app (2026-07-24)
-- Broadcast (topic cnw-<key>) is push-only; native watchOS polls this table
-- instead: GET /rest/v1/live_cast?key=eq.<watchKey>&select=payload,updated_at
-- every 1.5s. The Listener upserts the same payload it broadcasts (wcTablePut
-- in crack-listen v2026-07-24a). Security model mirrors the broadcast topic:
-- the 16-hex watch key IS the capability; anon may read/write its own row.

create table if not exists live_cast (
  key        text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at refreshes on every upsert (client clocks are not trusted)
create or replace function live_cast_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists live_cast_touch_tg on live_cast;
create trigger live_cast_touch_tg
  before insert or update on live_cast
  for each row execute function live_cast_touch();

alter table live_cast enable row level security;

drop policy if exists live_cast_read  on live_cast;
drop policy if exists live_cast_ins   on live_cast;
drop policy if exists live_cast_upd   on live_cast;

create policy live_cast_read on live_cast for select using (true);
create policy live_cast_ins  on live_cast for insert with check (true);
create policy live_cast_upd  on live_cast for update using (true);
