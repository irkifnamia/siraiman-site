# Teacher account setup — SIR AIMAN LMS

Chosen teacher login ID: `aimanfikri`.

**Status:** Account not created. Do not share passwords in ChatGPT, GitHub issues, or screenshots.

## Secure local setup (test branch only)

1. On your own trusted computer, clone `irkifnamia/siraiman-site`, check out `lms-phase2b`, and run `npm install`.
2. Open Neon Console → project `siraiman-site` → branch **`lms-phase2b-test`**. Copy the database connection string for this branch only. Never use the original Neon `main` branch connection string for testing.
3. In a private local terminal, configure `DATABASE_URL` as a temporary environment variable without saving it to the repository. Do not commit `.env` files or paste secrets into chat.
4. Set `LMS_BOOTSTRAP_TEACHER=YES` in the same terminal, then run `node scripts/bootstrap-teacher.js`.
5. Enter login ID **`aimanfikri`** and a unique password (12–128 characters). The password input is hidden. Confirm by typing `CREATE TEACHER`.
6. Check the test branch using `SELECT login_identifier,role,status FROM app_users WHERE role='teacher';` — never query password hashes for screenshots.
7. Visit the protected preview at `/lms/` and sign in. Leave `LMS_ACTIVATION_ENABLED` disabled until teacher login, student permissions, and code redemption have been tested.

## Security boundaries

- The bootstrap script refuses to create a second teacher account.
- The testing branch contains a copy of 67 student records; avoid using real student identities during integration testing.
- A teacher account in the **test** branch does **not** create a production teacher account. Production account provisioning requires a separate reviewed deployment plan.
- Never activate students or merge into `main` merely because the Vercel build succeeds.
