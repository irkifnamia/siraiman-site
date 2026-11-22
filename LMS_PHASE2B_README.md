# SIR AIMAN LMS — Phase 2B development preview

This branch adds a separate student portal at /lms/ and server-only API endpoints at /api/lms/. Production remains on main.

## Status
- Database schema and 67 semester-2 student records imported into dedicated Neon project siraiman-site.
- Account activation intentionally **not performed**. There are no active login accounts or default passwords.
- Teacher access is restricted by authenticated role. Student academic data must never be embedded in static files.
- Vercel preview variables DATABASE_URL and AUTH_PEPPER are scoped to branch lms-phase2b.
- This is a development preview, not a completed production-ready LMS.

## Security tasks before real students can sign in
- Implement an authenticated teacher bootstrap and one-time invitation/activation flow with verified identity.
- Add password reset, session rotation, stronger rate limiting across identifiers/IPs, and an account lockout policy.
- Review access controls on every new endpoint; restrict grades and submissions by authenticated student ID.
- Add automated integration and end-to-end tests and database migration tooling.
- Establish privacy policy, backups, retention and deletion procedures for student data.
- Ensure preview access is restricted; do not publish credentials or student records.

## Testing
Run npm install and npm test in a trusted development environment. Validate the preview endpoint /api/lms/me returns 401 when unauthenticated and /api/lms/students does not reveal the roster.

## Release boundary
Do not merge this branch to main or deploy it to production without a separate explicit approval.
