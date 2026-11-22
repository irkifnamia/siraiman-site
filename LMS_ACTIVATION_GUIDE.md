# Student activation — implementation only

## Scope
This implementation is committed to the `lms-phase2b` development branch. **No activation codes have been issued, no accounts activated, and the migration has not been applied.** Production main is unchanged.

## Design
1. A signed-in, active teacher selects a matric number.
2. The teacher-only endpoint `POST /api/lms/activation-issue` generates a cryptographically random 36-hex-character (144-bit) single-use code, stores only a keyed hash, revokes previous unused codes and returns the plaintext once.
3. The teacher privately gives the code to the intended student. Code expires after 48 hours.
4. Student enters matric number, code and a 12–128 character password at `/lms/activate.html`.
5. The server atomically consumes the code and creates/activates the student's password account. Codes cannot be reused.
6. Attempts are rate limited per matric number. This must be supplemented with IP/device rate limits, monitoring and verified teacher provisioning before enabling real access.

## Prerequisites before enabling
- Approve and apply `migrations/002_student_activation.sql` to the correct Neon project.
- Securely bootstrap a verified teacher account (no default teacher credentials).
- Test login, issuance, redemption, expiry, reissue and concurrency in a non-production database.
- Verify that the preview is protected and that codes are not exposed in logs or analytics.
- Set `LMS_ACTIVATION_ENABLED=true` **only after** the above checks and explicit approval. Unset/false disables both activation endpoints.
- Ensure AUTH_PEPPER and DATABASE_URL remain server-only and confidential.
- Review student data privacy, recovery and support process.

## Important limitation
This is a development implementation, not a completed security audit. A one-time code authenticates possession of the code, so distribution must be private and student identity verified by the teacher.
