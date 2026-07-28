-- Game accounts deliberately keep auth.users (including email) separate from
-- player-facing data. Only Supabase Auth owns credentials and JWT sessions.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  region text not null default 'KZ',
  language text not null default 'ru',
  favorite_character_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length check (char_length(trim(nickname)) between 3 and 24),
  constraint profiles_avatar_url check (
    avatar_url is null or avatar_url ~ '^https://'
  ),
  constraint profiles_region_length check (char_length(region) between 2 and 32),
  constraint profiles_language_format check (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  constraint profiles_favorites_limit check (cardinality(favorite_character_ids) <= 5)
);

create unique index profiles_nickname_unique
  on public.profiles (lower(trim(nickname)));

create table public.player_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  control_layout jsonb not null default '{}'::jsonb,
  graphics jsonb not null default '{"quality":"high"}'::jsonb,
  master_volume real not null default 1,
  music_volume real not null default 0.6,
  effects_volume real not null default 0.8,
  blood_level smallint not null default 1,
  accessibility jsonb not null default
    '{"reducedMotion":false,"highContrast":false,"largeText":false,"showCombatHints":true}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint player_settings_layout_object check (jsonb_typeof(control_layout) = 'object'),
  constraint player_settings_graphics_object check (jsonb_typeof(graphics) = 'object'),
  constraint player_settings_accessibility_object check (jsonb_typeof(accessibility) = 'object'),
  constraint player_settings_master_volume check (master_volume between 0 and 1),
  constraint player_settings_music_volume check (music_volume between 0 and 1),
  constraint player_settings_effects_volume check (effects_volume between 0 and 1),
  constraint player_settings_blood_level check (blood_level between 0 and 2)
);

create table public.player_statistics (
  user_id uuid primary key references auth.users (id) on delete cascade,
  matches_played integer not null default 0 check (matches_played >= 0),
  wins integer not null default 0 check (wins >= 0 and wins <= matches_played),
  losses integer not null default 0 check (losses >= 0 and losses <= matches_played),
  rating integer not null default 1000 check (rating >= 0),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default '🏆'
);

create table public.player_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

insert into public.achievements (id, title, description, icon)
values
  ('first-fight', 'Первый бой', 'Завершить первый матч', '🥊'),
  ('first-win', 'Первая победа', 'Победить в матче', '🏆'),
  ('ten-fights', 'Опытный боец', 'Завершить 10 матчей', '⭐')
on conflict (id) do nothing;

-- Backfill accounts that existed before this migration. An id-based nickname
-- is intentionally used here so duplicated or missing Auth metadata cannot
-- block the migration.
insert into public.profiles (id, nickname, created_at)
select id, 'Игрок-' || left(replace(id::text, '-', ''), 16), created_at
from auth.users
on conflict (id) do nothing;

insert into public.player_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.player_statistics (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'profiles' then
    new.created_at = old.created_at;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger player_settings_set_updated_at
before update on public.player_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_nickname text := trim(coalesce(new.raw_user_meta_data ->> 'nickname', ''));
begin
  if char_length(requested_nickname) not between 3 and 24 then
    requested_nickname := 'Игрок-' || left(replace(new.id::text, '-', ''), 16);
  end if;

  insert into public.profiles (id, nickname)
  values (new.id, requested_nickname);

  insert into public.player_settings (user_id) values (new.id);
  insert into public.player_statistics (user_id) values (new.id);
  return new;
exception
  when unique_violation then
    insert into public.profiles (id, nickname)
    values (new.id, 'Игрок-' || left(replace(new.id::text, '-', ''), 16));
    insert into public.player_settings (user_id) values (new.id);
    insert into public.player_statistics (user_id) values (new.id);
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.player_settings enable row level security;
alter table public.player_statistics enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;

create policy "profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "players insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "players update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "players read own settings"
  on public.player_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "players insert own settings"
  on public.player_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "players update own settings"
  on public.player_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "statistics are public"
  on public.player_statistics for select
  to anon, authenticated
  using (true);

create policy "achievement catalog is public"
  on public.achievements for select
  to anon, authenticated
  using (true);

create policy "earned achievements are public"
  on public.player_achievements for select
  to anon, authenticated
  using (true);

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update on public.player_settings to authenticated;
grant select on public.player_statistics to anon, authenticated;
grant select on public.achievements to anon, authenticated;
grant select on public.player_achievements to anon, authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
