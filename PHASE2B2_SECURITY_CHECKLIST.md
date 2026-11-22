# Phase 2B.2 — Teacher bootstrap and activation security checks

## State
Development branch only. Teacher provisioning has NOT been run; no teacher/student accounts have been activated. Database migrations 002 and 003 remain prepared, not applied. `LMS_ACTIVATION_ENABLED` is absent/false.

## Teacher setup
- A dedicated teacher login identifier is separate from student matric numbers.
- Apply migration 003 only after approval, then run `scripts/bootstrap-teacher.js` locally in a private terminal after independently verifying teacher identity.
- The bootstrap requires `LMS_BOOTSTRAP_TEACHER=YES`, an interactive terminal, password confirmation, and an explicit confirmation phrase. It refuses to run when a teacher account already exists.
- Do not put teacher passwords, bootstrap flags or database credentials into GitHub, ChatGPT messages, CI logs or browser scripts.
- Local script currently echoes password input; use a secure private terminal or improve to masked input before real use.

## Activation acceptance tests required before enabling
- Unauthenticated issuance => 401; student issuance => 403.
- Missing feature flag => 503 for issuance and redemption.
- Wrong/expired/revoked code => reject without creating account.
- Code cannot be redeemed twice, including concurrent requests.
- Reissuing revokes prior unused code.
- Only the intended matric number can redeem a code.
- Successful redemption creates one student account with hashed password.
- Failed attempts rate limited; add IP/device-level limits and abuse monitoring.
- Verify CSRF/origin handling, session cookie scope, deployment protection, and teacher credential recovery.

## Known limitations
- Tests in this branch currently cover local pure functions; full database/API integration tests have NOT been executed.
- Activation and login attempt counters are keyed by matric number, not IP/device.
- Preview currently connects to the imported Neon project; use a separate disposable Neon test branch for destructive integration tests.
- Before student access, consider secure teacher password input and recovery, student identity verification, and data privacy.
- No production deployment or `main` merge is authorized.

## Isolated preview database (2026-11-23)
- Neon branch `lms-phase2b-test` (`br-sparkling-bar-b3np4pvf`) was created from the default branch; 67 copied students, zero users, zero codes.
- Migrations 002 and 003 were applied to this **testing branch only**.
- The Vercel `DATABASE_URL` secret scoped to Git branch `lms-phase2b` / preview was switched to this testing branch; `AUTH_PEPPER` remains unchanged.
- Vercel SSO protection is enabled for preview deployments; production settings and Neon default branch were not changed.
- Student activation remains disabled; full API and concurrency tests are still pending.
