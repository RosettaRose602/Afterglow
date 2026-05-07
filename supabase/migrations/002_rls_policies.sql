-- ============================================================
-- Afterglow — Row-Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on every table
alter table profiles              enable row level security;
alter table migraine_events       enable row level security;
alter table phase_transitions     enable row level security;
alter table symptom_logs          enable row level security;
alter table wave_logs             enable row level security;
alter table triggers              enable row level security;
alter table event_triggers        enable row level security;
alter table medications           enable row level security;
alter table medication_doses      enable row level security;
alter table daily_checkins        enable row level security;
alter table appointments          enable row level security;
alter table portal_messages       enable row level security;
alter table weather_readings      enable row level security;
alter table cycle_entries         enable row level security;
alter table cycle_symptoms        enable row level security;
alter table activity_logs         enable row level security;
alter table sleep_entries         enable row level security;
alter table dream_logs            enable row level security;
alter table food_entries          enable row level security;
alter table weight_logs           enable row level security;
alter table glp1_logs             enable row level security;
alter table drink_entries         enable row level security;
alter table exercise_entries      enable row level security;
alter table exercise_preferences  enable row level security;

-- ─── Helper: current user matches row ─────────────────────────────────────────
-- Used in all policies: auth.uid() = user_id

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Insert is handled by the trigger; no direct insert policy needed.

-- ─── Macro: create standard CRUD policies for a table ─────────────────────────
-- We repeat the pattern for each table rather than using a function
-- so the SQL is readable and auditable.

-- ─── Migraine Events ──────────────────────────────────────────────────────────
create policy "migraine_events select"
  on migraine_events for select using (auth.uid() = user_id);
create policy "migraine_events insert"
  on migraine_events for insert with check (auth.uid() = user_id);
create policy "migraine_events update"
  on migraine_events for update using (auth.uid() = user_id);
create policy "migraine_events delete"
  on migraine_events for delete using (auth.uid() = user_id);

-- ─── Phase Transitions ────────────────────────────────────────────────────────
create policy "phase_transitions select"
  on phase_transitions for select using (auth.uid() = user_id);
create policy "phase_transitions insert"
  on phase_transitions for insert with check (auth.uid() = user_id);
create policy "phase_transitions delete"
  on phase_transitions for delete using (auth.uid() = user_id);

-- ─── Symptom Logs ─────────────────────────────────────────────────────────────
create policy "symptom_logs select"
  on symptom_logs for select using (auth.uid() = user_id);
create policy "symptom_logs insert"
  on symptom_logs for insert with check (auth.uid() = user_id);
create policy "symptom_logs update"
  on symptom_logs for update using (auth.uid() = user_id);
create policy "symptom_logs delete"
  on symptom_logs for delete using (auth.uid() = user_id);

-- ─── Wave Logs ────────────────────────────────────────────────────────────────
create policy "wave_logs select"
  on wave_logs for select using (auth.uid() = user_id);
create policy "wave_logs insert"
  on wave_logs for insert with check (auth.uid() = user_id);
create policy "wave_logs delete"
  on wave_logs for delete using (auth.uid() = user_id);

-- ─── Triggers ─────────────────────────────────────────────────────────────────
create policy "triggers select"
  on triggers for select using (auth.uid() = user_id);
create policy "triggers insert"
  on triggers for insert with check (auth.uid() = user_id);
create policy "triggers update"
  on triggers for update using (auth.uid() = user_id);
create policy "triggers delete"
  on triggers for delete using (auth.uid() = user_id);

-- ─── Event Triggers ───────────────────────────────────────────────────────────
create policy "event_triggers select"
  on event_triggers for select using (auth.uid() = user_id);
create policy "event_triggers insert"
  on event_triggers for insert with check (auth.uid() = user_id);
create policy "event_triggers delete"
  on event_triggers for delete using (auth.uid() = user_id);

-- ─── Medications ──────────────────────────────────────────────────────────────
create policy "medications select"
  on medications for select using (auth.uid() = user_id);
create policy "medications insert"
  on medications for insert with check (auth.uid() = user_id);
create policy "medications update"
  on medications for update using (auth.uid() = user_id);
create policy "medications delete"
  on medications for delete using (auth.uid() = user_id);

-- ─── Medication Doses ─────────────────────────────────────────────────────────
create policy "medication_doses select"
  on medication_doses for select using (auth.uid() = user_id);
create policy "medication_doses insert"
  on medication_doses for insert with check (auth.uid() = user_id);
create policy "medication_doses update"
  on medication_doses for update using (auth.uid() = user_id);
create policy "medication_doses delete"
  on medication_doses for delete using (auth.uid() = user_id);

-- ─── Daily Check-ins ──────────────────────────────────────────────────────────
create policy "daily_checkins select"
  on daily_checkins for select using (auth.uid() = user_id);
create policy "daily_checkins insert"
  on daily_checkins for insert with check (auth.uid() = user_id);
create policy "daily_checkins update"
  on daily_checkins for update using (auth.uid() = user_id);
create policy "daily_checkins delete"
  on daily_checkins for delete using (auth.uid() = user_id);

-- ─── Appointments ─────────────────────────────────────────────────────────────
create policy "appointments select"
  on appointments for select using (auth.uid() = user_id);
create policy "appointments insert"
  on appointments for insert with check (auth.uid() = user_id);
