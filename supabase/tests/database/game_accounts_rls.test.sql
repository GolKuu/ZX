begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.player_settings'::regclass),
  'player_settings has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.player_statistics'::regclass),
  'player_statistics has RLS enabled'
);
select is(
  (select count(*) from information_schema.columns
   where table_schema = 'public' and table_name in (
     'profiles', 'player_settings', 'player_statistics', 'player_achievements'
   ) and column_name = 'email'),
  0::bigint,
  'player-facing tables never expose email'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'one@example.com', '{"nickname":"PlayerOne"}'),
  ('22222222-2222-4222-8222-222222222222', 'two@example.com', '{"nickname":"PlayerTwo"}');

insert into public.player_achievements (user_id, achievement_id)
values ('22222222-2222-4222-8222-222222222222', 'first-fight');

set local role anon;

select is((select count(*) from public.profiles), 2::bigint, 'public profiles are readable');
select is((select count(*) from public.player_statistics), 2::bigint, 'public statistics are readable');
select is((select count(*) from public.player_achievements), 1::bigint, 'public achievements are readable');
select throws_ok(
  $$select count(*) from public.player_settings$$,
  '42501',
  null,
  'anonymous users cannot read settings'
);

reset role;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.profiles), 2::bigint, 'player can read public profiles');
select is((select count(*) from public.player_settings), 1::bigint, 'player reads only own settings');

update public.profiles set nickname = 'UpdatedOne'
where id = '11111111-1111-4111-8111-111111111111';
select is(
  (select nickname from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'UpdatedOne',
  'player can update own profile'
);

update public.profiles set nickname = 'StolenName'
where id = '22222222-2222-4222-8222-222222222222';
select is(
  (select nickname from public.profiles where id = '22222222-2222-4222-8222-222222222222'),
  'PlayerTwo',
  'player cannot update another profile'
);

update public.player_settings set music_volume = 0.25
where user_id = '11111111-1111-4111-8111-111111111111';
select is(
  (select music_volume from public.player_settings),
  0.25::real,
  'player can update own private settings'
);

update public.player_settings set music_volume = 0
where user_id = '22222222-2222-4222-8222-222222222222';
select is(
  (select count(*) from public.player_settings where music_volume = 0),
  0::bigint,
  'player cannot update another player settings'
);

select throws_ok(
  $$insert into public.player_settings (user_id)
    values ('33333333-3333-4333-8333-333333333333')$$,
  '42501',
  null,
  'player cannot insert settings for another id'
);

select throws_ok(
  $$update public.player_statistics set rating = 9999
    where user_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  null,
  'players cannot change rating'
);

select throws_ok(
  $$delete from public.player_achievements
    where user_id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'players cannot remove achievements'
);

select is(
  (select count(*) from public.profiles where nickname in ('one@example.com', 'two@example.com')),
  0::bigint,
  'email is never used as nickname'
);

select * from finish();
rollback;
