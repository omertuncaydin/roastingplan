-- apps.coffeenutz.net front door: card order + visibility.
-- Managed from /apps-admin (Hub). Public page reads anonymously; writes need a signed-in Guide account.
create table if not exists public.apps_config (
  id int primary key,
  cfg jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.apps_config (id, cfg)
values (1, '{"order":["crack-listen","roast-guide","crack-game","roasttale","scurve-jumper","zine","grupal"],"hidden":[]}')
on conflict (id) do nothing;

alter table public.apps_config enable row level security;

drop policy if exists apps_config_read  on public.apps_config;
create policy apps_config_read  on public.apps_config for select using (true);

drop policy if exists apps_config_write on public.apps_config;
create policy apps_config_write on public.apps_config
  for all to authenticated using (true) with check (true);
