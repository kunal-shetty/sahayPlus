-- =============================================================================
-- Sahay+ demo seed: 15 Oct 2026 -> 1 Nov 2026 (today)
-- Care receiver : Harsh  (4b3d2d00-e4fa-437b-8abd-16cde56cb5f7)
-- Caregiver     : Kunal  (a145aa99-d6a4-4981-9582-f481d3226236)
-- Alt caregiver : sakshi (73be6466-d69a-4184-bcd4-7160cd5d331e)
--
-- Run AFTER truncating the public tables. auth.users must still contain the
-- three ids above (public.users.id references auth.users.id).
-- All times are IST (Asia/Kolkata). 1 Nov is filled through the afternoon;
-- the evening dose is left unlogged (still pending).
-- =============================================================================

begin;

-- Fixed ids so everything below can reference them
-- relationship : 6bf08cde-e688-4991-8609-ae77bbeaf981
-- medications  : 11111111-0000-4000-8000-00000000000{1..6}

-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
insert into public.users (id, email, phone, name, nickname, role, care_code, prefer_voice_confirm, created_at)
values
  ('4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'harsh@gmail.com',  '9876543210', 'Harsh',  'Dada', 'care_receiver', 'T9TSXM', false, '2026-08-07 21:05:00+05:30'),
  ('a145aa99-d6a4-4981-9582-f481d3226236', 'kunal@gmail.com',  '9307630015', 'Kunal',  null,   'caregiver',     null,     false, '2026-08-07 21:00:00+05:30'),
  ('73be6466-d69a-4184-bcd4-7160cd5d331e', 'sakshi@gmail.com', null,         'Sakshi', null,   'caregiver',     null,     false, '2026-08-07 21:10:00+05:30')
on conflict (id) do update set
  email = excluded.email, phone = excluded.phone, name = excluded.name,
  nickname = excluded.nickname, role = excluded.role, care_code = excluded.care_code;

-- -----------------------------------------------------------------------------
-- 2. care_relationships
-- Streak: last miss is 26 Oct -> 27..31 Oct all complete = 5 days
-- -----------------------------------------------------------------------------
insert into public.care_relationships
  (id, caregiver_id, alt_caregiver_id, care_receiver_id, caregiver_status,
   independent_times, current_streak, longest_streak, total_days_tracked, created_at)
values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981',
   'a145aa99-d6a4-4981-9582-f481d3226236',
   '73be6466-d69a-4184-bcd4-7160cd5d331e',
   '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7',
   'active', '{}', 5, 5, 17, '2026-08-07 21:10:04+05:30');

-- -----------------------------------------------------------------------------
-- 3. medications
-- notes carry the app's visual meta tag (color / shape / food timing)
-- -----------------------------------------------------------------------------
insert into public.medications
  (id, care_relationship_id, name, dosage, time_of_day, time, notes, simple_explanation,
   refill_days_left, pharmacist_note, is_active, created_at, updated_at)
values
  ('11111111-0000-4000-8000-000000000001', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Pantoprazole', '40 mg', 'morning', '07:30',
   'Empty stomach, 30 min before breakfast' || chr(10) || '<!--SAHAY_META:{"color":"yellow","shape":"oval","foodInstruction":"before_meal","simpleExplanation":"Protects your stomach from acidity"}:SAHAY_META-->',
   'Protects your stomach from acidity', 18, null, true,
   '2026-10-10 10:00:00+05:30', '2026-10-10 10:00:00+05:30'),

  ('11111111-0000-4000-8000-000000000002', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Metformin', '500 mg', 'morning', '08:30',
   'Take with breakfast' || chr(10) || '<!--SAHAY_META:{"color":"white","shape":"round","foodInstruction":"with_meal","simpleExplanation":"Keeps your blood sugar in control"}:SAHAY_META-->',
   'Keeps your blood sugar in control', 21, 'Take with food to avoid stomach upset', true,
   '2026-10-10 10:01:00+05:30', '2026-10-10 10:01:00+05:30'),

  ('11111111-0000-4000-8000-000000000003', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Amlodipine', '5 mg', 'morning', '09:00',
   '<!--SAHAY_META:{"color":"pink","shape":"round","foodInstruction":"anytime","simpleExplanation":"Keeps your blood pressure normal"}:SAHAY_META-->',
   'Keeps your blood pressure normal', 4, null, true,
   '2026-10-10 10:02:00+05:30', '2026-10-10 10:02:00+05:30'),

  ('11111111-0000-4000-8000-000000000004', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Aspirin', '75 mg', 'afternoon', '13:30',
   'After lunch' || chr(10) || '<!--SAHAY_META:{"color":"orange","shape":"round","foodInstruction":"after_meal","simpleExplanation":"Keeps your blood flowing smoothly for a healthy heart"}:SAHAY_META-->',
   'Keeps your blood flowing smoothly for a healthy heart', 25, 'Always after a meal', true,
   '2026-10-10 10:03:00+05:30', '2026-10-10 10:03:00+05:30'),

  ('11111111-0000-4000-8000-000000000005', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Vitamin D3', '1000 IU', 'afternoon', '14:00',
   '<!--SAHAY_META:{"color":"yellow","shape":"capsule","foodInstruction":"with_meal","simpleExplanation":"Makes your bones strong"}:SAHAY_META-->',
   'Makes your bones strong', 40, null, true,
   '2026-10-10 10:04:00+05:30', '2026-10-10 10:04:00+05:30'),

  ('11111111-0000-4000-8000-000000000006', '6bf08cde-e688-4991-8609-ae77bbeaf981',
   'Atorvastatin', '10 mg', 'evening', '21:00',
   'After dinner' || chr(10) || '<!--SAHAY_META:{"color":"white","shape":"oval","foodInstruction":"after_meal","simpleExplanation":"Keeps your cholesterol low"}:SAHAY_META-->',
   'Keeps your cholesterol low', 12, null, true,
   '2026-10-10 10:05:00+05:30', '2026-10-10 10:05:00+05:30');

