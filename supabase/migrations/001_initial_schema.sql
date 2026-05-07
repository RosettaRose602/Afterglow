-- ============================================================
-- Afterglow — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by trigger on signup.
create table if not exists profiles (
  id                       uuid primary key references auth.users on delete cascade,
  name                     text not null default 'Friend',
  timezone                 text not null default 'UTC',
  -- Migraine profile
  known_triggers           text[]    default '{}',
  preventive_meds          text[]    default '{}',
  abortive_meds            text[]    default '{}',
  er_threshold             smallint  default 8,
  typical_symptoms         text[]    default '{}',      -- used by ER warning calibration
  prodrome_symptoms        text[]    default '{}',
  rescue_plan              jsonb     default '[]',       -- [{step, action, wait_minutes}]
  emergency_contacts       jsonb     default '[]',       -- [{name, relationship, channel, identifier}]
  -- Cycle
  average_cycle_length     smallint  default 28,
  average_period_length    smallint  default 5,
  -- Sleep
  typical_sleep_target_h   smallint  default 8,
  -- Preferences
  reduced_motion           boolean   default false,
  font_size                text      default 'normal',
  notifications_enabled    boolean   default true,
  hydration_target_ml      int       default 2000,
  hydration_unit           text      default 'ml',
  -- Greli prefs
  show_calories_in_greli   boolean   default false,
  nutrition_in_reports     boolean   default false,
  -- Hypa prefs
  hypa_lock_enabled        boolean   default false,
  include_activity_in_story boolean  default false,
  -- GLP-1
  glp1_reminder_days       text[]    default '{}',      -- e.g. ['wednesday']
  glp1_reminder_time       time,
  -- Thalma prefs
  vivid_dream_threshold_enabled boolean default true,   -- adds +2 to threshold if vividness >= 4
  -- Misc
  med_start_dates          jsonb     default '{}',      -- {medication_name: iso_date}
  last_steroid_pack_date   date,
  oura_token               text,                        -- Phase 2
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- Auto-create profile row on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Friend'),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Migraine Events ──────────────────────────────────────────────────────────
create table if not exists migraine_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  phase           text default 'headache',              -- prodrome | aura | headache | postdrome
  max_pain        smallint,                             -- 1-10
  pain_side       text,                                 -- left | right | both | migrating
  er_visit        boolean default false,
  notes_draft     text,                                 -- open notes written during attack
  attack_story    text,                                 -- Claude-generated narrative
  created_at      timestamptz default now()
);

-- ─── Phase Transitions ────────────────────────────────────────────────────────
create table if not exists phase_transitions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  event_id        uuid not null references migraine_events on delete cascade,
  phase           text not null,
  transitioned_at timestamptz not null default now()
);

-- ─── Symptom Logs ─────────────────────────────────────────────────────────────
create table if not exists symptom_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  event_id        uuid not null references migraine_events on delete cascade,
  symptom_id      text not null,                        -- e.g. 'balance-loss', 'one-sided-weakness-left'
  severity        smallint not null,                    -- 1-5
  check_in_type   text not null default 'initial',      -- initial | periodic | postdrome
  logged_at       timestamptz not null default now()
);

-- ─── Wave Logs ────────────────────────────────────────────────────────────────
-- Time-series pain/nausea readings during attack
create table if not exists wave_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  event_id        uuid not null references migraine_events on delete cascade,
  pain            smallint not null,                    -- 1-10
  nausea          smallint,                             -- 1-5
  logged_at       timestamptz not null default now()
);

-- ─── Triggers ─────────────────────────────────────────────────────────────────
create table if not exists triggers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  name            text not null,
  category        text,                                 -- food | sleep | stress | weather | hormonal | other
  created_at      timestamptz default now(),
  unique (user_id, name)
);

-- ─── Event Triggers ───────────────────────────────────────────────────────────
create table if not exists event_triggers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  event_id        uuid not null references migraine_events on delete cascade,
  trigger_id      uuid not null references triggers on delete cascade
);

-- ─── Medications ──────────────────────────────────────────────────────────────
create table if not exists medications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  name            text not null,
  type            text not null,                        -- abortive | preventive | rescue | other
  dose            text,
  notes           text,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- ─── Medication Doses ─────────────────────────────────────────────────────────
create table if not exists medication_doses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  event_id        uuid references migraine_events on delete set null,
  medication_id   uuid references medications on delete set null,
  medication_name text not null,                        -- denormalized for resilience
  dose            text,
  taken_at        timestamptz not null default now(),
  notes           text
);

-- ─── Daily Check-ins ──────────────────────────────────────────────────────────
create table if not exists daily_checkins (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles on delete cascade,
  date                 date not null,
  -- Core
  mood                 smallint,                        -- 1-5
  stress               smallint,                        -- 1-5
  energy               smallint,                        -- 1-5
  -- Body
  neck_stiffness       smallint,
  -- Sensitivities
  light_sensitivity    smallint,
  sound_sensitivity    smallint,
  weather_sensitivity  smallint,
  -- Prodrome signals
  food_cravings        boolean default false,
  excessive_yawning    boolean default false,
  vision_changes       boolean default false,
  nausea               boolean default false,
  -- Hydration fallback
  hydration_glasses    smallint,
  -- Scores
  threshold_score      smallint,
  threshold_zone       text,
  notes                text,
  created_at           timestamptz default now(),
  unique (user_id, date)
);

