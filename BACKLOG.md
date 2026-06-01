# Backlog

## High priority before full production

- Create a staging environment separate from production.
- Move deployment to GitHub-based release process.
- Add per-user admin accounts and roles.
- Add export of candidates to CSV/XLSX.
- Add notification to HR after a new questionnaire is submitted.
- Add audit log for admin login and config changes.
- Test backup restore procedure.
- Let legal owner approve `privacy_v2` and `personal_data_consent_v2`.

## Product improvements

- Visual editor for questionnaire methodology instead of raw JSON.
- File upload for resumes instead of link-only field.
- Candidate source tracking via UTM/referral links.
- Email templates for invite/reject/talent pool.
- More detailed interview guide generated from candidate risks.

## AI improvements

- Keep OpenAI analytics anonymized by default.
- Add explicit switch showing what data is sent to AI.
- Log AI requests/responses without personal data.
- Add AI evaluation for open answers with explainable criteria.

## Technical improvements

- PostgreSQL if candidate volume grows or multiple admins work actively.
- CI checks for syntax and basic API tests.
- Automated deployment from GitHub.
- Healthcheck endpoint.
- Server monitoring.