-- -----------------------------------------------------------------------------
-- 4. medication_logs (one row per med per day; misses stored as taken=false)
-- -----------------------------------------------------------------------------
create temp table seed_misses (date date, medication_id uuid) on commit drop;
insert into seed_misses values
  ('2026-10-17', '11111111-0000-4000-8000-000000000006'),  -- fell asleep early
  ('2026-10-20', '11111111-0000-4000-8000-000000000005'),
  ('2026-10-22', '11111111-0000-4000-8000-000000000001'),  -- unwell day
  ('2026-10-22', '11111111-0000-4000-8000-000000000002'),
  ('2026-10-26', '11111111-0000-4000-8000-000000000006');

insert into public.medication_logs (medication_id, date, taken, taken_at, marked_by, created_at)
select
  m.id,
  d::date,
  (s.medication_id is null)                                         as taken,
  case when s.medication_id is null then t.taken_at end             as taken_at,
  case when s.medication_id is null then
    case when abs(hashtext(m.id::text || d::text)) % 6 = 0
         then 'a145aa99-d6a4-4981-9582-f481d3226236'::uuid           -- Kunal marked it
         else '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'::uuid end       -- Harsh marked it
  end                                                               as marked_by,
  coalesce(t.taken_at, ((d::date + m.time + interval '2 hours') at time zone 'Asia/Kolkata'))
from generate_series('2026-10-15'::date, '2026-11-01'::date, interval '1 day') d
cross join public.medications m
left join seed_misses s on s.date = d::date and s.medication_id = m.id
cross join lateral (
  select ((d::date + m.time) at time zone 'Asia/Kolkata')
         + ((abs(hashtext(m.id::text || d::text)) % 36) - 10) * interval '1 minute'
         + (abs(hashtext(d::text || m.name)) % 60) * interval '1 second' as taken_at
) t
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and not (d::date = '2026-11-01' and m.time_of_day = 'evening');   -- tonight still pending

-- -----------------------------------------------------------------------------
-- 5. timeline_events: medication_taken / medication_skipped
-- -----------------------------------------------------------------------------
insert into public.timeline_events (care_relationship_id, type, medication_id, note, actor_id, actor_type, created_at)
select
  '6bf08cde-e688-4991-8609-ae77bbeaf981',
  case when l.taken then 'medication_taken' else 'medication_skipped' end::timeline_event_type,
  l.medication_id,
  case when l.taken then null else 'Dose not confirmed' end,
  coalesce(l.marked_by, '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'),
  case when l.marked_by = 'a145aa99-d6a4-4981-9582-f481d3226236' then 'caregiver' else 'care_receiver' end::actor_type,
  coalesce(l.taken_at, l.created_at) + interval '1 second'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981';

-- -----------------------------------------------------------------------------
-- 6. day_closures (15 -> 31 Oct; today is still open) + day_closed events
-- -----------------------------------------------------------------------------
insert into public.day_closures (care_relationship_id, date, closed_at, all_taken, total_meds, taken_count, closed_by)
select
  '6bf08cde-e688-4991-8609-ae77bbeaf981',
  l.date,
  ((l.date + time '22:30') at time zone 'Asia/Kolkata') + (abs(hashtext(l.date::text)) % 25) * interval '1 minute',
  bool_and(l.taken),
  count(*),
  count(*) filter (where l.taken),
  'a145aa99-d6a4-4981-9582-f481d3226236'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and l.date <= '2026-10-31'
