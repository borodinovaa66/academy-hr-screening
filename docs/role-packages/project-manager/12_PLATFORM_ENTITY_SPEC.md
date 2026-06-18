# Спецификация вакансии для платформы

## 1. Назначение

Этот документ нужен разработчику или интегратору, чтобы перенести вакансию менеджера проектов в платформу подбора.

Цель: создать отдельную ссылку на анкету менеджера проектов, не смешивая кандидатов с SMM-вакансией.

## 2. Базовая сущность вакансии

```json
{
  "vacancyCode": "project-manager",
  "publicTitle": "Менеджер проектов в онлайн-школу",
  "internalTitle": "Менеджер проектов / проджект",
  "department": "Маркетинг, запуски, проектное управление",
  "status": "active",
  "workFormat": "remote",
  "employment": "full_time",
  "salaryMin": null,
  "salaryMax": null,
  "questionnaireVersion": 1,
  "testAssignmentEnabled": true,
  "testAssignmentThreshold": 70,
  "interviewScripts": {
    "peopleManager": "06_PERSONNEL_INTERVIEW_SCRIPT.md",
    "decisionMaker": "07_DECISION_MAKER_INTERVIEW_SCRIPT.md"
  }
}
```

## 3. Публичная ссылка

Желательный формат:

```text
/v/project-manager
```

Если быстро дорабатывать платформу сложно, временный вариант:

```text
/project-manager
```

Критично: в базе кандидата должен сохраняться код вакансии `project-manager`, иначе поток смешается с SMM.

## 4. Поля кандидата

| Поле | Тип | Обязательно |
| --- | --- | --- |
| vacancyCode | строка | Да |
| fullName | строка | Да |
| phone | строка | Да |
| email | строка | Да |
| resumeUrl | ссылка / текст | Да |
| cityTimezone | строка | Да |
| answers | объект | Да |
| score | число | Да |
| status | строка | Да |
| flags | список | Да |
| testAssignmentUrl | ссылка | Нет |
| peopleManagerInterviewNotes | текст | Нет |
| decisionMakerInterviewNotes | текст | Нет |

## 5. Вопросы для анкеты

Минимальный набор для первой версии:

```json
[
  {
    "id": "fullName",
    "title": "Как вас зовут?",
    "type": "text",
    "required": true
  },
  {
    "id": "contacts",
    "title": "Как с вами связаться?",
    "type": "contact",
    "required": true
  },
  {
    "id": "resumeUrl",
    "title": "Прикрепите ссылку на резюме или профиль",
    "type": "text",
    "required": true
  },
  {
    "id": "projectExperience",
    "title": "Какой у вас общий опыт проектной координации или управления проектами?",
    "type": "radio",
    "required": true,
    "options": [
      { "value": "lt_6m", "label": "Менее 6 месяцев", "score": 0 },
      { "value": "6_12m", "label": "6-12 месяцев", "score": 4 },
      { "value": "1_2y", "label": "1-2 года", "score": 7 },
      { "value": "2y_plus", "label": "2+ года", "score": 10 }
    ]
  },
  {
    "id": "domains",
    "title": "В каких сферах вы работали как менеджер проектов?",
    "type": "checkbox",
    "required": true,
    "maxScore": 10
  },
  {
    "id": "onlineEducationExperience",
    "title": "Был ли опыт в онлайн-школах, EdTech, инфобизнесе или образовательных проектах?",
    "type": "radio",
    "required": true
  },
  {
    "id": "responsibilities",
    "title": "С какими задачами вы реально работали?",
    "type": "checkbox",
    "required": true,
    "maxScore": 15
  },
  {
    "id": "tools",
    "title": "С какими инструментами вы уверенно работаете?",
    "type": "checkbox",
    "required": true,
    "maxScore": 10
  },
  {
    "id": "sheetsLevel",
    "title": "Насколько уверенно вы работаете с Google Sheets / Excel?",
    "type": "scale",
    "required": true,
    "min": 1,
    "max": 5
  },
  {
    "id": "projectCase",
    "title": "Опишите один проект, где вы отвечали за сроки, задачи и координацию людей.",
    "type": "textarea",
    "required": true,
    "maxLength": 1200
  },
  {
    "id": "deadlineRiskCase",
    "title": "Что вы делаете, если подрядчик срывает срок за день до запуска?",
    "type": "textarea",
    "required": true,
    "maxLength": 900
  },
  {
    "id": "funnelCheck",
    "title": "Как вы проверяете готовность воронки / вебинара / страницы перед запуском?",
    "type": "textarea",
    "required": true,
    "maxLength": 900
  },
  {
    "id": "workFormat",
    "title": "Какой формат работы вам подходит?",
    "type": "radio",
    "required": true
  },
  {
    "id": "income",
    "title": "Какой уровень дохода вы рассматриваете?",
    "type": "text",
    "required": true
  },
  {
    "id": "availability",
    "title": "Когда вы готовы выйти?",
    "type": "radio",
    "required": true
  },
  {
    "id": "motivation",
    "title": "Почему рассматриваете новую работу?",
    "type": "textarea",
    "required": true,
    "maxLength": 700
  },
  {
    "id": "antiExpectations",
    "title": "Что для вас точно неприемлемо в работе?",
    "type": "textarea",
    "required": true,
    "maxLength": 700
  },
  {
    "id": "testReadiness",
    "title": "Готовы ли выполнить короткое тестовое задание?",
    "type": "radio",
    "required": true
  }
]
```

## 6. Пороги

```json
{
  "thresholds": {
    "strong": 75,
    "manualReview": 55,
    "reserve": 40
  },
  "statuses": {
    "strong": "Сильный",
    "manualReview": "Спорный",
    "reserve": "Резерв",
    "reject": "Отказ"
  }
}
```

## 7. Правило тестового задания

```json
{
  "testAssignment": {
    "enabled": true,
    "mainVariant": "Разбор мини-запуска и план управления проектом",
    "issueWhenScoreAtLeast": 70,
    "manualApprovalRequired": true,
    "sourceDocument": "05_TEST_ASSIGNMENTS.md"
  }
}
```

## 8. Что нужно доработать в платформе

Минимально:

1. Добавить справочник вакансий.
2. Добавить код вакансии в карточку кандидата.
3. Добавить публичную ссылку `/v/project-manager`.
4. Привязать вопросы и скоринг к вакансии.
5. В админке добавить фильтр по вакансии.
6. В карточке кандидата показывать нужные сценарии интервью.
7. Отдельно хранить тестовое задание и критерии оценки по вакансии.

Временный путь, если нужно запустить сегодня:

1. Использовать документы из пакета вручную.
2. Создать форму в Google Forms / Tally / Typeform с вопросами из `04_PLATFORM_QUESTIONNAIRE.md`.
3. Ссылку на форму поставить в HeadHunter и Telegram.
4. Ответы выгружать в таблицу.
5. Менеджер по персоналу вручную присваивает статус по правилам из `08_SCORING_AND_FUNNEL_RULES.md`.

Это быстрее, чем срочно ломать текущую SMM-платформу, если разработка второй вакансии займет больше одного дня.
