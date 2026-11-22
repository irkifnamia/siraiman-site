-- Apply only after explicit approval. This file is NOT executed by committing it.
CREATE TABLE IF NOT EXISTS student_activation_codes (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 student_id bigint NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 code_hash text NOT NULL UNIQUE,
 created_by uuid NOT NULL REFERENCES app_users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 used_at timestamptz,
 revoked_at timestamptz,
 CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS idx_student_activation_student ON student_activation_codes(student_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_activation_expiry ON student_activation_codes(expires_at);
CREATE TABLE IF NOT EXISTS student_activation_attempts (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 identifier_hash text NOT NULL,
 attempted_at timestamptz NOT NULL DEFAULT now(),
 succeeded boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_student_activation_attempts ON student_activation_attempts(identifier_hash,attempted_at DESC);
