# Передача секретов через Yandex Lockbox

Документ описывает целевую схему передачи production-секретов разработчикам через Yandex Lockbox.

Сейчас рабочие env-файлы остаются на сервере:

```text
/etc/hr-screening/app.env
/etc/academy-ai-relay/app.env
```

Lockbox нужен, чтобы разработчики не копировали секреты из SSH вручную и чтобы доступ можно было централизованно выдавать и отзывать.

## 1. Что создаем в Lockbox

Рекомендуем создать два отдельных секрета:

```text
academy-hr-screening-production-env
academy-ai-relay-production-env
```

Почему не один общий секрет:

- у HR-приложения и relay-бота разные зоны ответственности;
- разработчику можно выдать доступ только к нужному набору;
- проще ротировать и проверять доступы.

## 2. Какие значения положить

### academy-hr-screening-production-env

Ключи из `/etc/hr-screening/app.env`:

```text
ADMIN_PASSWORD
ADMIN_PASSWORD_RESET
ADMIN_USERNAME
AI_PROVIDER
APP_PUBLIC_URL
HH_CLIENT_ID
HH_CLIENT_SECRET
HH_REDIRECT_URI
HH_USER_AGENT
HH_WEBHOOK_SECRET
HR_PASSWORD
HR_PASSWORD_RESET
HR_USERNAME
NODE_ENV
OPENAI_API_KEY
OPENAI_MODEL
PORT
SMTP_FROM
SMTP_HOST
SMTP_PASSWORD
SMTP_PORT
SMTP_SECURE
SMTP_USER
TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_WEBHOOK_URL
YANDEX_FOLDER_ID
YANDEX_GPT_API_KEY
YANDEX_GPT_MODEL
```

### academy-ai-relay-production-env

Ключи из `/etc/academy-ai-relay/app.env`:

```text
AI_PROVIDER
APP_PUBLIC_URL
BITRIX_BOT_ID
BITRIX_CLIENT_ID
BITRIX_WEBHOOK_BASE
NODE_ENV
OPENAI_API_KEY
OPENAI_MODEL
PORT
RELAY_WEBHOOK_TOKEN
YANDEX_FOLDER_ID
YANDEX_GPT_API_KEY
YANDEX_GPT_MODEL
```

## 3. Какие права выдать разработчику

Минимально для чтения секретов:

```text
lockbox.payloadViewer
```

Если разработчик должен менять значения секретов:

```text
lockbox.editor
```

Для обычного разработчика лучше начинать с `lockbox.payloadViewer`.

## 4. Что запросить у разработчика

Разработчик должен прислать одно из двух:

```text
Yandex Cloud login / email аккаунта
```

или

```text
IAM user id / federated user id
```

Bitrix user id и GitHub login для выдачи доступа в Lockbox не подходят.

## 5. Команды для администратора Yandex Cloud

Если установлен и авторизован `yc` CLI:

```bash
yc lockbox secret create \
  --name academy-hr-screening-production-env \
  --description "Production env for Academy HR Screening"

yc lockbox secret create \
  --name academy-ai-relay-production-env \
  --description "Production env for Academy AI Relay"
```

Добавление версии секрета удобнее делать из подготовленного файла без вывода значений в терминал:

```bash
yc lockbox secret add-version \
  --name academy-hr-screening-production-env \
  --payload-file ./hr-screening-lockbox-payload.json

yc lockbox secret add-version \
  --name academy-ai-relay-production-env \
  --payload-file ./academy-ai-relay-lockbox-payload.json
```

Выдача доступа по Yandex login:

```bash
yc lockbox secret add-access-binding academy-hr-screening-production-env \
  --role lockbox.payloadViewer \
  --user-yandex-login developer@example.com

yc lockbox secret add-access-binding academy-ai-relay-production-env \
  --role lockbox.payloadViewer \
  --user-yandex-login developer@example.com
```

Если используется IAM/federated id:

```bash
yc lockbox secret add-access-binding academy-hr-screening-production-env \
  --role lockbox.payloadViewer \
  --subject userAccount:<USER_ACCOUNT_ID>
```

## 6. Что нельзя делать

- Нельзя отправлять значения секретов в Bitrix24, Telegram, GitHub или email.
- Нельзя коммитить `.env` в репозиторий.
- Нельзя давать всем общий SSH-ключ ради доступа к секретам.
- Нельзя выдавать `editor`, если достаточно `payloadViewer`.
- Нельзя оставлять доступ подрядчику после завершения работ.

## 7. Временная схема до полного Lockbox

До переноса секретов в Lockbox разработчик может смотреть env на сервере, если ему выдан персональный SSH-доступ:

```bash
ssh ubuntu@93.77.178.9
sudo cat /etc/hr-screening/app.env
sudo cat /etc/academy-ai-relay/app.env
```

Это временная схема. Целевая схема - Yandex Lockbox.

