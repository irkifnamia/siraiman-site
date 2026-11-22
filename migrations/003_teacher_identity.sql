-- Prepared only; do not apply until explicitly approved.
-- Teacher login identifier is separate from student matric numbers.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS login_identifier text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_login_identifier ON app_users (lower(login_identifier)) WHERE login_identifier IS NOT NULL;
ALTER TABLE app_users ADD CONSTRAINT teacher_login_identifier_required CHECK (role <> 'teacher' OR login_identifier IS NOT NULL) NOT VALID;
