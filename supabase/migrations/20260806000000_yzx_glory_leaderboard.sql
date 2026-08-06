create table if not exists public.yzx_glory_leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 24),
  xp integer not null default 0 check (xp >= 0),
  wins integer not null default 0 check (wins >= 0),
  level integer not null default 0 check (level >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists yzx_glory_leaderboard_rank_idx
  on public.yzx_glory_leaderboard (xp desc, updated_at asc);

alter table public.yzx_glory_leaderboard enable row level security;
create policy "everyone can read glory leaderboard"
  on public.yzx_glory_leaderboard for select using (true);
create policy "users insert own glory leaderboard row"
  on public.yzx_glory_leaderboard for insert with check (auth.uid() = user_id);
create policy "users update own glory leaderboard row"
  on public.yzx_glory_leaderboard for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "users delete own glory leaderboard row"
  on public.yzx_glory_leaderboard for delete using (auth.uid() = user_id);
