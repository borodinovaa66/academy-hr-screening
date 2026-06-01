# Security

## Secrets

Never commit:

- `.env` files;
- `.deploy-*.env`;
- `.deploy-admin-password.txt`;
- SQLite databases;
- SSH private keys;
- Yandex Cloud service account keys;
- OpenAI API keys.

Use `.env.example` only as a template.

## Admin access

Admin sessions use HttpOnly cookies. In production `NODE_ENV=production` must be set so cookies are marked `Secure`.

To reset the admin password:

1. Edit `/etc/hr-screening/app.env`.
2. Set a new `ADMIN_PASSWORD`.
3. Temporarily set `ADMIN_PASSWORD_RESET=1`.
4. Restart the app.
5. Set `ADMIN_PASSWORD_RESET=0`.
6. Restart again.

## Personal data

The app stores candidate personal data and screening answers in SQLite. Treat production DB backups as confidential.

External AI services must receive only anonymized or aggregated data unless a separate legal basis and consent are implemented.

## Server access

SSH access should be issued to named engineers only. Remove access when a person leaves the project.

## Minimum production hardening backlog

- separate HR accounts instead of shared admin;
- password rotation policy;
- audit log for admin actions;
- tested backup restore procedure;
- separate staging environment;
- monitoring and alerts.
