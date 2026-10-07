-- =============================================================================
--  HOSPITAL MANAGEMENT – PATIENT APP · DATABASE SCHEMA
--  Database : PostgreSQL 13+
--  Part 2   : the remaining 50 tables (users is already created)
-- =============================================================================
--
--  BEFORE RUNNING
--  • These must already exist (created with the users script):
--      users table, user_status type, set_updated_at() function
--  • Run the whole file as a script (DBeaver: Alt + X).
--  • The file is wrapped in BEGIN ... COMMIT. If any statement fails,
--    PostgreSQL rolls everything back, so you can fix the error and
--    simply run the file again. Nothing is left half-created.
--
--  CONVENTIONS
--  • Primary keys : id BIGINT GENERATED ALWAYS AS IDENTITY
--  • Money        : NUMERIC(12,2) in INR
--  • Timestamps   : TIMESTAMPTZ (stored in UTC)
--  • updated_at   : kept current by the shared set_updated_at() trigger
--  • Indexes      : PostgreSQL does not index foreign keys automatically,
--                   so the important ones are indexed below each table.
-- =============================================================================

BEGIN;

-- Same function as the users script. CREATE OR REPLACE makes it safe to repeat.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- Accounts
CREATE TYPE otp_purpose            AS ENUM ('sign_in', 'change_mobile', 'reset_password');
CREATE TYPE device_platform        AS ENUM ('ios', 'android');
CREATE TYPE login_method           AS ENUM ('otp', 'password', 'biometric');
CREATE TYPE weight_unit            AS ENUM ('kg', 'lb');
CREATE TYPE height_unit            AS ENUM ('cm', 'ft_in');

-- Patients
CREATE TYPE gender                 AS ENUM ('male', 'female', 'other');
CREATE TYPE blood_group            AS ENUM ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');
CREATE TYPE family_relation        AS ENUM ('self', 'spouse', 'child', 'parent', 'sibling', 'other');
CREATE TYPE allergy_severity       AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE condition_status       AS ENUM ('active', 'resolved');

-- Hospital setup
CREATE TYPE room_type              AS ENUM ('opd', 'lab', 'radiology', 'pharmacy', 'billing', 'insurance_desk', 'other');
CREATE TYPE ward_type              AS ENUM ('general', 'semi_private', 'private', 'icu', 'emergency', 'pediatric', 'maternity');
CREATE TYPE bed_status             AS ENUM ('available', 'occupied', 'cleaning', 'maintenance', 'reserved');
CREATE TYPE schedule_visit_type    AS ENUM ('in_person', 'video', 'both');

-- Admissions & billing
CREATE TYPE admission_type         AS ENUM ('planned', 'emergency', 'day_care');
CREATE TYPE admission_status       AS ENUM ('admitted', 'discharged', 'transferred', 'cancelled');
CREATE TYPE invoice_status         AS ENUM ('draft', 'unpaid', 'partially_paid', 'paid', 'cancelled', 'refunded');
CREATE TYPE invoice_item_type      AS ENUM ('consultation', 'lab_test', 'radiology', 'pharmacy', 'room_charge', 'procedure', 'other');
CREATE TYPE payment_method         AS ENUM ('upi', 'card', 'net_banking', 'cash_counter', 'insurance');
CREATE TYPE payment_status         AS ENUM ('initiated', 'pending', 'success', 'failed', 'refunded');

