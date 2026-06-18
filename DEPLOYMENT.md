# Deployment

## Production server

Current pilot runs on:

- Domain: `https://hr.academy-management.ru`
- Server IP: `93.77.178.9`
- OS: Ubuntu 24.04 LTS
- App path: `/opt/hr-screening`
- App user: `hrapp`
- Service: `hr-screening.service`
- Reverse proxy: Nginx
- TLS: Let's Encrypt / Certbot
- Database: `/opt/hr-screening/data/hr-screening.sqlite`

## Environment

Production env file:

```bash
/etc/hr-screening/app.env
```

The production `.env` file is stored outside the Git repository and is read by
`hr-screening.service`. Developers who receive production SSH access can inspect
it on the server:

```bash
ssh ubuntu@93.77.178.9
sudo cat /etc/hr-screening/app.env
```

Do not copy this file into the repository, Bitrix24, Telegram, GitHub issues, or
ordinary email. If a developer needs local integration testing, copy only the
specific variables required for that local test into a local `.env` file that is
ignored by Git.

Related production secret/config files:

```bash
/etc/hr-screening/app.env          # HR Screening application
/etc/academy-ai-relay/app.env      # Bitrix24 AI relay / developer bot
```

Production application directories:

```bash
/opt/hr-screening                  # HR Screening app code and SQLite data
/opt/academy-ai-relay              # Bitrix24 AI relay service
```

Required variables:

```bash
PORT=4173
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
ADMIN_PASSWORD_RESET=0
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

AI_PROVIDER=yandex
YANDEX_GPT_API_KEY=
YANDEX_FOLDER_ID=
YANDEX_GPT_MODEL=yandexgpt-lite
```

Do not commit real env files, admin passwords, SSH keys, service account keys, or SQLite data.

## Restart and status

```bash
sudo systemctl status hr-screening
sudo systemctl restart hr-screening
sudo journalctl -u hr-screening -n 100 --no-pager
```

Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

## Deploy updated code manually

From a clean release package, copy files to `/opt/hr-screening`, keep `data/` intact, then restart:

```bash
sudo rsync -a --delete \
  --exclude data \
  --exclude logs \
  ./ /opt/hr-screening/

sudo chown -R hrapp:hrapp /opt/hr-screening
sudo systemctl restart hr-screening
```

For future production work, replace this with CI/CD from GitHub.

## TLS certificate

Certificate:

```bash
sudo certbot certificates -d hr.academy-management.ru
```

Renewal timer:

```bash
systemctl list-timers | grep certbot
```

## Backups

Backup script:

```bash
/usr/local/bin/backup-hr-screening
```

Backup directory:

```bash
/var/backups/hr-screening
```

Timer:

```bash
systemctl list-timers | grep hr-screening-backup
```

The support engineer must periodically test restore, not just check that backup files exist.

## Restore outline

1. Stop app: `sudo systemctl stop hr-screening`.
2. Copy selected backup to `/opt/hr-screening/data/hr-screening.sqlite`.
3. Set owner: `sudo chown hrapp:hrapp /opt/hr-screening/data/hr-screening.sqlite`.
4. Start app: `sudo systemctl start hr-screening`.
5. Check admin dashboard and latest submissions.