group by l.date;

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at)
select care_relationship_id, 'day_closed',
       'Day closed with ' || taken_count || '/' || total_meds || ' taken',
       closed_by, 'caregiver', closed_at
from public.day_closures
where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981';

-- -----------------------------------------------------------------------------
-- 7. wellness_entries + wellness_logged events
-- -----------------------------------------------------------------------------
create temp table seed_wellness (date date, level wellness_level, note text, at_time time) on commit drop;
insert into seed_wellness values
  ('2026-10-15', 'great',     null,                              '10:12'),
  ('2026-10-16', 'okay',      null,                              '10:40'),
  ('2026-10-17', 'great',     null,                              '09:55'),
  ('2026-10-18', 'great',     'Grandkids visited today',         '11:20'),
  ('2026-10-19', 'okay',      'Slight knee pain',                '10:05'),
  ('2026-10-20', 'okay',      null,                              '10:30'),
  ('2026-10-21', 'great',     null,                              '09:48'),
  ('2026-10-22', 'not_great', 'Feeling dizzy and tired since morning', '11:45'),
  ('2026-10-23', 'okay',      'Better than yesterday',           '10:15'),
  ('2026-10-24', 'great',     null,                              '10:02'),
  ('2026-10-25', 'great',     null,                              '09:50'),
  ('2026-10-26', 'okay',      'Did not sleep well',              '10:35'),
  ('2026-10-27', 'great',     null,                              '10:10'),
  ('2026-10-28', 'great',     null,                              '09:58'),
  ('2026-10-29', 'okay',      null,                              '10:22'),
  ('2026-10-30', 'great',     'Went for a walk in the park',     '18:10'),
  ('2026-10-31', 'great',     null,                              '10:05'),
  ('2026-11-01', 'great',     null,                              '10:00');

insert into public.wellness_entries (care_relationship_id, user_id, date, level, note, created_at)
select '6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7',
       date, level, note, (date + at_time) at time zone 'Asia/Kolkata'
from seed_wellness;

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at)
select '6bf08cde-e688-4991-8609-ae77bbeaf981', 'wellness_logged',
       case level when 'great' then 'Feeling great'
                  when 'okay'  then 'Feeling okay'
                  else 'Not feeling great' end
       || coalesce(' - ' || note, ''),
       '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'care_receiver',
       ((date + at_time) at time zone 'Asia/Kolkata') + interval '1 second'
from seed_wellness;

-- -----------------------------------------------------------------------------
-- 8. safety check on the unwell day (22 Oct), dismissed via fine check-in
-- -----------------------------------------------------------------------------
insert into public.safety_checks (care_relationship_id, status, triggered_at, resolved_at, escalated_to)
values ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'dismissed',
        '2026-10-22 11:00:00+05:30', '2026-10-22 11:44:00+05:30', null);

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at) values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'safety_check_triggered', 'Safety check triggered', null, null, '2026-10-22 11:00:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'fine_check_in', 'Harsh checked in: I''m fine', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'care_receiver', '2026-10-22 11:44:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'safety_check_dismissed', 'Safety check resolved', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'care_receiver', '2026-10-22 11:44:01+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'check_in', 'Kunal called to check in', 'a145aa99-d6a4-4981-9582-f481d3226236', 'caregiver', '2026-10-22 12:10:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'note_added', 'Note added for 22 Oct', 'a145aa99-d6a4-4981-9582-f481d3226236', 'caregiver', '2026-10-22 12:20:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'refill_noted', 'Amlodipine running low (4 days left)', 'a145aa99-d6a4-4981-9582-f481d3226236', 'caregiver', '2026-10-30 19:15:00+05:30');

-- -----------------------------------------------------------------------------
-- 9. contextual_notes
-- -----------------------------------------------------------------------------
insert into public.contextual_notes (care_relationship_id, text, linked_type, linked_medication_id, linked_date, created_at, created_by) values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Felt dizzy in the morning, skipped breakfast so skipped morning meds. Called him, he is fine now. Keep an eye on BP.',
   'day', null, '2026-10-22', '2026-10-22 12:20:00+05:30', 'a145aa99-d6a4-4981-9582-f481d3226236'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Dr. Smith said to keep Metformin with breakfast only, never on an empty stomach.',
   'medication', '11111111-0000-4000-8000-000000000002', null, '2026-10-16 19:30:00+05:30', 'a145aa99-d6a4-4981-9582-f481d3226236'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Often falls asleep before 9 PM, try reminding around 8:45.',
   'medication', '11111111-0000-4000-8000-000000000006', null, '2026-10-27 08:15:00+05:30', 'a145aa99-d6a4-4981-9582-f481d3226236');

