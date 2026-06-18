# Актуальная инструкция для разработчика

Дата актуализации: 2026-06-18

Документ нужен разработчику, который принимает проекты Академии в работу после первичной сборки MVP в Codex.

Главная идея: код и документация лежат в GitHub, production-сервисы работают на сервере, секреты не передаются через чаты, а целевой способ передачи секретов - Yandex Lockbox.

## 1. Какие проекты передаются

Передается 5 проектов:

1. `Academy HR Screening`
   - HR-платформа для анкетирования, скоринга, тестовых заданий и первичной воронки подбора.
   - GitHub: `https://github.com/borodinovaa66/academy-hr-screening`
   - Production: `https://hr.academy-management.ru`
   - Админка: `https://hr.academy-management.ru/#admin`

2. `Launch OS`
   - Платформа управления запусками.
   - GitHub: `https://github.com/borodinovaa66/launch-os`
   - Production: `https://makelounch.com`

3. `Academy Finance Dashboard`
   - Финансовый BI-дашборд Академии.
   - GitHub: `https://github.com/borodinovaa66/academy-finance-dashboard`
   - Production: `https://finance.academy-management.ru`

4. `CEO Dashboard`
   - Управленческий BI-дашборд внутри BI-репозитория.
   - Папка в репозитории: `ceo-dashboard/`

5. `Voronka Dashboard`
   - BI-дашборд по воронкам внутри BI-репозитория.
   - Папка в репозитории: `voronka-dashboard/`

## 2. Что уже сделано по инфраструктуре

### GitHub

GitHub CLI на рабочей машине владельца проекта авторизован под аккаунтом:

```text
borodinovaa66
```

Проверенный доступ:

```text
borodinovaa66/academy-hr-screening
borodinovaa66/launch-os
borodinovaa66/academy-finance-dashboard
```

Разработчика нужно добавить в соответствующие репозитории вручную через GitHub.

Минимально:

- обычный разработчик: `Write`;
- технический лидер: `Maintain`;
- внешний подрядчик: временный доступ, который потом нужно отозвать.

### Сервер

Основной production-сервер:

```text
93.77.178.9
OS: Ubuntu 24.04 LTS
Zone: ru-central1-a
VM name: my-cloud-server
```

Рабочие сервисы:

```text
hr-screening.service
academy-ai-relay.service
```

Пути:

```text
/opt/hr-screening
/opt/academy-ai-relay
```

Production env:

```text
/etc/hr-screening/app.env
/etc/academy-ai-relay/app.env
```

Важно: значения env-файлов нельзя копировать в GitHub, Bitrix24, Telegram, email, скриншоты или документацию.

### Yandex Cloud CLI

`yc CLI` установлен:

- на локальной Windows-машине владельца проекта;
- на production-сервере.

Локальный профиль настроен и видит облако:

```text
cloud: cloud-borodinovaa66
cloud-id: b1gg9sjq1shsgf4ts95a
folder: default
folder-id: b1gsbo8ftg92cgjicjls
zone: ru-central1-a
```

Проверено:

```text
VM my-cloud-server видна
Lockbox доступен
Lockbox пока пустой
```

На сервере `yc CLI` установлен, но не авторизован для headless-работы. Для автоматических операций на сервере позже нужен service account key. Для ручной настройки Lockbox сейчас используется локальный `yc`.

### Bitrix24-бот

В Bitrix24 работает бот:

```text
AI Техпомощник Академии
```

Он нужен как первая точка входа для разработчика.

Примеры команд:

```text
покажи проекты
дай пакет передачи HR
дай пакет передачи Launch OS
дай пакет передачи BI
как деплоить HR
какие доступы нужны по HR
где инструкция по SMTP
как работает HeadHunter
```

Важно: бот пока не полноценный AI-ассистент. Он отвечает по заготовленным сценариям и документации. Для свободных вопросов нужен следующий этап доработки: LLM + поиск по документации + права доступа.

## 3. Что нужно сделать разработчику в первый день

1. Получить доступ в Bitrix24.
2. Найти бота `AI Техпомощник Академии`.
3. Написать боту:

```text
покажи проекты
```

4. Затем:

```text
дай пакет передачи HR
```

5. Получить доступ к GitHub-репозиториям.
6. Склонировать нужные репозитории.
7. Прочитать документы:

```text
DEVELOPER_ONBOARDING.md
PROJECT_HANDOVER.md
DEPLOYMENT.md
SECURITY.md
docs/SECRET_HANDOFF_LOCKBOX.md
docs/DEVELOPER_CURRENT_INSTRUCTION.md
```

8. Поднять проект локально.
9. Проверить production-ссылки.
10. Составить один список вопросов и рисков.

## 4. Как получить секреты

### Временная схема

Пока Lockbox не заполнен, секреты лежат на сервере:

```bash
ssh ubuntu@93.77.178.9
sudo cat /etc/hr-screening/app.env
sudo cat /etc/academy-ai-relay/app.env
```

Это только временная схема.

Правила:

- не копировать весь env целиком в локальную разработку;
- брать только конкретные переменные, нужные для проверки;
- локальный `.env` не коммитить;
- не пересылать значения в чаты;
- не делать скриншоты с секретами.

### Целевая схема: Yandex Lockbox

Для production-секретов должны быть созданы два секрета:

```text
academy-hr-screening-production-env
academy-ai-relay-production-env
```

Документ:

```text
docs/SECRET_HANDOFF_LOCKBOX.md
```

Чтобы выдать доступ разработчику, от него нужен:

```text
Yandex Cloud login / email
```

или:

```text
IAM user id / federated user id
```

Bitrix user id и GitHub login для Lockbox не подходят.

Стандартная роль для разработчика:

```text
lockbox.payloadViewer
```

Роль `lockbox.editor` выдавать только если разработчик действительно должен менять production-секреты.

## 5. Как работать с кодом

Общий порядок:

```bash
git clone <repo-url>
cd <repo>
git checkout main
git pull
git checkout -b feature/<short-task-name>
```

После изменений:

```bash
git status
git diff
git add <files>
git commit -m "Short clear commit message"
git push origin feature/<short-task-name>
```

Дальше - Pull Request.

Не работать напрямую в `main`, кроме экстренных hotfix по согласованию.

## 6. Как поднять HR-проект локально

```bash
git clone https://github.com/borodinovaa66/academy-hr-screening.git
cd academy-hr-screening
cp .env.example .env
npm start
```

На Windows:

```powershell
Copy-Item .env.example .env
npm start
```

Открыть:

```text
http://localhost:4173
http://localhost:4173/#admin
```

Желательно использовать Node.js 22+.

## 7. Production HR: проверка и логи

Проверить сервис:

```bash
ssh ubuntu@93.77.178.9
sudo systemctl status hr-screening --no-pager
sudo journalctl -u hr-screening -n 100 --no-pager
```

Проверить relay-бота:

```bash
sudo systemctl status academy-ai-relay --no-pager
sudo journalctl -u academy-ai-relay -n 100 --no-pager
```

Проверить Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
```

## 8. Что нельзя делать

Нельзя:

- коммитить `.env`;
- коммитить SQLite production-базу;
- коммитить SSH private key;
- вставлять токены в README или задачи;
- отправлять секреты через Bitrix24/Telegram/email;
- копировать production-базу на локальную машину без необходимости и обезличивания;
- редактировать production-код на сервере без фиксации изменений в Git;
- давать общий SSH-ключ всем разработчикам;
- оставлять доступ подрядчику после завершения работ.

## 9. Минимальная проверка после изменений HR

Перед PR или production-деплоем проверить:

1. Открывается публичная анкета.
2. Кандидат может пройти анкету.
3. Ответ сохраняется.
4. Админка открывается.
5. Кандидат виден в списке.
6. Карточка кандидата открывается.
7. Удаление тестовых кандидатов работает.
8. Если затронуто тестовое - проверены выдача, срок 48 часов и статус просрочки.
9. Если затронута почта - проверена тестовая отправка.
10. Если затронут Telegram - проверены deep-link и журнал коммуникаций.
11. Если затронут HH - проверены OAuth, webhook и синхронизация откликов.
12. Если затронут AI - проверены fallback, сохранение результата и отсутствие отправки лишних персональных данных.

## 10. Что уже отправлено разработчику

В Bitrix24 пользователю `94` отправлена инструкция по Lockbox и запрос:

```text
Yandex Cloud login / email
или
IAM user id / federated user id
```

После получения этих данных нужно:

1. Создать секреты в Yandex Lockbox.
2. Перенести значения из production env.
3. Выдать разработчику `lockbox.payloadViewer`.
4. Проверить, что он видит секреты.
5. После этого постепенно уходить от чтения env напрямую через SSH.

## 11. Как разработчику задавать вопросы

Сначала через Bitrix24-бота:

```text
AI Техпомощник Академии
```

Если бот не помог:

1. Посмотреть документацию в репозитории.
2. Создать GitHub Issue или задачу в Bitrix24.
3. Приложить:
   - URL/экран;
   - что делал;
   - что ожидал;
   - что произошло;
   - время;
   - скриншот без секретов;
   - логи без секретов.

## 12. Что считать успешной передачей

Передача считается нормальной, когда разработчик:

- получил доступ к Bitrix24;
- получил доступ к GitHub;
- получил SSH или согласованный способ деплоя;
- прислал Yandex Cloud login/IAM id для Lockbox;
- получил доступ к Lockbox или временно к env на сервере;
- поднял HR-проект локально;
- понимает, где production, логи, база и env;
- знает, как задавать вопросы боту;
- создал первый PR или список технических вопросов.