-- ─── Appointments ─────────────────────────────────────────────────────────────
create table if not exists appointments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  provider_name   text,
  appointment_type text,                                -- neurologist | gp | other
  scheduled_at    timestamptz,
  completed       boolean default false,
  notes           text,
  created_at      timestamptz default now()
);

-- ─── Portal Messages ──────────────────────────────────────────────────────────
-- Bella-drafted doctor portal messages
create table if not exists portal_messages (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  event_id          uuid references migraine_events on delete set null,
  draft_text        text not null,
  character_count   int,
  steroid_requested boolean default false,
  sent_at           timestamptz,
  created_at        timestamptz default now()
);

-- ─── Weather Readings ─────────────────────────────────────────────────────────
create table if not exists weather_readings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  recorded_at     timestamptz not null default now(),
  pressure_hpa    numeric(7,2),
  pressure_delta  numeric(7,2),                         -- change since last reading
  description     text
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- HYPA — Cycle & Activity
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists cycle_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  cycle_day       smallint,
  flow            text,                                 -- spotting | light | medium | heavy | none
  is_period_start boolean default false,
  period_timing   text,                                 -- early | on_time | late | skipped
  notes           text,
  created_at      timestamptz default now(),
  unique (user_id, date)
);

create table if not exists cycle_symptoms (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  symptom         text not null,
  severity        smallint not null default 1,          -- 1-5
  created_at      timestamptz default now()
);

-- Private activity log (behind optional lock in UI)
create table if not exists activity_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  intensity       text not null,                        -- light | medium | intense
  notes           text,
  include_in_story boolean default false,
  migraine_event_id uuid references migraine_events on delete set null,
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- THALMA — Sleep & Dreams
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists sleep_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  bedtime_at      timestamptz,
  wake_at         timestamptz,
  duration_min    int not null,
  quality         smallint not null,                    -- 1-5
  source          text default 'manual',               -- manual | oura
  oura_id         text,
  notes           text,
  created_at      timestamptz default now(),
  unique (user_id, date)
);

create table if not exists dream_logs (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles on delete cascade,
  date                 date not null,
  dreamed              boolean,                         -- null = not sure
  vividness            smallint,                        -- 1-5
  emotional_tone       text,                            -- neutral|pleasant|anxious|scary|strange|mixed
  tags                 text[]    default '{}',
  note                 text,
  is_medication_related boolean default false,
  created_at           timestamptz default now(),
  unique (user_id, date)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- GRELI — Food & Nourishment
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists food_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  date              date not null,
  logged_at         timestamptz not null default now(),
  meal_type         text,                               -- breakfast | lunch | dinner | snack
  food_name         text not null,
  brand             text,
  calories          int,
  protein_g         numeric(6,2),
  carbs_g           numeric(6,2),
  fat_g             numeric(6,2),
  is_trigger_flagged boolean default false,
  notes             text
);

create table if not exists weight_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  weight          numeric(6,2) not null,
  unit            text not null default 'lbs',          -- lbs | kg
  notes           text,
  created_at      timestamptz default now()
);

create table if not exists glp1_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  date            date not null,
  dose            text,
  notes           text,
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- OSMA — Hydration & Caffeine
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists drink_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  logged_at       timestamptz not null default now(),
  drink_type      text not null,
  brand           text,
  amount_ml       numeric(7,2) not null,
  caffeine_mg     int,                                  -- estimated
  notes           text
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOPHI — Exercise
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists exercise_entries (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references profiles on delete cascade,
  logged_at                timestamptz not null default now(),
  activity_type            text not null,
  duration_min             int not null,
  intensity                text not null,               -- rest | light | moderate | vigorous
  steps                    int,
  notes                    text,
  post_exercise_feeling    text,                        -- fine | triggered | helped | unknown
  post_exercise_checked_at timestamptz
);

create table if not exists exercise_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade unique,
  enjoyed_types   text[]  default '{}',
  days_per_week   smallint default 3,
  equipment       text[]  default '{}',
  current_weekly_plan jsonb,
  updated_at      timestamptz default now()
);

-- ─── Indexes (performance) ────────────────────────────────────────────────────
create index if not exists idx_migraine_events_user_started on migraine_events (user_id, started_at desc);
create index if not exists idx_symptom_logs_event on symptom_logs (event_id, logged_at);
create index if not exists idx_wave_logs_event on wave_logs (event_id, logged_at);
create index if not exists idx_daily_checkins_user_date on daily_checkins (user_id, date desc);
create index if not exists idx_cycle_entries_user_date on cycle_entries (user_id, date desc);
create index if not exists idx_sleep_entries_user_date on sleep_entries (user_id, date desc);
create index if not exists idx_dream_logs_user_date on dream_logs (user_id, date desc);
create index if not exists idx_food_entries_user_date on food_entries (user_id, date desc, logged_at desc);
create index if not exists idx_drink_entries_user_logged on drink_entries (user_id, logged_at desc);
create index if not exists idx_exercise_entries_user_logged on exercise_entries (user_id, logged_at desc);
create index if not exists idx_medication_doses_user_event on medication_doses (user_id, event_id);