create policy "appointments update"
  on appointments for update using (auth.uid() = user_id);
create policy "appointments delete"
  on appointments for delete using (auth.uid() = user_id);

-- ─── Portal Messages ──────────────────────────────────────────────────────────
create policy "portal_messages select"
  on portal_messages for select using (auth.uid() = user_id);
create policy "portal_messages insert"
  on portal_messages for insert with check (auth.uid() = user_id);
create policy "portal_messages update"
  on portal_messages for update using (auth.uid() = user_id);
create policy "portal_messages delete"
  on portal_messages for delete using (auth.uid() = user_id);

-- ─── Weather Readings ─────────────────────────────────────────────────────────
create policy "weather_readings select"
  on weather_readings for select using (auth.uid() = user_id);
create policy "weather_readings insert"
  on weather_readings for insert with check (auth.uid() = user_id);

-- ─── Cycle Entries ────────────────────────────────────────────────────────────
create policy "cycle_entries select"
  on cycle_entries for select using (auth.uid() = user_id);
create policy "cycle_entries insert"
  on cycle_entries for insert with check (auth.uid() = user_id);
create policy "cycle_entries update"
  on cycle_entries for update using (auth.uid() = user_id);
create policy "cycle_entries delete"
  on cycle_entries for delete using (auth.uid() = user_id);

-- ─── Cycle Symptoms ───────────────────────────────────────────────────────────
create policy "cycle_symptoms select"
  on cycle_symptoms for select using (auth.uid() = user_id);
create policy "cycle_symptoms insert"
  on cycle_symptoms for insert with check (auth.uid() = user_id);
create policy "cycle_symptoms delete"
  on cycle_symptoms for delete using (auth.uid() = user_id);

-- ─── Activity Logs ────────────────────────────────────────────────────────────
create policy "activity_logs select"
  on activity_logs for select using (auth.uid() = user_id);
create policy "activity_logs insert"
  on activity_logs for insert with check (auth.uid() = user_id);
create policy "activity_logs update"
  on activity_logs for update using (auth.uid() = user_id);
create policy "activity_logs delete"
  on activity_logs for delete using (auth.uid() = user_id);

-- ─── Sleep Entries ────────────────────────────────────────────────────────────
create policy "sleep_entries select"
  on sleep_entries for select using (auth.uid() = user_id);
create policy "sleep_entries insert"
  on sleep_entries for insert with check (auth.uid() = user_id);
create policy "sleep_entries update"
  on sleep_entries for update using (auth.uid() = user_id);
create policy "sleep_entries delete"
  on sleep_entries for delete using (auth.uid() = user_id);

-- ─── Dream Logs ───────────────────────────────────────────────────────────────
create policy "dream_logs select"
  on dream_logs for select using (auth.uid() = user_id);
create policy "dream_logs insert"
  on dream_logs for insert with check (auth.uid() = user_id);
create policy "dream_logs update"
  on dream_logs for update using (auth.uid() = user_id);
create policy "dream_logs delete"
  on dream_logs for delete using (auth.uid() = user_id);

-- ─── Food Entries ─────────────────────────────────────────────────────────────
create policy "food_entries select"
  on food_entries for select using (auth.uid() = user_id);
create policy "food_entries insert"
  on food_entries for insert with check (auth.uid() = user_id);
create policy "food_entries update"
  on food_entries for update using (auth.uid() = user_id);
create policy "food_entries delete"
  on food_entries for delete using (auth.uid() = user_id);

-- ─── Weight Logs ──────────────────────────────────────────────────────────────
create policy "weight_logs select"
  on weight_logs for select using (auth.uid() = user_id);
create policy "weight_logs insert"
  on weight_logs for insert with check (auth.uid() = user_id);
create policy "weight_logs delete"
  on weight_logs for delete using (auth.uid() = user_id);

-- ─── GLP-1 Logs ───────────────────────────────────────────────────────────────
create policy "glp1_logs select"
  on glp1_logs for select using (auth.uid() = user_id);
create policy "glp1_logs insert"
  on glp1_logs for insert with check (auth.uid() = user_id);
create policy "glp1_logs delete"
  on glp1_logs for delete using (auth.uid() = user_id);

-- ─── Drink Entries ────────────────────────────────────────────────────────────
create policy "drink_entries select"
  on drink_entries for select using (auth.uid() = user_id);
create policy "drink_entries insert"
  on drink_entries for insert with check (auth.uid() = user_id);
create policy "drink_entries delete"
  on drink_entries for delete using (auth.uid() = user_id);

-- ─── Exercise Entries ─────────────────────────────────────────────────────────
create policy "exercise_entries select"
  on exercise_entries for select using (auth.uid() = user_id);
create policy "exercise_entries insert"
  on exercise_entries for insert with check (auth.uid() = user_id);
create policy "exercise_entries update"
  on exercise_entries for update using (auth.uid() = user_id);
create policy "exercise_entries delete"
  on exercise_entries for delete using (auth.uid() = user_id);

-- ─── Exercise Preferences ─────────────────────────────────────────────────────
create policy "exercise_preferences select"
  on exercise_preferences for select using (auth.uid() = user_id);
create policy "exercise_preferences insert"
  on exercise_preferences for insert with check (auth.uid() = user_id);
create policy "exercise_preferences update"
  on exercise_preferences for update using (auth.uid() = user_id);
