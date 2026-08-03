-- Watch key rides the account: one wrist pairing serves every signed-in phone.
alter table public.user_settings add column if not exists watch_key text;
