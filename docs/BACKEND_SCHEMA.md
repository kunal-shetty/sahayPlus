# Sahay+ Backend Database Schema

A comprehensive database schema for the Sahay+ medication management and caregiving application.

---

## Overview

Sahay+ needs a backend to support:
- **User authentication** (caregivers, care receivers, pharmacists)
- **Care relationships** between caregivers and care receivers
- **Medication tracking** with refill awareness
- **Shared timeline** for transparency
- **Wellness tracking** and daily check-ins
- **Messaging** between care parties
- **Safety checks** and emergency contacts

---

## Database Tables

### 1. `users`

All users of the application.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | VARCHAR(255) | Unique email |
| `phone` | VARCHAR(20) | Phone number |
| `name` | VARCHAR(100) | Display name |
| `nickname` | VARCHAR(100) | Name displayed to Caregiver/Care-receiver |
| `role` | ENUM | `caregiver`, `care_receiver`, `pharmacist` |
| `prefer_voice_confirm` | BOOLEAN | Voice confirmation mode |
| `push_token` | TEXT | Push notification token |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

### 2. `care_relationships`

Links caregivers to care receivers (the "care circle").

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `caregiver_id` | UUID | FK → users |
| `alt_caregiver_id` | UUID | FK → users |
| `care_receiver_id` | UUID | FK → users |
| `caregiver_status` | ENUM | `active`, `away`, `independent` |
| `away_until` | TIMESTAMP | When caregiver returns |
| `independent_times` | TEXT[] | Times care receiver manages alone |
| `current_streak` | INTEGER | Current consecutive days |
| `longest_streak` | INTEGER | Best streak |
| `total_days_tracked` | INTEGER | Total days using app |
| `created_at` | TIMESTAMP | Relationship start date |

---

### 3. `medications`

Medication definitions and settings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `name` | VARCHAR(100) | Medication name |
| `dosage` | VARCHAR(50) | Dosage (e.g., "500mg") |
| `time_of_day` | ENUM | `morning`, `afternoon`, `evening` |
| `time` | TIME | Time of day |
| `notes` | TEXT | General notes |
| `simple_explanation` | TEXT | Human-friendly explanation |
| `refill_days_left` | INTEGER | Days until refill needed |
| `pharmacist_note` | TEXT | Note from pharmacist |
| `is_active` | BOOLEAN | Currently prescribed |
| `created_at` | TIMESTAMP | When added |
| `updated_at` | TIMESTAMP | Last update |

---

### 4. `medication_logs`

Daily medication taken/skipped records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `medication_id` | UUID | FK → medications |
| `date` | DATE | The date |
| `taken` | BOOLEAN | Was it taken? |
| `taken_at` | TIMESTAMP | When it was taken |
| `marked_by` | UUID | FK → users (who marked it) |
| `streak` | INTEGER | Consecutive days at logging time |
| `created_at` | TIMESTAMP | Log creation time |

---

### 5. `timeline_events`

Shared activity timeline for transparency.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `type` | ENUM | Event type (see below) |
| `medication_id` | UUID | FK → medications (optional) |
| `note` | TEXT | Additional context |
| `actor_id` | UUID | FK → users |
| `actor_type` | ENUM | `caregiver`, `care_receiver`, `pharmacist` |
| `created_at` | TIMESTAMP | Event time |

**Event Types:**
- `medication_taken`, `medication_skipped`
- `dose_changed`, `medication_added`, `medication_removed`
- `refill_noted`, `note_added`, `check_in`
- `day_closed`, `wellness_logged`
- `safety_check_triggered`, `safety_check_dismissed`, `safety_check_escalated`
- `fine_check_in`, `help_requested`
- `handover_started`, `handover_ended`
- `routine_changed`

---

### 6. `contextual_notes`

Time-fading notes linked to medications or days.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `text` | TEXT | Note content |
| `linked_type` | ENUM | `medication` or `day` |
| `linked_medication_id` | UUID | FK → medications (optional) |
| `linked_date` | DATE | Specific date (optional) |
| `created_at` | TIMESTAMP | Note creation time |
| `created_by` | UUID | FK → users |

---

### 7. `day_closures`

Daily summary/closure ritual records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `date` | DATE | The date |
| `closed_at` | TIMESTAMP | When day was closed |
| `all_taken` | BOOLEAN | Were all meds taken? |
| `total_meds` | INTEGER | Total medications that day |
| `taken_count` | INTEGER | How many were taken |
| `closed_by` | UUID | FK → users |

