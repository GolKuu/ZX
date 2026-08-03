create table if not exists public.yzx_progression_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 3,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.yzx_progression_profiles enable row level security;
create policy "users read own yzx progression" on public.yzx_progression_profiles for select using (auth.uid() = user_id);
create policy "users insert own yzx progression" on public.yzx_progression_profiles for insert with check (auth.uid() = user_id);
create policy "users update own yzx progression" on public.yzx_progression_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.yzx_token_transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null,
  transaction_type text not null,
  amount integer not null check (amount <> 0),
  balance_before integer not null check (balance_before >= 0),
  balance_after integer not null check (balance_after >= 0),
  source_id text not null,
  idempotency_key text not null,
  version integer not null default 1,
  unique (user_id, idempotency_key)
);
alter table public.yzx_token_transactions enable row level security;
create policy "users read own yzx transactions" on public.yzx_token_transactions for select using (auth.uid() = user_id);
create policy "users insert own yzx transactions" on public.yzx_token_transactions for insert with check (auth.uid() = user_id);

create or replace function public.yzx_server_time() returns timestamptz language sql stable security invoker set search_path = '' as $$ select now(); $$;
grant execute on function public.yzx_server_time() to anon, authenticated;
