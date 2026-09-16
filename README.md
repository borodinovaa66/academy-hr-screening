# Academy HR Screening

MVP web application for первичный HR-отбор кандидатов на позицию SMM-менеджера.

Production pilot:

```text
https://hr.academy-management.ru
```

Admin:

```text
https://hr.academy-management.ru/#admin
```

## What It Does

- Candidate completes a 20-question screening flow in 7-10 minutes.
- UI is built as a chat-like one-question-per-screen questionnaire.
- Candidate accepts privacy policy and personal data consent before starting.
- System stores answers, candidate data, score, recommendation, risk flags, consent versions and technical consent evidence.
- Green candidates automatically receive a practical test assignment and can submit a Google Docs link.
- HR sees dashboard, candidate list, candidate profile, score, strengths, risks and answers.
- Admin analytics page shows funnel metrics, completion rate, quality distribution and visual charts.
- Questionnaire methodology is editable in admin as JSON config.
- AI analytics can be enabled with `OPENAI_API_KEY`; current legal/product policy is to use anonymized or aggregated data only.
- AI analytics supports YandexGPT or OpenAI. Production pilot uses YandexGPT because the app runs in Yandex Cloud.

## Tech Stack

- Node.js 22+
- Built-in `node:sqlite`
- SQLite
- Plain HTML/CSS/JS frontend
- Nginx reverse proxy in production
- Certbot / Let's Encrypt for HTTPS

No npm dependencies are required for the current MVP.

## Local Run

```bash
npm start
```

Open:

```text
http://localhost:4173
http://localhost:4173/#admin
```

Default local admin:

```text
admin / hr-demo
```

For Windows Codex desktop sessions, Node may be available via the bundled runtime instead of PATH:

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' server.js
```

## Environment Variables

Copy `.env.example` and set real values outside Git.

```text
PORT=4173
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_PASSWORD_RESET=0
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

AI_PROVIDER=yandex
YANDEX_GPT_API_KEY=
YANDEX_FOLDER_ID=
YANDEX_GPT_MODEL=yandexgpt-lite
```

`ADMIN_PASSWORD_RESET=1` forces password reset for an existing database. Set it back to `0` after reset.

## Project Structure

```text
server.js                 HTTP server, API, static serving, OpenAI analytics
src/database.js           SQLite schema, users, sessions, submissions, config
src/defaultConfig.js      Default questionnaire methodology
src/scoring.js            Scoring, flags, strengths, risks, analytics
public/app.js             Candidate UI and admin UI
public/styles.css         UI styling
public/assets/            Sasha character assets and favicons
public/index.html         SPA entry point
```

## Documents

- [Project agent rules](AGENTS.md)
- [Cross-role coordination board](docs/agent-team/06_COORDINATION_BOARD.md)
- [Project handover](PROJECT_HANDOVER.md)
- [Deployment](DEPLOYMENT.md)
- [HR guide](HR_GUIDE.md)
- [Evidence-based hiring standard v2](docs/EVIDENCE_BASED_HIRING_STANDARD_V2.md)
- [Evidence-based role package template v2](docs/ROLE_PACKAGE_TEMPLATE_V2.md)
- [Security](SECURITY.md)
- [Backlog](BACKLOG.md)
- [Changelog](CHANGELOG.md)

## Data And Security

Do not commit production DB, backups, env files, passwords, SSH keys or cloud service keys.

Runtime database is intentionally ignored by Git:

```text
data/hr-screening.sqlite
```

Production stores personal data. Treat DB and backups as confidential.