-- Appointments
CREATE TYPE visit_type             AS ENUM ('in_person', 'video');
CREATE TYPE appointment_status     AS ENUM ('pending', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show', 'rescheduled');
CREATE TYPE cancelled_by           AS ENUM ('patient', 'hospital');
CREATE TYPE queue_token_status     AS ENUM ('waiting', 'called', 'in_consultation', 'done', 'skipped');
CREATE TYPE video_call_status      AS ENUM ('scheduled', 'waiting', 'in_progress', 'completed', 'failed', 'missed');
CREATE TYPE message_sender         AS ENUM ('patient', 'doctor');

-- Vitals
CREATE TYPE vital_type             AS ENUM ('blood_pressure', 'heart_rate', 'blood_sugar', 'weight', 'spo2', 'temperature');
CREATE TYPE sugar_context          AS ENUM ('fasting', 'post_meal', 'random');
CREATE TYPE vital_status           AS ENUM ('normal', 'low', 'high', 'borderline');
CREATE TYPE vital_source           AS ENUM ('hospital', 'home');

-- Records & lab
CREATE TYPE record_type            AS ENUM ('lab_report', 'scan', 'ecg', 'prescription', 'discharge_summary', 'other');
CREATE TYPE result_summary         AS ENUM ('normal', 'abnormal', 'pending', 'not_applicable');
CREATE TYPE lab_report_status      AS ENUM ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled');
CREATE TYPE lab_result_flag        AS ENUM ('low', 'normal', 'high', 'borderline', 'critical');

-- Medicines & pharmacy
CREATE TYPE medicine_form          AS ENUM ('tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'inhaler', 'other');
CREATE TYPE prescription_status    AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE meal_timing            AS ENUM ('before_food', 'after_food', 'with_food', 'any');
CREATE TYPE dose_status            AS ENUM ('pending', 'taken', 'missed', 'skipped');
CREATE TYPE fulfilment_type        AS ENUM ('home_delivery', 'pickup');
CREATE TYPE pharmacy_order_status  AS ENUM ('placed', 'verified', 'packed', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled');

-- Insurance
CREATE TYPE policy_status          AS ENUM ('pending_verification', 'active', 'expired', 'suspended');
CREATE TYPE claim_status           AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'partially_approved', 'rejected', 'not_covered', 'settled');
CREATE TYPE claim_document_type    AS ENUM ('bill', 'discharge_summary', 'prescription', 'lab_report', 'id_proof', 'policy_card', 'other');

-- Emergency & notifications
CREATE TYPE ambulance_type         AS ENUM ('basic', 'advanced', 'icu');
CREATE TYPE ambulance_status       AS ENUM ('available', 'dispatched', 'busy', 'maintenance');
CREATE TYPE emergency_request_type AS ENUM ('sos', 'call_108', 'hospital_er_call');
CREATE TYPE emergency_status       AS ENUM ('requested', 'acknowledged', 'dispatched', 'arrived', 'completed', 'cancelled');
CREATE TYPE notification_type      AS ENUM ('queue_update', 'appointment', 'lab_report', 'medicine_reminder', 'billing', 'insurance', 'pharmacy', 'emergency', 'general');
CREATE TYPE push_status            AS ENUM ('not_sent', 'sent', 'failed');


-- =============================================================================
-- A. ACCOUNTS & AUTH  (users already exists)
-- =============================================================================

-- A2. file_uploads -----------------------------------------------------------
CREATE TABLE file_uploads (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  uploaded_by_user_id  BIGINT       NULL,
  storage_key          VARCHAR(500) NOT NULL,
  original_name        VARCHAR(255) NULL,
  mime_type            VARCHAR(100) NOT NULL,
  size_bytes           BIGINT       NOT NULL,
  checksum_sha256      CHAR(64)     NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_file_uploads PRIMARY KEY (id),
  CONSTRAINT uq_file_uploads_storage_key UNIQUE (storage_key),
  CONSTRAINT chk_file_uploads_size CHECK (size_bytes >= 0),
  CONSTRAINT fk_file_uploads_uploaded_by_user_id
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads (uploaded_by_user_id);

COMMENT ON COLUMN file_uploads.uploaded_by_user_id IS 'NULL = uploaded by hospital system/staff';
COMMENT ON COLUMN file_uploads.storage_key         IS 'Object storage key (S3/GCS path)';


-- A3. otp_verifications ------------------------------------------------------
CREATE TABLE otp_verifications (
  id            BIGINT GENERATED ALWAYS AS IDENTITY,
  mobile        VARCHAR(15)  NOT NULL,
  otp_hash      VARCHAR(255) NOT NULL,
  purpose       otp_purpose  NOT NULL DEFAULT 'sign_in',
  attempts      SMALLINT     NOT NULL DEFAULT 0,
  max_attempts  SMALLINT     NOT NULL DEFAULT 5,
  expires_at    TIMESTAMPTZ  NOT NULL,
  verified_at   TIMESTAMPTZ  NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_otp_verifications PRIMARY KEY (id),
  CONSTRAINT chk_otp_verifications_attempts CHECK (attempts >= 0 AND max_attempts > 0)
);
CREATE INDEX idx_otp_mobile_purpose_created ON otp_verifications (mobile, purpose, created_at);

COMMENT ON COLUMN otp_verifications.otp_hash   IS 'Never store the plain OTP';
COMMENT ON COLUMN otp_verifications.ip_address IS 'IPv4 or IPv6';


-- A4. user_devices -----------------------------------------------------------
CREATE TABLE user_devices (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id            BIGINT          NOT NULL,
  platform           device_platform NOT NULL,
  device_identifier  VARCHAR(255)    NOT NULL,
  device_name        VARCHAR(100)    NULL,
  push_token         VARCHAR(500)    NULL,
  app_version        VARCHAR(20)     NULL,
  biometric_enabled  BOOLEAN         NOT NULL DEFAULT FALSE,
  last_active_at     TIMESTAMPTZ     NULL,
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT pk_user_devices PRIMARY KEY (id),
  CONSTRAINT uq_user_devices_user_device UNIQUE (user_id, device_identifier),
  CONSTRAINT fk_user_devices_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

COMMENT ON COLUMN user_devices.device_identifier IS 'Stable install ID generated by the app';
COMMENT ON COLUMN user_devices.push_token        IS 'Expo / FCM / APNs token';
COMMENT ON COLUMN user_devices.biometric_enabled IS 'Fingerprint / Face ID toggle (screen 24)';


-- A5. auth_sessions ----------------------------------------------------------
CREATE TABLE auth_sessions (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id             BIGINT       NOT NULL,
  user_device_id      BIGINT       NULL,
  refresh_token_hash  VARCHAR(255) NOT NULL,
  login_method        login_method NOT NULL,
  ip_address          VARCHAR(45)  NULL,
  expires_at          TIMESTAMPTZ  NOT NULL,
  revoked_at          TIMESTAMPTZ  NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_auth_sessions PRIMARY KEY (id),
  CONSTRAINT uq_auth_sessions_refresh_token UNIQUE (refresh_token_hash),
  CONSTRAINT fk_auth_sessions_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_auth_sessions_user_device_id
    FOREIGN KEY (user_device_id) REFERENCES user_devices (id) ON DELETE SET NULL
);
CREATE INDEX idx_auth_sessions_user ON auth_sessions (user_id);
CREATE INDEX idx_auth_sessions_device ON auth_sessions (user_device_id);

COMMENT ON COLUMN auth_sessions.revoked_at IS 'Set on log out';


-- A6. user_settings ----------------------------------------------------------
CREATE TABLE user_settings (
  user_id                       BIGINT      NOT NULL,
  notify_appointment_reminders  BOOLEAN     NOT NULL DEFAULT TRUE,
  appointment_reminder_minutes  SMALLINT    NOT NULL DEFAULT 120,
  notify_medicine_reminders     BOOLEAN     NOT NULL DEFAULT TRUE,
  notify_lab_reports            BOOLEAN     NOT NULL DEFAULT TRUE,
  notify_health_tips            BOOLEAN     NOT NULL DEFAULT FALSE,
  language_code                 VARCHAR(10) NOT NULL DEFAULT 'en',
  weight_unit                   weight_unit NOT NULL DEFAULT 'kg',
  height_unit                   height_unit NOT NULL DEFAULT 'cm',
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_user_settings PRIMARY KEY (user_id),
  CONSTRAINT chk_user_settings_reminder CHECK (appointment_reminder_minutes >= 0),
  CONSTRAINT fk_user_settings_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

COMMENT ON COLUMN user_settings.appointment_reminder_minutes IS '120 = 2 hours before';
COMMENT ON COLUMN user_settings.language_code                IS 'en, hi, gu ...';


-- =============================================================================
-- B. PATIENTS
-- =============================================================================

-- B1. patients ---------------------------------------------------------------
CREATE TABLE patients (
  id              BIGINT GENERATED ALWAYS AS IDENTITY,
  uhid            VARCHAR(20)  NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NULL,
  date_of_birth   DATE         NOT NULL,
  gender          gender       NOT NULL,
  blood_group     blood_group  NULL,
  height_cm       NUMERIC(5,1) NULL,
  weight_kg       NUMERIC(5,1) NULL,
  mobile          VARCHAR(15)  NULL,
  email           VARCHAR(255) NULL,
  avatar_file_id  BIGINT       NULL,
  registered_at   TIMESTAMPTZ  NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ  NULL,
  CONSTRAINT pk_patients PRIMARY KEY (id),
  CONSTRAINT uq_patients_uhid UNIQUE (uhid),
  CONSTRAINT fk_patients_avatar_file_id
    FOREIGN KEY (avatar_file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);
CREATE INDEX idx_patients_mobile ON patients (mobile);

COMMENT ON COLUMN patients.uhid          IS 'Unique Health ID, e.g. CW-2024-08812';
COMMENT ON COLUMN patients.weight_kg     IS 'Latest value; history lives in vitals';
COMMENT ON COLUMN patients.mobile        IS 'NULL for children without a phone';
COMMENT ON COLUMN patients.registered_at IS 'When the UHID was issued';


-- B2. user_patient_links -----------------------------------------------------
CREATE TABLE user_patient_links (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id     BIGINT          NOT NULL,
  patient_id  BIGINT          NOT NULL,
  relation    family_relation NOT NULL,
  is_primary  BOOLEAN         NOT NULL DEFAULT FALSE,
  linked_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT pk_user_patient_links PRIMARY KEY (id),
  CONSTRAINT uq_user_patient UNIQUE (user_id, patient_id),
  CONSTRAINT fk_user_patient_links_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_patient_links_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);
CREATE INDEX idx_user_patient_links_patient ON user_patient_links (patient_id);
-- Each account can have only one "self" record (enforced by the database)
CREATE UNIQUE INDEX uq_user_patient_links_one_self ON user_patient_links (user_id) WHERE relation = 'self';

COMMENT ON COLUMN user_patient_links.is_primary IS 'TRUE = the account holder''s own record';


-- B3. patient_allergies ------------------------------------------------------
CREATE TABLE patient_allergies (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  patient_id  BIGINT           NOT NULL,
  allergen    VARCHAR(150)     NOT NULL,
  severity    allergy_severity NULL,
  notes       VARCHAR(255)     NULL,
  created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT pk_patient_allergies PRIMARY KEY (id),
  CONSTRAINT uq_patient_allergen UNIQUE (patient_id, allergen),
  CONSTRAINT fk_patient_allergies_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);

COMMENT ON COLUMN patient_allergies.allergen IS 'e.g. Penicillin, Peanuts';


-- B4. patient_conditions -----------------------------------------------------
CREATE TABLE patient_conditions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY,
  patient_id      BIGINT           NOT NULL,
  condition_name  VARCHAR(150)     NOT NULL,
  diagnosed_on    DATE             NULL,
  status          condition_status NOT NULL DEFAULT 'active',
  notes           VARCHAR(255)     NULL,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT pk_patient_conditions PRIMARY KEY (id),
  CONSTRAINT fk_patient_conditions_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);
CREATE INDEX idx_patient_conditions_patient ON patient_conditions (patient_id);

COMMENT ON COLUMN patient_conditions.condition_name IS 'e.g. Mild hypertension';


-- B5. patient_emergency_contacts ---------------------------------------------
CREATE TABLE patient_emergency_contacts (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  patient_id  BIGINT       NOT NULL,
  name        VARCHAR(150) NOT NULL,
  relation    VARCHAR(50)  NOT NULL,
  mobile      VARCHAR(15)  NOT NULL,
  is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_patient_emergency_contacts PRIMARY KEY (id),
  CONSTRAINT fk_patient_emergency_contacts_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);
CREATE INDEX idx_emergency_contacts_patient ON patient_emergency_contacts (patient_id);

COMMENT ON COLUMN patient_emergency_contacts.relation IS 'Free text: Spouse, Father, Neighbour ...';


-- B6. addresses --------------------------------------------------------------
CREATE TABLE addresses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id     BIGINT        NOT NULL,
  label       VARCHAR(50)   NULL,
  line1       VARCHAR(255)  NOT NULL,
  line2       VARCHAR(255)  NULL,
  landmark    VARCHAR(150)  NULL,
  city        VARCHAR(100)  NOT NULL,
  state       VARCHAR(100)  NOT NULL,
  pincode     CHAR(6)       NOT NULL,
  latitude    NUMERIC(10,7) NULL,
  longitude   NUMERIC(10,7) NULL,
  is_default  BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ   NULL,
  CONSTRAINT pk_addresses PRIMARY KEY (id),
  CONSTRAINT fk_addresses_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_addresses_user ON addresses (user_id);

COMMENT ON COLUMN addresses.label IS 'Home, Office ...';


-- =============================================================================
-- C. HOSPITAL SETUP
-- =============================================================================

-- C1. departments ------------------------------------------------------------
CREATE TABLE departments (
  id           BIGINT GENERATED ALWAYS AS IDENTITY,
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(100) NOT NULL,
  description  VARCHAR(500) NULL,
  icon_key     VARCHAR(50)  NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order   SMALLINT     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_departments PRIMARY KEY (id),
  CONSTRAINT uq_departments_name UNIQUE (name),
  CONSTRAINT uq_departments_slug UNIQUE (slug)
);

COMMENT ON COLUMN departments.name     IS 'Cardiology, Orthopedics ...';
COMMENT ON COLUMN departments.icon_key IS 'Icon name the app maps to an SVG';


-- C2. rooms ------------------------------------------------------------------
CREATE TABLE rooms (
  id               BIGINT GENERATED ALWAYS AS IDENTITY,
  department_id    BIGINT       NULL,
  room_no          VARCHAR(20)  NOT NULL,
  block            VARCHAR(20)  NOT NULL,
  floor_label      VARCHAR(30)  NOT NULL,
  directions_note  VARCHAR(255) NULL,
  room_type        room_type    NOT NULL DEFAULT 'opd',
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_rooms PRIMARY KEY (id),
  CONSTRAINT uq_rooms_block_room UNIQUE (block, room_no),
  CONSTRAINT fk_rooms_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
);
CREATE INDEX idx_rooms_department ON rooms (department_id);

COMMENT ON COLUMN rooms.room_no         IS '204';
COMMENT ON COLUMN rooms.block           IS 'B';
COMMENT ON COLUMN rooms.floor_label     IS '2nd floor';
COMMENT ON COLUMN rooms.directions_note IS 'Lift near gate 3';


-- C3. wards ------------------------------------------------------------------
CREATE TABLE wards (
  id             BIGINT GENERATED ALWAYS AS IDENTITY,
  name           VARCHAR(100) NOT NULL,
  ward_type      ward_type    NOT NULL,
  department_id  BIGINT       NULL,
  block          VARCHAR(20)  NOT NULL,
  floor_label    VARCHAR(30)  NOT NULL,
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_wards PRIMARY KEY (id),
  CONSTRAINT uq_wards_name UNIQUE (name),
  CONSTRAINT fk_wards_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
);

COMMENT ON COLUMN wards.name IS 'Ward 3B, Emergency';


-- C4. beds -------------------------------------------------------------------
CREATE TABLE beds (
  id            BIGINT GENERATED ALWAYS AS IDENTITY,
  ward_id       BIGINT        NOT NULL,
  bed_no        VARCHAR(20)   NOT NULL,
  status        bed_status    NOT NULL DEFAULT 'available',
  daily_charge  NUMERIC(10,2) NULL,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_beds PRIMARY KEY (id),
  CONSTRAINT uq_beds_ward_bed UNIQUE (ward_id, bed_no),
  CONSTRAINT fk_beds_ward_id
    FOREIGN KEY (ward_id) REFERENCES wards (id) ON DELETE RESTRICT
);
CREATE INDEX idx_beds_status ON beds (ward_id, status);


-- C5. doctors ----------------------------------------------------------------
CREATE TABLE doctors (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id                 BIGINT        NULL,
  employee_code           VARCHAR(20)   NOT NULL,
  title                   VARCHAR(10)   NOT NULL DEFAULT 'Dr.',
  first_name              VARCHAR(100)  NOT NULL,
  last_name               VARCHAR(100)  NOT NULL,
  gender                  gender        NULL,
  qualifications          VARCHAR(255)  NOT NULL,
  specialization          VARCHAR(100)  NOT NULL,
  department_id           BIGINT        NOT NULL,
  default_room_id         BIGINT        NULL,
  experience_years        SMALLINT      NOT NULL DEFAULT 0,
  about                   TEXT          NULL,
  consultation_fee        NUMERIC(10,2) NOT NULL,
  video_consultation_fee  NUMERIC(10,2) NULL,
  accepts_insurance       BOOLEAN       NOT NULL DEFAULT TRUE,
  patients_treated_count  INTEGER       NOT NULL DEFAULT 0,
  rating_avg              NUMERIC(2,1)  NOT NULL DEFAULT 0.0,
  rating_count            INTEGER       NOT NULL DEFAULT 0,
  avatar_file_id          BIGINT        NULL,
  is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ   NULL,
  CONSTRAINT pk_doctors PRIMARY KEY (id),
  CONSTRAINT uq_doctors_employee_code UNIQUE (employee_code),
  CONSTRAINT uq_doctors_user UNIQUE (user_id),
  CONSTRAINT chk_doctors_experience CHECK (experience_years >= 0),
  CONSTRAINT chk_doctors_fees CHECK (consultation_fee >= 0 AND (video_consultation_fee IS NULL OR video_consultation_fee >= 0)),
  CONSTRAINT chk_doctors_rating CHECK (rating_avg BETWEEN 0 AND 5 AND rating_count >= 0),
  CONSTRAINT fk_doctors_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_doctors_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
  CONSTRAINT fk_doctors_default_room_id
    FOREIGN KEY (default_room_id) REFERENCES rooms (id) ON DELETE SET NULL,
  CONSTRAINT fk_doctors_avatar_file_id
    FOREIGN KEY (avatar_file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);
CREATE INDEX idx_doctors_department_active ON doctors (department_id, is_active);
-- Search by name or specialization (replaces the MySQL FULLTEXT index)
CREATE INDEX idx_doctors_search ON doctors
  USING GIN (to_tsvector('simple', first_name || ' ' || last_name || ' ' || specialization));

COMMENT ON COLUMN doctors.user_id                IS 'Phase 3: doctor app login. NULL for now';
COMMENT ON COLUMN doctors.qualifications         IS 'MBBS, MD, DM (Cardiology)';
COMMENT ON COLUMN doctors.specialization         IS 'Cardiologist';
COMMENT ON COLUMN doctors.video_consultation_fee IS 'NULL = video visits not offered';
COMMENT ON COLUMN doctors.patients_treated_count IS 'Display counter "3,200+"';
COMMENT ON COLUMN doctors.rating_avg             IS 'Cached from doctor_reviews';


-- C6. doctor_schedules -------------------------------------------------------
CREATE TABLE doctor_schedules (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY,
  doctor_id              BIGINT              NOT NULL,
  day_of_week            SMALLINT            NOT NULL,
  start_time             TIME                NOT NULL,
  end_time               TIME                NOT NULL,
  slot_duration_minutes  SMALLINT            NOT NULL DEFAULT 15,
  visit_type             schedule_visit_type NOT NULL DEFAULT 'both',
  room_id                BIGINT              NULL,
  effective_from         DATE                NULL,
  effective_to           DATE                NULL,
  is_active              BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ         NOT NULL DEFAULT now(),
  CONSTRAINT pk_doctor_schedules PRIMARY KEY (id),
  CONSTRAINT chk_doctor_schedules_day CHECK (day_of_week BETWEEN 1 AND 7),
  CONSTRAINT chk_doctor_schedules_time CHECK (end_time > start_time),
  CONSTRAINT chk_doctor_schedules_slot CHECK (slot_duration_minutes > 0),
  CONSTRAINT fk_doctor_schedules_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
  CONSTRAINT fk_doctor_schedules_room_id
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL
);
CREATE INDEX idx_doctor_schedules_doctor_day ON doctor_schedules (doctor_id, day_of_week);

COMMENT ON COLUMN doctor_schedules.day_of_week IS '1=Mon ... 7=Sun (ISO)';


-- C7. doctor_leaves ----------------------------------------------------------
CREATE TABLE doctor_leaves (
  id          BIGINT GENERATED ALWAYS AS IDENTITY,
  doctor_id   BIGINT       NOT NULL,
  leave_date  DATE         NOT NULL,
  start_time  TIME         NULL,
  end_time    TIME         NULL,
  reason      VARCHAR(255) NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_doctor_leaves PRIMARY KEY (id),
  CONSTRAINT fk_doctor_leaves_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
);
CREATE INDEX idx_doctor_leaves_doctor_date ON doctor_leaves (doctor_id, leave_date);

COMMENT ON COLUMN doctor_leaves.start_time IS 'NULL start/end = full day off';


-- C8. favorite_doctors -------------------------------------------------------
CREATE TABLE favorite_doctors (
  user_id     BIGINT      NOT NULL,
  doctor_id   BIGINT      NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_favorite_doctors PRIMARY KEY (user_id, doctor_id),
  CONSTRAINT fk_favorite_doctors_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_doctors_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
);
CREATE INDEX idx_favorite_doctors_doctor ON favorite_doctors (doctor_id);


-- C9. visit_instructions -----------------------------------------------------
CREATE TABLE visit_instructions (
  id             BIGINT GENERATED ALWAYS AS IDENTITY,
  department_id  BIGINT       NULL,
  doctor_id      BIGINT       NULL,
  instruction    VARCHAR(255) NOT NULL,
  sort_order     SMALLINT     NOT NULL DEFAULT 0,
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_visit_instructions PRIMARY KEY (id),
  -- PostgreSQL allows this check (MySQL did not), so the rule is now enforced by the database
  CONSTRAINT chk_visit_instructions_owner CHECK (department_id IS NOT NULL OR doctor_id IS NOT NULL),
  CONSTRAINT fk_visit_instructions_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE,
  CONSTRAINT fk_visit_instructions_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
);
CREATE INDEX idx_visit_instructions_department ON visit_instructions (department_id);
CREATE INDEX idx_visit_instructions_doctor ON visit_instructions (doctor_id);

COMMENT ON COLUMN visit_instructions.doctor_id IS 'Doctor-specific overrides department-level';


-- =============================================================================
-- D. ADMISSIONS & BILLING
-- =============================================================================

-- D1. admissions -------------------------------------------------------------
CREATE TABLE admissions (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  admission_no         VARCHAR(30)      NOT NULL,
  patient_id           BIGINT           NOT NULL,
  attending_doctor_id  BIGINT           NOT NULL,
  bed_id               BIGINT           NULL,
  admission_type       admission_type   NOT NULL,
  status               admission_status NOT NULL DEFAULT 'admitted',
  admitted_at          TIMESTAMPTZ      NOT NULL,
  discharged_at        TIMESTAMPTZ      NULL,
  primary_diagnosis    VARCHAR(255)     NULL,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT pk_admissions PRIMARY KEY (id),
  CONSTRAINT uq_admissions_no UNIQUE (admission_no),
  CONSTRAINT fk_admissions_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_admissions_attending_doctor_id
    FOREIGN KEY (attending_doctor_id) REFERENCES doctors (id) ON DELETE RESTRICT,
  CONSTRAINT fk_admissions_bed_id
    FOREIGN KEY (bed_id) REFERENCES beds (id) ON DELETE SET NULL
);
CREATE INDEX idx_admissions_patient ON admissions (patient_id);
CREATE INDEX idx_admissions_doctor ON admissions (attending_doctor_id);
CREATE INDEX idx_admissions_bed ON admissions (bed_id);

COMMENT ON COLUMN admissions.bed_id IS 'Current bed; NULL after discharge';


-- D2. invoices ---------------------------------------------------------------
CREATE TABLE invoices (
  id                        BIGINT GENERATED ALWAYS AS IDENTITY,
  invoice_no                VARCHAR(30)    NOT NULL,
  patient_id                BIGINT         NOT NULL,
  admission_id              BIGINT         NULL,
  issued_at                 TIMESTAMPTZ    NOT NULL,
  due_date                  DATE           NULL,
  subtotal                  NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  discount_amount           NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  insurance_covered_amount  NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  tax_amount                NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  total_amount              NUMERIC(12,2)  NOT NULL,
  amount_paid               NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  balance_due               NUMERIC(12,2)  GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status                    invoice_status NOT NULL DEFAULT 'unpaid',
  notes                     VARCHAR(500)   NULL,
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT pk_invoices PRIMARY KEY (id),
  CONSTRAINT uq_invoices_no UNIQUE (invoice_no),
  CONSTRAINT chk_invoices_amounts CHECK (
    subtotal >= 0 AND discount_amount >= 0 AND insurance_covered_amount >= 0
    AND tax_amount >= 0 AND total_amount >= 0 AND amount_paid >= 0),
  CONSTRAINT fk_invoices_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_admission_id
    FOREIGN KEY (admission_id) REFERENCES admissions (id) ON DELETE SET NULL
);
CREATE INDEX idx_invoices_patient_status ON invoices (patient_id, status);
CREATE INDEX idx_invoices_admission ON invoices (admission_id);

COMMENT ON COLUMN invoices.invoice_no   IS 'INV-2026-0931';
COMMENT ON COLUMN invoices.total_amount IS 'Patient payable = subtotal - discount - insurance + tax';
COMMENT ON COLUMN invoices.balance_due  IS 'Calculated by the database. Never write to this column.';


-- D3. invoice_items ----------------------------------------------------------
CREATE TABLE invoice_items (
  id              BIGINT GENERATED ALWAYS AS IDENTITY,
  invoice_id      BIGINT            NOT NULL,
  item_type       invoice_item_type NOT NULL,
  description     VARCHAR(255)      NOT NULL,
  reference_type  VARCHAR(50)       NULL,
  reference_id    BIGINT            NULL,
  quantity        NUMERIC(10,2)     NOT NULL DEFAULT 1.00,
  unit_price      NUMERIC(12,2)     NOT NULL,
  amount          NUMERIC(12,2)     NOT NULL,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT pk_invoice_items PRIMARY KEY (id),
  CONSTRAINT chk_invoice_items_values CHECK (quantity > 0 AND unit_price >= 0 AND amount >= 0),
  CONSTRAINT fk_invoice_items_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);
CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_reference ON invoice_items (reference_type, reference_id);

COMMENT ON COLUMN invoice_items.description    IS 'Consultation – Cardiology';
COMMENT ON COLUMN invoice_items.reference_type IS 'Polymorphic source: appointment, lab_report, pharmacy_order ...';


-- D4. payments ---------------------------------------------------------------
CREATE TABLE payments (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY,
  payment_no          VARCHAR(30)    NOT NULL,
  invoice_id          BIGINT         NOT NULL,
  patient_id          BIGINT         NOT NULL,
  paid_by_user_id     BIGINT         NULL,
  amount              NUMERIC(12,2)  NOT NULL,
  method              payment_method NOT NULL,
  status              payment_status NOT NULL DEFAULT 'initiated',
  gateway             VARCHAR(50)    NULL,
  gateway_order_id    VARCHAR(100)   NULL,
  gateway_payment_id  VARCHAR(100)   NULL,
  gateway_response    JSONB          NULL,
  failure_reason      VARCHAR(255)   NULL,
  paid_at             TIMESTAMPTZ    NULL,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT pk_payments PRIMARY KEY (id),
  CONSTRAINT uq_payments_no UNIQUE (payment_no),
  CONSTRAINT uq_payments_gateway_payment UNIQUE (gateway_payment_id),
  CONSTRAINT chk_payments_amount CHECK (amount > 0),
  CONSTRAINT fk_payments_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_paid_by_user_id
    FOREIGN KEY (paid_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_patient_paid ON payments (patient_id, paid_at);

COMMENT ON COLUMN payments.paid_by_user_id IS 'NULL = paid at counter by staff';
COMMENT ON COLUMN payments.gateway         IS 'razorpay, payu ...';


-- =============================================================================
-- E. APPOINTMENTS, QUEUE, VIDEO, VITALS
-- =============================================================================

-- E1. appointments -----------------------------------------------------------
CREATE TABLE appointments (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  appointment_no       VARCHAR(20)        NOT NULL,
  patient_id           BIGINT             NOT NULL,
  booked_by_user_id    BIGINT             NULL,
  doctor_id            BIGINT             NOT NULL,
  department_id        BIGINT             NOT NULL,
  room_id              BIGINT             NULL,
  doctor_schedule_id   BIGINT             NULL,
  appointment_date     DATE               NOT NULL,
  start_time           TIME               NOT NULL,
  end_time             TIME               NOT NULL,
  visit_type           visit_type         NOT NULL,
  status               appointment_status NOT NULL DEFAULT 'pending',
  reason_for_visit     VARCHAR(500)       NULL,
  consultation_fee     NUMERIC(10,2)      NOT NULL,
  invoice_id           BIGINT             NULL,
  checkin_qr_token     VARCHAR(64)        NOT NULL,
  checked_in_at        TIMESTAMPTZ        NULL,
  completed_at         TIMESTAMPTZ        NULL,
  cancelled_at         TIMESTAMPTZ        NULL,
  cancelled_by         cancelled_by       NULL,
  cancellation_reason  VARCHAR(255)       NULL,
  rescheduled_from_id  BIGINT             NULL,
  reminder_sent_at     TIMESTAMPTZ        NULL,
  created_at           TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ        NOT NULL DEFAULT now(),
  CONSTRAINT pk_appointments PRIMARY KEY (id),
  CONSTRAINT uq_appointments_no UNIQUE (appointment_no),
  CONSTRAINT uq_appointments_qr_token UNIQUE (checkin_qr_token),
  CONSTRAINT chk_appointments_time CHECK (end_time > start_time),
  CONSTRAINT chk_appointments_fee CHECK (consultation_fee >= 0),
  CONSTRAINT fk_appointments_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_booked_by_user_id
    FOREIGN KEY (booked_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_room_id
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_doctor_schedule_id
    FOREIGN KEY (doctor_schedule_id) REFERENCES doctor_schedules (id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_rescheduled_from_id
    FOREIGN KEY (rescheduled_from_id) REFERENCES appointments (id) ON DELETE SET NULL
);
-- Blocks double-booking a doctor's slot, but frees it once cancelled/rescheduled/no-show.
-- (Replaces the MySQL slot_lock generated column.)
CREATE UNIQUE INDEX uq_appointments_doctor_slot
  ON appointments (doctor_id, appointment_date, start_time)
  WHERE status NOT IN ('cancelled', 'rescheduled', 'no_show');
CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
CREATE INDEX idx_appointments_status_date ON appointments (status, appointment_date);
CREATE INDEX idx_appointments_invoice ON appointments (invoice_id);

COMMENT ON COLUMN appointments.appointment_no      IS 'APT-77412';
COMMENT ON COLUMN appointments.booked_by_user_id   IS 'Who booked (may be a family member). NULL = help desk';
COMMENT ON COLUMN appointments.department_id       IS 'Copied from doctor at booking time';
COMMENT ON COLUMN appointments.consultation_fee    IS 'Fee snapshot at booking';
COMMENT ON COLUMN appointments.checkin_qr_token    IS 'Random token encoded in the check-in QR';
COMMENT ON COLUMN appointments.rescheduled_from_id IS 'Previous appointment this one replaces';


-- E2. opd_queue_counters -----------------------------------------------------
CREATE TABLE opd_queue_counters (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  doctor_id            BIGINT      NOT NULL,
  queue_date           DATE        NOT NULL,
  token_prefix         VARCHAR(3)  NOT NULL,
  last_issued_number   INTEGER     NOT NULL DEFAULT 0,
  now_serving_number   INTEGER     NOT NULL DEFAULT 0,
  avg_consult_minutes  SMALLINT    NOT NULL DEFAULT 5,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_opd_queue_counters PRIMARY KEY (id),
  CONSTRAINT uq_opd_queue_counters_doctor_date UNIQUE (doctor_id, queue_date),
  CONSTRAINT chk_opd_queue_counters_numbers CHECK (last_issued_number >= 0 AND now_serving_number >= 0),
  CONSTRAINT fk_opd_queue_counters_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
);

COMMENT ON COLUMN opd_queue_counters.token_prefix        IS 'A, B ...';
COMMENT ON COLUMN opd_queue_counters.avg_consult_minutes IS 'For "About 25 min wait"';


-- E3. opd_queue_tokens -------------------------------------------------------
CREATE TABLE opd_queue_tokens (
  id                BIGINT GENERATED ALWAYS AS IDENTITY,
  appointment_id    BIGINT             NOT NULL,
  queue_counter_id  BIGINT             NOT NULL,
  token_number      INTEGER            NOT NULL,
  token_label       VARCHAR(10)        NOT NULL,
  status            queue_token_status NOT NULL DEFAULT 'waiting',
  issued_at         TIMESTAMPTZ        NOT NULL,
  called_at         TIMESTAMPTZ        NULL,
  completed_at      TIMESTAMPTZ        NULL,
  CONSTRAINT pk_opd_queue_tokens PRIMARY KEY (id),
  CONSTRAINT uq_opd_queue_tokens_appointment UNIQUE (appointment_id),
  CONSTRAINT uq_opd_queue_tokens_counter_number UNIQUE (queue_counter_id, token_number),
  CONSTRAINT fk_opd_queue_tokens_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
  CONSTRAINT fk_opd_queue_tokens_queue_counter_id
    FOREIGN KEY (queue_counter_id) REFERENCES opd_queue_counters (id) ON DELETE CASCADE
);

COMMENT ON COLUMN opd_queue_tokens.token_label IS 'A-24';
COMMENT ON COLUMN opd_queue_tokens.issued_at   IS 'Issued at kiosk check-in';


-- E4. video_consultations ----------------------------------------------------
CREATE TABLE video_consultations (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY,
  appointment_id     BIGINT            NOT NULL,
  provider           VARCHAR(50)       NOT NULL,
  room_name          VARCHAR(255)      NOT NULL,
  status             video_call_status NOT NULL DEFAULT 'scheduled',
  patient_joined_at  TIMESTAMPTZ       NULL,
  doctor_joined_at   TIMESTAMPTZ       NULL,
  started_at         TIMESTAMPTZ       NULL,
  ended_at           TIMESTAMPTZ       NULL,
  duration_seconds   INTEGER           NULL,
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT pk_video_consultations PRIMARY KEY (id),
  CONSTRAINT uq_video_consultations_appointment UNIQUE (appointment_id),
  CONSTRAINT uq_video_consultations_room UNIQUE (room_name),
  CONSTRAINT chk_video_consultations_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  CONSTRAINT fk_video_consultations_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
);

COMMENT ON COLUMN video_consultations.provider IS 'agora, twilio, 100ms, jitsi ...';


-- E5. consultation_messages --------------------------------------------------
CREATE TABLE consultation_messages (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY,
  video_consultation_id  BIGINT         NOT NULL,
  sender_type            message_sender NOT NULL,
  sender_user_id         BIGINT         NULL,
  message                TEXT           NULL,
  attachment_file_id     BIGINT         NULL,
  sent_at                TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT pk_consultation_messages PRIMARY KEY (id),
  CONSTRAINT chk_consultation_messages_content CHECK (message IS NOT NULL OR attachment_file_id IS NOT NULL),
  CONSTRAINT fk_consultation_messages_video_consultation_id
    FOREIGN KEY (video_consultation_id) REFERENCES video_consultations (id) ON DELETE CASCADE,
  CONSTRAINT fk_consultation_messages_sender_user_id
    FOREIGN KEY (sender_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_consultation_messages_attachment_file_id
    FOREIGN KEY (attachment_file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);
CREATE INDEX idx_consultation_messages_call ON consultation_messages (video_consultation_id, sent_at);

COMMENT ON COLUMN consultation_messages.message IS 'NULL when only an attachment is sent';


-- E6. doctor_reviews ---------------------------------------------------------
CREATE TABLE doctor_reviews (
  id              BIGINT GENERATED ALWAYS AS IDENTITY,
  doctor_id       BIGINT        NOT NULL,
  patient_id      BIGINT        NOT NULL,
  appointment_id  BIGINT        NOT NULL,
  rating          SMALLINT      NOT NULL,
  comment         VARCHAR(1000) NULL,
  is_published    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_doctor_reviews PRIMARY KEY (id),
  CONSTRAINT uq_doctor_reviews_appointment UNIQUE (appointment_id),
  CONSTRAINT chk_doctor_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_doctor_reviews_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
  CONSTRAINT fk_doctor_reviews_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT fk_doctor_reviews_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
);
CREATE INDEX idx_doctor_reviews_doctor ON doctor_reviews (doctor_id, is_published);
CREATE INDEX idx_doctor_reviews_patient ON doctor_reviews (patient_id);

COMMENT ON COLUMN doctor_reviews.appointment_id IS 'Only completed visits can be reviewed';


-- E7. vitals -----------------------------------------------------------------
CREATE TABLE vitals (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  patient_id           BIGINT        NOT NULL,
  vital_type           vital_type    NOT NULL,
  value_primary        NUMERIC(7,2)  NOT NULL,
  value_secondary      NUMERIC(7,2)  NULL,
  unit                 VARCHAR(20)   NOT NULL,
  sugar_context        sugar_context NULL,
  status               vital_status  NOT NULL DEFAULT 'normal',
  source               vital_source  NOT NULL,
  appointment_id       BIGINT        NULL,
  recorded_by_user_id  BIGINT        NULL,
  recorded_at          TIMESTAMPTZ   NOT NULL,
  notes                VARCHAR(255)  NULL,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_vitals PRIMARY KEY (id),
  CONSTRAINT fk_vitals_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT fk_vitals_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL,
  CONSTRAINT fk_vitals_recorded_by_user_id
    FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_vitals_patient_type_time ON vitals (patient_id, vital_type, recorded_at);

COMMENT ON COLUMN vitals.value_primary       IS 'BP systolic, or the single value';
COMMENT ON COLUMN vitals.value_secondary     IS 'BP diastolic only';
COMMENT ON COLUMN vitals.unit                IS 'mmHg, bpm, mg/dL, kg, %, °C';
COMMENT ON COLUMN vitals.sugar_context       IS 'Only for blood_sugar';
COMMENT ON COLUMN vitals.appointment_id      IS 'Set when measured at an OPD visit';
COMMENT ON COLUMN vitals.recorded_by_user_id IS 'Set for home entries';


-- =============================================================================
-- F. MEDICAL RECORDS & LAB
-- =============================================================================

-- F1. medical_records --------------------------------------------------------
CREATE TABLE medical_records (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY,
  patient_id             BIGINT         NOT NULL,
  record_type            record_type    NOT NULL,
  title                  VARCHAR(200)   NOT NULL,
  department_id          BIGINT         NULL,
  doctor_id              BIGINT         NULL,
  appointment_id         BIGINT         NULL,
  admission_id           BIGINT         NULL,
  record_date            DATE           NOT NULL,
  result_summary         result_summary NOT NULL DEFAULT 'not_applicable',
  flag_count             SMALLINT       NOT NULL DEFAULT 0,
  file_id                BIGINT         NULL,
  is_visible_to_patient  BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at             TIMESTAMPTZ    NULL,
  CONSTRAINT pk_medical_records PRIMARY KEY (id),
  CONSTRAINT chk_medical_records_flags CHECK (flag_count >= 0),
  CONSTRAINT fk_medical_records_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_medical_records_department_id
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_admission_id
    FOREIGN KEY (admission_id) REFERENCES admissions (id) ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_file_id
    FOREIGN KEY (file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);
CREATE INDEX idx_medical_records_patient_date ON medical_records (patient_id, record_date);
CREATE INDEX idx_medical_records_patient_type ON medical_records (patient_id, record_type);
CREATE INDEX idx_medical_records_appointment ON medical_records (appointment_id);
CREATE INDEX idx_medical_records_admission ON medical_records (admission_id);

COMMENT ON COLUMN medical_records.title                 IS 'Complete blood count, Chest X-ray';
COMMENT ON COLUMN medical_records.flag_count            IS '"1 flag" badge';
COMMENT ON COLUMN medical_records.file_id               IS 'PDF / image';
COMMENT ON COLUMN medical_records.is_visible_to_patient IS 'Hide until doctor releases';


-- F2. lab_tests --------------------------------------------------------------
CREATE TABLE lab_tests (
  id         BIGINT GENERATED ALWAYS AS IDENTITY,
  code       VARCHAR(30)   NOT NULL,
  name       VARCHAR(150)  NOT NULL,
  unit       VARCHAR(30)   NULL,
  ref_low    NUMERIC(12,3) NULL,
  ref_high   NUMERIC(12,3) NULL,
  ref_text   VARCHAR(100)  NULL,
  price      NUMERIC(10,2) NULL,
  is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_lab_tests PRIMARY KEY (id),
  CONSTRAINT uq_lab_tests_code UNIQUE (code)
);

COMMENT ON COLUMN lab_tests.code     IS 'HGB, WBC, PLT ...';
COMMENT ON COLUMN lab_tests.ref_text IS 'For non-numeric results, e.g. "Negative"';


-- F3. lab_reports ------------------------------------------------------------
CREATE TABLE lab_reports (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY,
  report_no             VARCHAR(30)       NOT NULL,
  medical_record_id     BIGINT            NOT NULL,
  patient_id            BIGINT            NOT NULL,
  ordered_by_doctor_id  BIGINT            NULL,
  appointment_id        BIGINT            NULL,
  sample_type           VARCHAR(50)       NULL,
  sample_collected_at   TIMESTAMPTZ       NULL,
  reported_at           TIMESTAMPTZ       NULL,
  status                lab_report_status NOT NULL DEFAULT 'ordered',
  doctor_remarks        TEXT              NULL,
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT pk_lab_reports PRIMARY KEY (id),
  CONSTRAINT uq_lab_reports_no UNIQUE (report_no),
  CONSTRAINT uq_lab_reports_medical_record UNIQUE (medical_record_id),
  CONSTRAINT fk_lab_reports_medical_record_id
    FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE CASCADE,
  CONSTRAINT fk_lab_reports_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_lab_reports_ordered_by_doctor_id
    FOREIGN KEY (ordered_by_doctor_id) REFERENCES doctors (id) ON DELETE SET NULL,
  CONSTRAINT fk_lab_reports_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
);
CREATE INDEX idx_lab_reports_patient ON lab_reports (patient_id);

COMMENT ON COLUMN lab_reports.report_no      IS 'LAB-58213';
COMMENT ON COLUMN lab_reports.patient_id     IS 'Denormalised for fast lookups';
COMMENT ON COLUMN lab_reports.doctor_remarks IS 'Shown in the alert box on screen 7';


-- F4. lab_report_results -----------------------------------------------------
CREATE TABLE lab_report_results (
  id             BIGINT GENERATED ALWAYS AS IDENTITY,
  lab_report_id  BIGINT          NOT NULL,
  lab_test_id    BIGINT          NULL,
  test_name      VARCHAR(150)    NOT NULL,
  value_numeric  NUMERIC(12,3)   NULL,
  value_text     VARCHAR(100)    NULL,
  unit           VARCHAR(30)     NULL,
  ref_low        NUMERIC(12,3)   NULL,
  ref_high       NUMERIC(12,3)   NULL,
  ref_text       VARCHAR(100)    NULL,
  flag           lab_result_flag NOT NULL DEFAULT 'normal',
  sort_order     SMALLINT        NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT pk_lab_report_results PRIMARY KEY (id),
  CONSTRAINT fk_lab_report_results_lab_report_id
    FOREIGN KEY (lab_report_id) REFERENCES lab_reports (id) ON DELETE CASCADE,
  CONSTRAINT fk_lab_report_results_lab_test_id
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests (id) ON DELETE SET NULL
);
CREATE INDEX idx_lab_report_results_report ON lab_report_results (lab_report_id, sort_order);

COMMENT ON COLUMN lab_report_results.value_text IS 'Used when the result is not numeric';
COMMENT ON COLUMN lab_report_results.ref_low    IS 'Range copied at report time, so old reports never change';


-- =============================================================================
-- G. MEDICINES & PRESCRIPTIONS
-- =============================================================================

-- G1. medicines --------------------------------------------------------------
CREATE TABLE medicines (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY,
  name                   VARCHAR(150)  NOT NULL,
  generic_name           VARCHAR(150)  NULL,
  strength               VARCHAR(50)   NULL,
  form                   medicine_form NOT NULL,
  pack_type              VARCHAR(30)   NOT NULL DEFAULT 'strip',
  units_per_pack         SMALLINT      NOT NULL,
  price_per_pack         NUMERIC(10,2) NOT NULL,
  requires_prescription  BOOLEAN       NOT NULL DEFAULT TRUE,
  stock_packs            INTEGER       NOT NULL DEFAULT 0,
  is_active              BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_medicines PRIMARY KEY (id),
  CONSTRAINT uq_medicines_name_strength_form UNIQUE (name, strength, form),
  CONSTRAINT chk_medicines_values CHECK (units_per_pack > 0 AND price_per_pack >= 0 AND stock_packs >= 0)
);

COMMENT ON COLUMN medicines.name           IS 'Metoprolol';
COMMENT ON COLUMN medicines.strength       IS '25 mg';
COMMENT ON COLUMN medicines.units_per_pack IS '10 tablets per strip';
COMMENT ON COLUMN medicines.stock_packs    IS 'Hospital pharmacy stock';


-- G2. prescriptions ----------------------------------------------------------
CREATE TABLE prescriptions (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY,
  prescription_no    VARCHAR(30)         NOT NULL,
  patient_id         BIGINT              NOT NULL,
  doctor_id          BIGINT              NOT NULL,
  appointment_id     BIGINT              NULL,
  medical_record_id  BIGINT              NULL,
  prescribed_on      DATE                NOT NULL,
  valid_until        DATE                NULL,
  diagnosis          VARCHAR(255)        NULL,
  notes              TEXT                NULL,
  status             prescription_status NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ         NOT NULL DEFAULT now(),
  CONSTRAINT pk_prescriptions PRIMARY KEY (id),
  CONSTRAINT uq_prescriptions_no UNIQUE (prescription_no),
  CONSTRAINT uq_prescriptions_medical_record UNIQUE (medical_record_id),
  CONSTRAINT fk_prescriptions_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_prescriptions_doctor_id
    FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE RESTRICT,
  CONSTRAINT fk_prescriptions_appointment_id
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL,
  CONSTRAINT fk_prescriptions_medical_record_id
    FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE SET NULL
);
CREATE INDEX idx_prescriptions_patient_status ON prescriptions (patient_id, status);
CREATE INDEX idx_prescriptions_doctor ON prescriptions (doctor_id);

COMMENT ON COLUMN prescriptions.medical_record_id IS 'Its entry in the Records list';


-- G3. prescription_items -----------------------------------------------------
CREATE TABLE prescription_items (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY,
  prescription_id         BIGINT       NOT NULL,
  medicine_id             BIGINT       NOT NULL,
  dose_quantity           NUMERIC(5,2) NOT NULL,
  dose_unit               VARCHAR(20)  NOT NULL,
  frequency_per_day       SMALLINT     NOT NULL,
  meal_timing             meal_timing  NOT NULL DEFAULT 'any',
  meal_label              VARCHAR(30)  NULL,
  duration_days           SMALLINT     NOT NULL,
  total_quantity          SMALLINT     NOT NULL,
  quantity_remaining      SMALLINT     NOT NULL DEFAULT 0,
  refill_alert_threshold  SMALLINT     NOT NULL DEFAULT 5,
  start_date              DATE         NOT NULL,
  end_date                DATE         NULL,
  instructions            VARCHAR(255) NULL,
  is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT pk_prescription_items PRIMARY KEY (id),
  CONSTRAINT chk_prescription_items_frequency CHECK (frequency_per_day BETWEEN 1 AND 12),
  CONSTRAINT chk_prescription_items_quantities CHECK (
    dose_quantity > 0 AND duration_days > 0 AND total_quantity >= 0
    AND quantity_remaining >= 0 AND refill_alert_threshold >= 0),
  CONSTRAINT fk_prescription_items_prescription_id
    FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE,
  CONSTRAINT fk_prescription_items_medicine_id
    FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE RESTRICT
);
CREATE INDEX idx_prescription_items_prescription ON prescription_items (prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items (medicine_id);

COMMENT ON COLUMN prescription_items.dose_unit              IS 'tablet, capsule, ml';
COMMENT ON COLUMN prescription_items.frequency_per_day      IS '2 = twice a day';
COMMENT ON COLUMN prescription_items.meal_label             IS 'after dinner, after lunch';
COMMENT ON COLUMN prescription_items.total_quantity         IS '"of 30"';
COMMENT ON COLUMN prescription_items.quantity_remaining     IS '"18 left" – decremented when a dose is taken';
COMMENT ON COLUMN prescription_items.refill_alert_threshold IS 'Show "Refill soon" at or below this';


-- G4. medication_reminders ---------------------------------------------------
CREATE TABLE medication_reminders (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY,
  prescription_item_id  BIGINT  NOT NULL,
  dose_time             TIME    NOT NULL,
  is_enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_medication_reminders PRIMARY KEY (id),
  CONSTRAINT uq_medication_reminders_item_time UNIQUE (prescription_item_id, dose_time),
  CONSTRAINT fk_medication_reminders_prescription_item_id
    FOREIGN KEY (prescription_item_id) REFERENCES prescription_items (id) ON DELETE CASCADE
);

COMMENT ON COLUMN medication_reminders.dose_time IS '08:00, 18:00 ...';


-- G5. medication_dose_logs ---------------------------------------------------
CREATE TABLE medication_dose_logs (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY,
  medication_reminder_id  BIGINT      NOT NULL,
  patient_id              BIGINT      NOT NULL,
  scheduled_at            TIMESTAMPTZ NOT NULL,
  status                  dose_status NOT NULL DEFAULT 'pending',
  taken_at                TIMESTAMPTZ NULL,
  logged_by_user_id       BIGINT      NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_medication_dose_logs PRIMARY KEY (id),
  CONSTRAINT uq_dose_logs_reminder_time UNIQUE (medication_reminder_id, scheduled_at),
  CONSTRAINT fk_medication_dose_logs_medication_reminder_id
    FOREIGN KEY (medication_reminder_id) REFERENCES medication_reminders (id) ON DELETE CASCADE,
  CONSTRAINT fk_medication_dose_logs_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT fk_medication_dose_logs_logged_by_user_id
    FOREIGN KEY (logged_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_dose_logs_patient_time ON medication_dose_logs (patient_id, scheduled_at);


-- =============================================================================
-- H. PHARMACY ORDERS
-- =============================================================================

-- H1. pharmacy_orders --------------------------------------------------------
CREATE TABLE pharmacy_orders (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  order_no             VARCHAR(30)           NOT NULL,
  patient_id           BIGINT                NOT NULL,
  placed_by_user_id    BIGINT                NULL,
  prescription_id      BIGINT                NULL,
  fulfilment_type      fulfilment_type       NOT NULL,
  delivery_address_id  BIGINT                NULL,
  pickup_room_id       BIGINT                NULL,
  status               pharmacy_order_status NOT NULL DEFAULT 'placed',
  subtotal             NUMERIC(12,2)         NOT NULL,
  discount_amount      NUMERIC(12,2)         NOT NULL DEFAULT 0.00,
  delivery_fee         NUMERIC(12,2)         NOT NULL DEFAULT 0.00,
  total_amount         NUMERIC(12,2)         NOT NULL,
  invoice_id           BIGINT                NULL,
  expected_ready_at    TIMESTAMPTZ           NULL,
  delivered_at         TIMESTAMPTZ           NULL,
  cancelled_at         TIMESTAMPTZ           NULL,
  cancellation_reason  VARCHAR(255)          NULL,
  created_at           TIMESTAMPTZ           NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ           NOT NULL DEFAULT now(),
  CONSTRAINT pk_pharmacy_orders PRIMARY KEY (id),
  CONSTRAINT uq_pharmacy_orders_no UNIQUE (order_no),
  CONSTRAINT chk_pharmacy_orders_amounts CHECK (
    subtotal >= 0 AND discount_amount >= 0 AND delivery_fee >= 0 AND total_amount >= 0),
  CONSTRAINT fk_pharmacy_orders_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_pharmacy_orders_placed_by_user_id
    FOREIGN KEY (placed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_pharmacy_orders_prescription_id
    FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE SET NULL,
  CONSTRAINT fk_pharmacy_orders_delivery_address_id
    FOREIGN KEY (delivery_address_id) REFERENCES addresses (id) ON DELETE SET NULL,
  CONSTRAINT fk_pharmacy_orders_pickup_room_id
    FOREIGN KEY (pickup_room_id) REFERENCES rooms (id) ON DELETE SET NULL,
  CONSTRAINT fk_pharmacy_orders_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE SET NULL
);
CREATE INDEX idx_pharmacy_orders_patient ON pharmacy_orders (patient_id, created_at);
CREATE INDEX idx_pharmacy_orders_status ON pharmacy_orders (status);

COMMENT ON COLUMN pharmacy_orders.prescription_id     IS 'Attached / verified prescription';
COMMENT ON COLUMN pharmacy_orders.delivery_address_id IS 'Required when home_delivery (app-enforced)';
COMMENT ON COLUMN pharmacy_orders.pickup_room_id      IS 'Pharmacy counter for pickup';


-- H2. pharmacy_order_items ---------------------------------------------------
CREATE TABLE pharmacy_order_items (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY,
  pharmacy_order_id     BIGINT        NOT NULL,
  medicine_id           BIGINT        NOT NULL,
  prescription_item_id  BIGINT        NULL,
  quantity_packs        SMALLINT      NOT NULL,
  unit_price            NUMERIC(10,2) NOT NULL,
  line_total            NUMERIC(12,2) NOT NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_pharmacy_order_items PRIMARY KEY (id),
  CONSTRAINT chk_pharmacy_order_items_qty CHECK (quantity_packs > 0 AND unit_price >= 0 AND line_total >= 0),
  CONSTRAINT fk_pharmacy_order_items_pharmacy_order_id
    FOREIGN KEY (pharmacy_order_id) REFERENCES pharmacy_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_pharmacy_order_items_medicine_id
    FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE RESTRICT,
  CONSTRAINT fk_pharmacy_order_items_prescription_item_id
    FOREIGN KEY (prescription_item_id) REFERENCES prescription_items (id) ON DELETE SET NULL
);
CREATE INDEX idx_pharmacy_order_items_order ON pharmacy_order_items (pharmacy_order_id);

COMMENT ON COLUMN pharmacy_order_items.unit_price IS 'Price snapshot';


-- =============================================================================
-- I. INSURANCE
-- =============================================================================

-- I1. insurance_providers ----------------------------------------------------
CREATE TABLE insurance_providers (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  name                 VARCHAR(150) NOT NULL,
  tpa_name             VARCHAR(150) NULL,
  helpline_phone       VARCHAR(20)  NULL,
  logo_file_id         BIGINT       NULL,
  is_cashless_partner  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_insurance_providers PRIMARY KEY (id),
  CONSTRAINT uq_insurance_providers_name UNIQUE (name),
  CONSTRAINT fk_insurance_providers_logo_file_id
    FOREIGN KEY (logo_file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);

COMMENT ON COLUMN insurance_providers.name     IS 'Star Health';
COMMENT ON COLUMN insurance_providers.tpa_name IS 'Third-party administrator';


-- I2. insurance_policies -----------------------------------------------------
CREATE TABLE insurance_policies (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY,
  provider_id        BIGINT        NOT NULL,
  policy_number      VARCHAR(50)   NOT NULL,
  plan_name          VARCHAR(100)  NOT NULL,
  holder_patient_id  BIGINT        NOT NULL,
  added_by_user_id   BIGINT        NULL,
  sum_insured        NUMERIC(12,2) NOT NULL,
  amount_used        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  amount_remaining   NUMERIC(12,2) GENERATED ALWAYS AS (sum_insured - amount_used) STORED,
  valid_from         DATE          NOT NULL,
  valid_to           DATE          NOT NULL,
  is_cashless        BOOLEAN       NOT NULL DEFAULT FALSE,
  status             policy_status NOT NULL DEFAULT 'pending_verification',
  card_file_id       BIGINT        NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_insurance_policies PRIMARY KEY (id),
  CONSTRAINT uq_insurance_policies_provider_number UNIQUE (provider_id, policy_number),
  CONSTRAINT chk_insurance_policies_dates CHECK (valid_to >= valid_from),
  CONSTRAINT chk_insurance_policies_amounts CHECK (sum_insured >= 0 AND amount_used >= 0),
  CONSTRAINT fk_insurance_policies_provider_id
    FOREIGN KEY (provider_id) REFERENCES insurance_providers (id) ON DELETE RESTRICT,
  CONSTRAINT fk_insurance_policies_holder_patient_id
    FOREIGN KEY (holder_patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_insurance_policies_added_by_user_id
    FOREIGN KEY (added_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_insurance_policies_card_file_id
    FOREIGN KEY (card_file_id) REFERENCES file_uploads (id) ON DELETE SET NULL
);
CREATE INDEX idx_insurance_policies_holder ON insurance_policies (holder_patient_id);

COMMENT ON COLUMN insurance_policies.plan_name        IS 'Family Gold plan';
COMMENT ON COLUMN insurance_policies.amount_remaining IS 'Calculated by the database. Never write to this column.';
COMMENT ON COLUMN insurance_policies.card_file_id     IS 'Photo of the insurance card';


-- I3. insurance_policy_members -----------------------------------------------
CREATE TABLE insurance_policy_members (
  policy_id   BIGINT          NOT NULL,
  patient_id  BIGINT          NOT NULL,
  relation    family_relation NOT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT pk_insurance_policy_members PRIMARY KEY (policy_id, patient_id),
  CONSTRAINT fk_insurance_policy_members_policy_id
    FOREIGN KEY (policy_id) REFERENCES insurance_policies (id) ON DELETE CASCADE,
  CONSTRAINT fk_insurance_policy_members_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);
CREATE INDEX idx_policy_members_patient ON insurance_policy_members (patient_id);


-- I4. insurance_claims -------------------------------------------------------
CREATE TABLE insurance_claims (
  id               BIGINT GENERATED ALWAYS AS IDENTITY,
  claim_no         VARCHAR(30)   NOT NULL,
  policy_id        BIGINT        NOT NULL,
  patient_id       BIGINT        NOT NULL,
  invoice_id       BIGINT        NULL,
  admission_id     BIGINT        NULL,
  title            VARCHAR(200)  NOT NULL,
  claimed_amount   NUMERIC(12,2) NOT NULL,
  approved_amount  NUMERIC(12,2) NULL,
  status           claim_status  NOT NULL DEFAULT 'draft',
  filed_at         TIMESTAMPTZ   NULL,
  decided_at       TIMESTAMPTZ   NULL,
  settled_at       TIMESTAMPTZ   NULL,
  remarks          VARCHAR(500)  NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT pk_insurance_claims PRIMARY KEY (id),
  CONSTRAINT uq_insurance_claims_no UNIQUE (claim_no),
  CONSTRAINT chk_insurance_claims_amount CHECK (claimed_amount >= 0 AND (approved_amount IS NULL OR approved_amount >= 0)),
  CONSTRAINT fk_insurance_claims_policy_id
    FOREIGN KEY (policy_id) REFERENCES insurance_policies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_insurance_claims_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
  CONSTRAINT fk_insurance_claims_invoice_id
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE SET NULL,
  CONSTRAINT fk_insurance_claims_admission_id
    FOREIGN KEY (admission_id) REFERENCES admissions (id) ON DELETE SET NULL
);
CREATE INDEX idx_insurance_claims_policy ON insurance_claims (policy_id, status);
CREATE INDEX idx_insurance_claims_patient ON insurance_claims (patient_id);

COMMENT ON COLUMN insurance_claims.claim_no        IS 'CLM-5521';
COMMENT ON COLUMN insurance_claims.title           IS 'Ward 3B stay';
COMMENT ON COLUMN insurance_claims.approved_amount IS 'NULL until decided';


-- I5. insurance_claim_documents ----------------------------------------------
CREATE TABLE insurance_claim_documents (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  claim_id             BIGINT              NOT NULL,
  file_id              BIGINT              NOT NULL,
  document_type        claim_document_type NOT NULL,
  uploaded_by_user_id  BIGINT              NULL,
  created_at           TIMESTAMPTZ         NOT NULL DEFAULT now(),
  CONSTRAINT pk_insurance_claim_documents PRIMARY KEY (id),
  CONSTRAINT fk_insurance_claim_documents_claim_id
    FOREIGN KEY (claim_id) REFERENCES insurance_claims (id) ON DELETE CASCADE,
  CONSTRAINT fk_insurance_claim_documents_file_id
    FOREIGN KEY (file_id) REFERENCES file_uploads (id) ON DELETE RESTRICT,
  CONSTRAINT fk_insurance_claim_documents_uploaded_by_user_id
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_claim_documents_claim ON insurance_claim_documents (claim_id);


-- =============================================================================
-- J. EMERGENCY
-- =============================================================================

-- J1. ambulances -------------------------------------------------------------
CREATE TABLE ambulances (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY,
  vehicle_number       VARCHAR(20)      NOT NULL,
  ambulance_type       ambulance_type   NOT NULL DEFAULT 'basic',
  driver_name          VARCHAR(150)     NULL,
  driver_mobile        VARCHAR(15)      NULL,
  status               ambulance_status NOT NULL DEFAULT 'available',
  current_latitude     NUMERIC(10,7)    NULL,
  current_longitude    NUMERIC(10,7)    NULL,
  location_updated_at  TIMESTAMPTZ      NULL,
  is_active            BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT pk_ambulances PRIMARY KEY (id),
  CONSTRAINT uq_ambulances_vehicle UNIQUE (vehicle_number)
);
CREATE INDEX idx_ambulances_status ON ambulances (status);

COMMENT ON COLUMN ambulances.vehicle_number IS 'GJ-05-AB-1234';


-- J2. emergency_requests -----------------------------------------------------
CREATE TABLE emergency_requests (
  id               BIGINT GENERATED ALWAYS AS IDENTITY,
  request_no       VARCHAR(30)            NOT NULL,
  user_id          BIGINT                 NULL,
  patient_id       BIGINT                 NULL,
  request_type     emergency_request_type NOT NULL,
  latitude         NUMERIC(10,7)          NULL,
  longitude        NUMERIC(10,7)          NULL,
  address_text     VARCHAR(255)           NULL,
  distance_km      NUMERIC(6,2)           NULL,
  eta_minutes      SMALLINT               NULL,
  ambulance_id     BIGINT                 NULL,
  status           emergency_status       NOT NULL DEFAULT 'requested',
  notes            VARCHAR(500)           NULL,
  requested_at     TIMESTAMPTZ            NOT NULL DEFAULT now(),
  acknowledged_at  TIMESTAMPTZ            NULL,
  dispatched_at    TIMESTAMPTZ            NULL,
  arrived_at       TIMESTAMPTZ            NULL,
  completed_at     TIMESTAMPTZ            NULL,
  cancelled_at     TIMESTAMPTZ            NULL,
  updated_at       TIMESTAMPTZ            NOT NULL DEFAULT now(),
  CONSTRAINT pk_emergency_requests PRIMARY KEY (id),
  CONSTRAINT uq_emergency_requests_no UNIQUE (request_no),
  CONSTRAINT fk_emergency_requests_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_emergency_requests_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE SET NULL,
  CONSTRAINT fk_emergency_requests_ambulance_id
    FOREIGN KEY (ambulance_id) REFERENCES ambulances (id) ON DELETE SET NULL
);
CREATE INDEX idx_emergency_requests_status ON emergency_requests (status, requested_at);
CREATE INDEX idx_emergency_requests_user ON emergency_requests (user_id);
CREATE INDEX idx_emergency_requests_ambulance ON emergency_requests (ambulance_id);

COMMENT ON COLUMN emergency_requests.patient_id   IS 'May be unknown at the time of the SOS';
COMMENT ON COLUMN emergency_requests.address_text IS 'Reverse-geocoded, e.g. Ring Road, Surat';


-- =============================================================================
-- K. NOTIFICATIONS
-- =============================================================================

-- K1. notifications ----------------------------------------------------------
CREATE TABLE notifications (
  id              BIGINT GENERATED ALWAYS AS IDENTITY,
  user_id         BIGINT            NOT NULL,
  patient_id      BIGINT            NULL,
  type            notification_type NOT NULL,
  title           VARCHAR(150)      NOT NULL,
  body            VARCHAR(500)      NOT NULL,
  reference_type  VARCHAR(50)       NULL,
  reference_id    BIGINT            NULL,
  data            JSONB             NULL,
  is_read         BOOLEAN           NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ       NULL,
  push_status     push_status       NOT NULL DEFAULT 'not_sent',
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT pk_notifications PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_patient_id
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user_read_time ON notifications (user_id, is_read, created_at);
CREATE INDEX idx_notifications_patient ON notifications (patient_id);

COMMENT ON COLUMN notifications.patient_id     IS 'Which family member it is about';
COMMENT ON COLUMN notifications.reference_type IS 'appointment, lab_report, invoice ... (for deep links)';
COMMENT ON COLUMN notifications.data           IS 'Extra payload for the app';


-- =============================================================================
-- updated_at TRIGGERS  (users already has its own)
-- =============================================================================
CREATE TRIGGER trg_user_devices_updated_at               BEFORE UPDATE ON user_devices               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_settings_updated_at              BEFORE UPDATE ON user_settings              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated_at                   BEFORE UPDATE ON patients                   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patient_conditions_updated_at         BEFORE UPDATE ON patient_conditions         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patient_emergency_contacts_updated_at BEFORE UPDATE ON patient_emergency_contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_addresses_updated_at                  BEFORE UPDATE ON addresses                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated_at                BEFORE UPDATE ON departments                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_beds_updated_at                       BEFORE UPDATE ON beds                       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_doctors_updated_at                    BEFORE UPDATE ON doctors                    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_doctor_schedules_updated_at           BEFORE UPDATE ON doctor_schedules           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_admissions_updated_at                 BEFORE UPDATE ON admissions                 FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated_at                   BEFORE UPDATE ON invoices                   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at                   BEFORE UPDATE ON payments                   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated_at               BEFORE UPDATE ON appointments               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_opd_queue_counters_updated_at         BEFORE UPDATE ON opd_queue_counters         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_video_consultations_updated_at        BEFORE UPDATE ON video_consultations        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_doctor_reviews_updated_at             BEFORE UPDATE ON doctor_reviews             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_medical_records_updated_at            BEFORE UPDATE ON medical_records            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lab_reports_updated_at                BEFORE UPDATE ON lab_reports                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_medicines_updated_at                  BEFORE UPDATE ON medicines                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prescriptions_updated_at              BEFORE UPDATE ON prescriptions              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prescription_items_updated_at         BEFORE UPDATE ON prescription_items         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_medication_dose_logs_updated_at       BEFORE UPDATE ON medication_dose_logs       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pharmacy_orders_updated_at            BEFORE UPDATE ON pharmacy_orders            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_insurance_policies_updated_at         BEFORE UPDATE ON insurance_policies         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_insurance_claims_updated_at           BEFORE UPDATE ON insurance_claims           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ambulances_updated_at                 BEFORE UPDATE ON ambulances                 FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_emergency_requests_updated_at         BEFORE UPDATE ON emergency_requests         FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