---

### 8. `wellness_entries`

Daily wellness check-ins from care receiver.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `user_id` | UUID | FK → users |
| `date` | DATE | The date |
| `level` | ENUM | `great`, `okay`, `not_great` |
| `note` | TEXT | Optional note |
| `created_at` | TIMESTAMP | Entry time |

---

### 9. `messages`

Care messages between users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `from_user_id` | UUID | FK → users |
| `text` | TEXT | Message content |
| `created_at` | TIMESTAMP | Sent time |

---

### 10. `emergency_contacts`

Emergency contact information per care relationship.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `name` | VARCHAR(100) | Contact name |
| `relationship` | VARCHAR(50) | e.g., "Family Doctor", "Hospital" |
| `phone` | VARCHAR(20) | Phone number |
| `is_primary` | BOOLEAN | Primary contact? |
| `created_at` | TIMESTAMP | When added |

---

### 11. `pharmacist_contacts`

Pharmacy information per care relationship.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `name` | VARCHAR(100) | Pharmacy name |
| `phone` | VARCHAR(20) | Phone number |
| `address` | TEXT | Address |
| `last_refill_confirm` | TIMESTAMP | Last refill pickup |
| `note` | TEXT | Notes (e.g., "Ask for Mr. Sharma") |

---

### 12. `handovers`

Temporary care handover records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `from_caregiver_id` | UUID | FK → users |
| `to_person_name` | VARCHAR(100) | Can be non-registered user |
| `start_date` | TIMESTAMP | Handover start |
| `end_date` | TIMESTAMP | Handover end |
| `is_active` | BOOLEAN | Currently active? |
| `created_at` | TIMESTAMP | When created |

---

### 13. `safety_checks`

Safety check events and escalations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `care_relationship_id` | UUID | FK → care_relationships |
| `status` | ENUM | `pending`, `dismissed`, `escalated` |
| `triggered_at` | TIMESTAMP | When triggered |
| `resolved_at` | TIMESTAMP | When resolved |
| `escalated_to` | UUID | FK → users (optional) |

---

### 14. `notifications`

Push notification records and logs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users |
| `type` | ENUM | Notification type |
| `title` | VARCHAR(200) | Notification title |
| `body` | TEXT | Notification body |
| `created_at` | TIMESTAMP | When created |
| `sent_at` | TIMESTAMP | When sent |

**Notification Types:**
- `medication_reminder`
- `refill_warning`
- `safety_alert`
- `wellness_reminder`
- `message`
- `check_in_suggestion`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Care Relationships
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/care-relationships` | Create care circle |
| GET | `/care-relationships` | List my care circles |
| GET | `/care-relationships/:id` | Get specific relationship |
| PATCH | `/care-relationships/:id` | Update (status, etc.) |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/medications` | List medications |
| POST | `/medications` | Add medication |
| GET | `/medications/:id` | Get medication |
| PATCH | `/medications/:id` | Update medication |
| DELETE | `/medications/:id` | Remove medication |
| POST | `/medications/:id/take` | Mark as taken |
| POST | `/medications/:id/skip` | Mark as skipped |

### Timeline & Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/timeline` | Fetch timeline |
| POST | `/notes` | Add contextual note |
| GET | `/notes` | List notes |
| DELETE | `/notes/:id` | Remove note |

### Wellness & Day Closure
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wellness` | Log wellness |
| GET | `/wellness` | Get wellness history |
| POST | `/day/close` | Close the day |
| GET | `/day/history` | Day closure history |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | Get messages |
| POST | `/messages` | Send message |
| PATCH | `/messages/:id/read` | Mark as read |

### Safety & Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/safety-check/trigger` | Trigger safety check |
| POST | `/safety-check/dismiss` | Dismiss safety check |
| GET | `/emergency-contacts` | List contacts |
| POST | `/emergency-contacts` | Add contact |
| DELETE | `/emergency-contacts/:id` | Remove contact |

### Handover
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/handover/start` | Start handover |
| POST | `/handover/end` | End handover |
| GET | `/handover/current` | Get active handover |

---

## Next Steps

1. Choose a backend platform (Supabase recommended for speed)
2. Create database migrations
3. Implement authentication flow
4. Build API routes
5. Connect frontend to backend
6. Add real-time subscriptions for timeline
7. Implement push notifications
