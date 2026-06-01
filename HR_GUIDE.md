# HR Guide

## Candidate link

Send candidates:

```text
https://hr.academy-management.ru
```

The candidate sees the welcome screen, accepts the privacy policy and personal data consent, then answers 20 questions.

## Admin link

```text
https://hr.academy-management.ru/#admin
```

Use the admin login issued by the technical owner. Do not send admin credentials to candidates or external contractors.

## Candidate statuses

- `Green`: invite to interview.
- `Yellow`: manual HR review.
- `Orange`: reserve / talent pool if there is a shortage.
- `Red`: reject or review only with a strong manual reason.

The score is a screening aid, not a final hiring decision.

## What to check in a candidate card

1. Final score and color status.
2. Stop factors.
3. Strengths.
4. Risks.
5. Portfolio/resume link.
6. Open answers: content mini-case and recent SMM innovation.
7. Consent block: versions, timestamp, IP/user-agent.
8. Test assignment block if it was assigned.

## Test Assignment

The pilot automatically offers the practical assignment only to `Green` candidates with a score of 80/100 or higher. `Yellow` candidates stay on manual HR review and do not receive the assignment automatically.

The assignment asks the candidate to audit the Instagram profile:

```text
https://www.instagram.com/mednikova.promanagement/
```

The candidate submits a Google Docs or Google Drive link. The link is saved in the candidate card under `Тестовое задание`.

## How to report a bug or improvement

Create a task for development/support with:

- link to candidate card if relevant;
- screenshot;
- expected behavior;
- actual behavior;
- urgency: blocker / important / nice to have.

Do not ask developers to edit production data manually unless there is an incident.

## Legal notes

Candidates must be able to open:

- `https://hr.academy-management.ru/privacy`
- `https://hr.academy-management.ru/personal-data-consent`

Current document versions:

- `privacy_v2`
- `personal_data_consent_v2`

If documents change, development must update versions so new submissions record the new legal version.
