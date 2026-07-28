alter table public.player_settings
  drop constraint player_settings_blood_level;

alter table public.player_settings
  add constraint player_settings_blood_level
  check (blood_level between 0 and 3);