-- -----------------------------------------------------------------------------
-- 10. messages
-- -----------------------------------------------------------------------------
insert into public.messages (care_relationship_id, from_user_id, text, is_read, created_at) values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Good morning Dada! Don''t forget your Pantoprazole before breakfast.', true, '2026-10-15 07:20:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'Yes beta, taken.', true, '2026-10-15 07:45:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'You missed your night tablet yesterday. Everything okay?', true, '2026-10-18 08:05:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'I slept early, sorry. Will take it tonight.', true, '2026-10-18 09:10:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'Kids came over today, very happy!', true, '2026-10-18 17:30:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Dada, you said you are feeling dizzy. Please sit down and drink some water, I am calling you.', true, '2026-10-22 11:50:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'Feeling better now after lunch.', true, '2026-10-22 14:05:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Great to hear. Rest well today.', true, '2026-10-22 14:10:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Hi Dada, gentle reminder to take your Atorvastatin after dinner tonight.', true, '2026-10-27 20:40:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'Done!', true, '2026-10-27 21:05:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Amlodipine is running low, I will pick up a refill on Saturday.', true, '2026-10-30 19:20:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'Ok beta. I went for a walk in the park today.', true, '2026-10-30 19:45:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'a145aa99-d6a4-4981-9582-f481d3226236', 'Proud of you! 5 days in a row with all medicines taken.', true, '2026-10-31 22:45:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'I took my medicine', false, '2026-11-01 13:40:00+05:30');

-- -----------------------------------------------------------------------------
-- 11. emergency + pharmacist contacts
-- -----------------------------------------------------------------------------
insert into public.emergency_contacts (care_relationship_id, name, relationship, phone, is_primary, created_at) values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Kunal',     'Son',    '9307630015', true,  '2026-10-10 10:10:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Dr. Smith', 'Doctor', '9321834762', false, '2026-10-10 10:11:00+05:30');

insert into public.pharmacist_contacts (care_relationship_id, name, phone, address, last_refill_confirm, note, created_at) values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981', 'Apollo Pharmacy', '9820012345', 'Shop 4, Hill Road, Bandra West, Mumbai',
   '2026-10-12 18:30:00+05:30', 'Delivers within 2 hours, call before 8 PM', '2026-10-10 10:12:00+05:30');

-- -----------------------------------------------------------------------------
-- 12. notifications (caregiver)
-- -----------------------------------------------------------------------------
-- Medication Taken: one per dose Harsh confirmed himself
insert into public.notifications (user_id, title, body, created_at, sent_at)
select 'a145aa99-d6a4-4981-9582-f481d3226236', 'Medication Taken',
       'Harsh took ' || m.name, l.taken_at + interval '2 seconds', l.taken_at + interval '1 second'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and l.taken and l.marked_by = '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7';

-- Missed Dose Alert: one per missed dose, 60 min after schedule
insert into public.notifications (user_id, title, body, created_at, sent_at)
select 'a145aa99-d6a4-4981-9582-f481d3226236', '⚠️ Missed Dose Alert',
       'Harsh has not confirmed ' || m.name || ' (' || m.dosage || '). Scheduled 60m ago.',
       ((l.date + m.time + interval '60 minutes') at time zone 'Asia/Kolkata'),
       ((l.date + m.time + interval '60 minutes') at time zone 'Asia/Kolkata')
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and not l.taken;

insert into public.notifications (user_id, title, body, created_at, sent_at) values
  ('a145aa99-d6a4-4981-9582-f481d3226236', '⚠️ Refill Needed Soon', 'Amlodipine has only 4 days of supply left for Harsh.', '2026-10-30 19:00:00+05:30', '2026-10-30 19:00:00+05:30'),
  ('a145aa99-d6a4-4981-9582-f481d3226236', 'Safety Check', 'Harsh reported not feeling great. A safety check was sent.', '2026-10-22 11:00:00+05:30', '2026-10-22 11:00:00+05:30'),
  ('a145aa99-d6a4-4981-9582-f481d3226236', 'Harsh is okay', 'Harsh responded to the safety check: I''m fine.', '2026-10-22 11:44:02+05:30', '2026-10-22 11:44:02+05:30');

commit;
