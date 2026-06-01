const ADMIN_USER_KEY = "hr_admin_user";
const FUNNEL_SESSION_KEY = "hr_funnel_session";
const FUNNEL_LANDING_KEY = "hr_funnel_landing_tracked";
const LEGAL_VERSION = {
  privacy: "privacy_v2",
  personalDataConsent: "personal_data_consent_v2"
};
const OPERATOR = {
  project: 'Бизнес-школа "Академия менеджмента"',
  legalName: "ИП Медникова Екатерина Николаевна",
  inn: "771600191345",
  ogrnip: "320508100083298",
  address: "141143, Московская область, городской округ Щелково, деревня Кишкино, д. 40",
  email: "hr@praktiki.pro",
  dataRetention: "6 месяцев"
};

let labels = {
  experienceYears: {
    less1: "Менее 1 года",
    "1_2": "1-2 года",
    "2_3": "2-3 года",
    "3_5": "3-5 лет",
    more5: "Более 5 лет"
  },
  projectTypes: {
    b2b: "B2B",
    expert: "Экспертные продукты",
    education: "Образовательные проекты",
    consulting: "Консалтинг / услуги",
    premium: "Премиальные продукты",
    b2c: "B2C",
    personalBrand: "Личный бренд",
    ecommerce: "E-commerce",
    lifestyle: "Развлекательные / лайфстайл",
    other: "Другое"
  },
  socialNetworks: {
    instagram: "Instagram",
    telegram: "Telegram",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    youtubeShorts: "YouTube Shorts",
    tiktok: "TikTok",
    vk: "VK",
    other: "Другое"
  },
  platformsCount: {
    one: "1",
    two: "2",
    three: "3",
    fourFive: "4-5",
    moreFive: "Более 5"
  },
  responsibilities: {
    publishing: "Публикация готового контента",
    textAdaptation: "Адаптация текстов",
    expertContent: "Сборка из экспертных материалов",
    contentPlanning: "Контент-планирование",
    basicDesign: "Базовый дизайн / верстка",
    stories: "Stories / интерактивы",
    reels: "Reels / Shorts",
    autoposting: "Автопостинг",
    analyticsReports: "Аналитика и отчеты",
    growth: "Рост подписчиков / вовлеченности",
    leadgen: "Лидогенерация",
    competitors: "Мониторинг конкурентов",
    trendwatching: "Трендвотчинг",
    contractors: "Работа с подрядчиками"
  },
  readiness: {
    adaptTexts: "Адаптировать тексты",
    basicDesign: "Базовый дизайн и верстка",
    autoposting: "Настраивать автопостинг",
    qualityCheck: "Проверять ссылки, CTA, UTM",
    statistics: "Анализировать статистику",
    growthHypotheses: "Предлагать гипотезы роста",
    competitorsTrends: "Мониторить конкурентов и тренды",
    aiTools: "Работать с ИИ-инструментами",
    onlyPublishing: "Только публиковать материалы"
  },
  tools: {
    canva: "Canva",
    figma: "Figma",
    capcut: "CapCut / видеоредактор",
    autopostingServices: "Сервисы автопостинга",
    sheets: "Google Sheets / Excel",
    projectTools: "Notion / Trello / Asana / ClickUp",
    textAi: "ChatGPT / текстовые ИИ",
    visualAi: "ИИ для визуалов",
    socialAnalytics: "Аналитика соцсетей",
    noTools: "Не использую проф. инструменты"
  },
  soloDesign: {
    stories: "Оформить stories",
    carousel: "Сверстать карусель",
    cover: "Сделать обложку",
    banner: "Подготовить баннер",
    resize: "Адаптировать размеры",
    videoCut: "Нарезать короткое видео",
    nothing: "Ничего из перечисленного"
  },
  metrics: {
    reach: "Охваты / показы",
    er: "ER / вовлеченность",
    saves: "Сохранения / репосты",
    comments: "Комментарии и реакции",
    videoRetention: "Досмотры / удержание",
    clicks: "Переходы",
    follows: "Подписки / отписки",
    leads: "Заявки / лиды",
    ctrUtm: "CTR / UTM / конверсии",
    leadQuality: "Качество лидов",
    noAnalytics: "Не работал(а) с аналитикой"
  },
  noLeadsActions: {
    audienceQuality: "Проверю качество аудитории",
    ctaOffer: "Проверю CTA и оффер",
    userPath: "Проверю путь пользователя",
    funnelConversion: "Проверю конверсии этапов",
    wrongReachTopics: "Найду темы с нецелевым охватом",
    funnelHypotheses: "Предложу гипотезы по воронке",
    morePosts: "Увеличу количество постов",
    notResponsible: "SMM не отвечает за заявки",
    adsNoAnalysis: "Запущу рекламу без анализа"
  },
  trendFrequency: {
    weekly: "Системно, минимум раз в неделю",
    monthly: "Регулярно, 1-2 раза в месяц",
    taskBased: "Иногда, когда есть задача",
    rare: "Редко",
    never: "Не отслеживаю"
  },
  deadlineBehavior: {
    warnAndSolve: "Заранее предупреждаю и предлагаю решение",
    askMove: "Сообщаю и прошу перенести срок",
    qualityDrop: "Пытаюсь успеть любой ценой",
    lateNotice: "Сообщаю, когда уже не успел(а)",
    waitManager: "Жду, пока руководитель спросит"
  },
  weakPlanBehavior: {
    analyzeHypotheses: "Анализирую данные и предлагаю гипотезы",
    tellAndWait: "Говорю, что план слабый, и жду решения",
    keepExecuting: "Продолжаю выполнять утвержденный план",
    changeAlone: "Меняю все самостоятельно",
    notMyZone: "Ничего, это зона маркетолога"
  },
  feedbackBehavior: {
    improveCalmly: "Спокойно разбираю и улучшаю",
    okIfSpecific: "Нормально, если конкретно и уважительно",
    hardButWork: "Сложно, но стараюсь работать",
    defend: "Обычно защищаю свое решение",
    dislike: "Не люблю вмешательство"
  },
  workValues: {
    openComms: "Открытая коммуникация",
    honesty: "Честность в сроках и ошибках",
    responsibility: "Ответственность за результат",
    testingNew: "Тестирование нового",
    development: "Постоянное развитие",
    strongTeam: "Сильная команда",
    freedom: "Минимум контроля",
    stableTasks: "Стабильные задачи",
    creativityNoMetrics: "Творчество без метрик",
    onlyClearTasks: "Только четкое ТЗ"
  },
  workFormat: {
    remote: "Удаленно",
    hybrid: "Гибрид",
    office: "Офис",
    any: "Любой формат"
  },
  availability: {
    now: "Сразу",
    week1: "В течение 1 недели",
    weeks2: "В течение 2 недель",
    month: "В течение месяца",
    later: "Более месяца"
  }
};

let questions = [
  { id: "fullName", title: "Как вас зовут?", type: "namePair", required: true },
  { id: "contacts", title: "Как с вами связаться?", type: "contactPair", required: true },
  { id: "portfolio", title: "Прикрепите файл или ссылку на документ с вашим резюме", type: "text", required: true, placeholder: "Ссылка на резюме или файл" },
  { section: "Релевантный опыт", id: "experienceYears", title: "Сколько лет вы работаете в SMM?", type: "radio", required: true },
  { id: "projectTypes", title: "Какие типы проектов вы вели?", type: "checkbox", maxPick: 6 },
  { id: "socialNetworks", title: "Какие соцсети вы вели лично?", type: "checkbox" },
  { id: "platformsCount", title: "Сколько площадок вы вели одновременно?", type: "radio", required: true },
  { section: "Зона ответственности", id: "responsibilities", title: "Что входило в вашу личную зону ответственности?", type: "checkbox" },
  { id: "readiness", title: "Что из этого вы готовы делать регулярно в этой роли?", type: "checkbox" },
  { section: "Мини-кейс", id: "contentCase", title: "Какие 3-5 единиц контента вы бы сделали из экспертного текста “5 ошибок компаний при построении маркетинговой воронки”?", type: "textarea", max: 700, required: true },
  { section: "Инструменты", id: "tools", title: "В каких инструментах вы уверенно работаете?", type: "checkbox" },
  { id: "soloDesign", title: "Какие задачи вы можете делать самостоятельно без дизайнера?", type: "checkbox" },
  { section: "Аналитика, рост, тренды", id: "metrics", title: "С какими метриками вы регулярно работали?", type: "checkbox" },
  { id: "noLeadsActions", title: "Что вы сделаете, если охваты растут, а заявок нет?", type: "checkbox" },
  { id: "trendFrequency", title: "Как часто вы отслеживаете конкурентов, референсы и тренды?", type: "radio", required: true },
  { id: "innovation", title: "Что нового вы внедрили в SMM за последние 3-6 месяцев?", type: "textarea", max: 500, required: true },
  { section: "Культура и рабочее поведение", id: "deadlineBehavior", title: "Что вы делаете, если понимаете, что не успеваете к дедлайну?", type: "radio", required: true },
  { id: "weakPlanBehavior", title: "Что вы делаете, если видите, что текущий контент-план не даст результата?", type: "radio", required: true },
  { id: "feedbackBehavior", title: "Как вы реагируете на прямую обратную связь по своей работе?", type: "radio", required: true },
  { section: "Ожидания", id: "expectations", title: "Формат работы, доход и дата выхода", type: "expectations" }
];

const state = {
  route: location.hash || "#candidate",
  answers: {
    projectTypes: [],
    socialNetworks: [],
    responsibilities: [],
    readiness: [],
    tools: [],
    soloDesign: [],
    metrics: [],
    noLeadsActions: [],
    workValues: [],
    workFormat: [],
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    contacts: "",
    vacancyMin: 90000,
    vacancyMax: 140000
  },
  hasStarted: false,
  consents: {
    privacy: false,
    dataProcessing: false
  },
  currentStep: 0,
  submissions: [],
  analytics: null,
  selected: null,
  aiInsights: null,
  completedSubmission: null,
  testLink: "",
  testSubmitted: false,
  user: null,
  config: null,
  configText: "",
  configOpen: false,
  adminSection: "candidates",
  trackedSteps: new Set(),
  loading: false
};

window.addEventListener("hashchange", () => {
  state.route = location.hash || "#candidate";
  render();
});

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  children.forEach(child => node.append(child?.nodeType ? child : document.createTextNode(String(child))));
  return node;
}

function icon(name) {
  const paths = {
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    spark: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths[name] || paths.check}</svg>`;
}

function funnelSessionId() {
  let id = sessionStorage.getItem(FUNNEL_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(FUNNEL_SESSION_KEY, id);
  }
  return id;
}

function trackEvent(eventType, step = null) {
  if (currentAppRoute() !== "candidate") return;
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId: funnelSessionId(),
      eventType,
      step
    })
  }).catch(() => {});
}

function trackLandingOnce() {
  if (sessionStorage.getItem(FUNNEL_LANDING_KEY)) return;
  sessionStorage.setItem(FUNNEL_LANDING_KEY, "1");
  trackEvent("landing_view");
}

function iconEl(name) {
  return el("span", { class: "inline-icon", html: icon(name) });
}

function brandMark() {
  return el("div", { class: "brand-mark" }, [
    el("div", { class: "brand-kicker" }, ["Бизнес-школа"]),
    el("div", { class: "brand-name" }, ["Академия менеджмента"])
  ]);
}

function guideForQuestion(index, q) {
  const captions = {
    fullName: "Начнем с простого: как к вам обращаться в переписке и документах.",
    contacts: "Оставьте email и телефон, чтобы HR мог быстро связаться с вами.",
    portfolio: "Резюме помогает быстро увидеть ваш опыт без лишней переписки.",
    experienceYears: "Здесь важно понять общий уровень самостоятельности и насмотренности.",
    projectTypes: "Отметьте типы проектов, с которыми вы реально работали.",
    socialNetworks: "Нам важно, какие площадки вы вели своими руками.",
    platformsCount: "Количество площадок показывает, как вы держите операционную нагрузку.",
    responsibilities: "Выберите то, что действительно было вашей зоной ответственности.",
    readiness: "Здесь проверяем совпадение роли с тем, что вы готовы делать регулярно.",
    contentCase: "Покажите, как вы превращаете экспертный материал в контент.",
    tools: "Инструменты важны, потому что роль требует самостоятельности.",
    soloDesign: "Нужно понять, какие визуальные задачи вы закрываете без дизайнера.",
    metrics: "Метрики показывают, управляете ли вы результатом, а не только публикациями.",
    noLeadsActions: "Этот вопрос про системное мышление в воронке.",
    trendFrequency: "SMM быстро меняется, поэтому важно видеть рынок и референсы.",
    innovation: "Расскажите про реальное внедрение, а не просто наблюдение за трендами.",
    deadlineBehavior: "Дедлайны проверяют ответственность и коммуникацию.",
    weakPlanBehavior: "Здесь важна проактивность: заметить проблему и предложить решение.",
    feedbackBehavior: "Обратная связь показывает, как человек растет в работе.",
    expectations: "Финально сверяем формат, сроки и ожидания."
  };
  const pose = String(Math.min(index + 1, 20)).padStart(2, "0");
  return {
    image: `/assets/poses/sasha-q${pose}.png?v=1`,
    caption: captions[q.id] || "Ответьте по вашему реальному опыту."
  };
}

function optionLabel(field, value) {
  return labels[field]?.[value] || value || "—";
}

function selectedText(field, values) {
  const list = Array.isArray(values) ? values : [values];
  return list.filter(Boolean).map(value => optionLabel(field, value)).join(", ") || "—";
}

function applyConfig(config) {
  state.config = config;
  labels = config.labels || labels;
  questions = config.questions || questions;
  state.answers.vacancyMin = config.defaults?.vacancyMin ?? state.answers.vacancyMin;
  state.answers.vacancyMax = config.defaults?.vacancyMax ?? state.answers.vacancyMax;
  state.configText = JSON.stringify(config, null, 2);
}

async function loadConfig() {
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("Config load failed");
  const data = await response.json();
  applyConfig(data.config);
}

function setAnswer(id, value, checked, maxPick) {
  const current = state.answers[id];
  if (Array.isArray(current)) {
    const next = checked ? [...new Set([...current, value])] : current.filter(item => item !== value);
    if (maxPick && next.length > maxPick) return;
    state.answers[id] = next;
  } else {
    state.answers[id] = value;
  }
  render();
}

function setNamePart(id, value) {
  state.answers[id] = value;
  state.answers.fullName = [state.answers.firstName, state.answers.lastName]
    .map(part => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
  updateCurrentActionState();
}

function setContactPart(id, value) {
  state.answers[id] = value;
  state.answers.contacts = [state.answers.email, state.answers.phone]
    .map(part => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
  updateCurrentActionState();
}

function setConsent(id, checked) {
  state.consents[id] = checked;
  render();
}

function currentAppRoute() {
  if (location.pathname === "/privacy") return "privacy";
  if (location.pathname === "/personal-data-consent") return "personal-data-consent";
  if (state.route.startsWith("#test/")) return "test-assignment";
  return state.route === "#admin" ? "admin" : "candidate";
}

function progress() {
  return Math.round(((state.currentStep + 1) / questions.length) * 100);
}

function currentQuestionNumber() {
  return state.currentStep + 1;
}

function stepComplete(q) {
  if (!q) return false;
  if (q.type === "expectations") {
    return state.answers.workValues.length > 0 &&
      state.answers.workFormat.length > 0 &&
      String(state.answers.income || "").trim().length > 0 &&
      String(state.answers.availability || "").trim().length > 0;
  }
  if (q.type === "namePair") {
    return String(state.answers.firstName || "").trim().length > 0 &&
      String(state.answers.lastName || "").trim().length > 0;
  }
  if (q.type === "contactPair") {
    return String(state.answers.email || "").trim().length > 0 &&
      String(state.answers.phone || "").trim().length > 0;
  }
  const value = state.answers[q.id];
  if (Array.isArray(value)) return value.length > 0;
  return String(value || "").trim().length > 0;
}

function validateStep() {
  const q = questions[state.currentStep];
  return stepComplete(q);
}

function updateCurrentActionState() {
  const button = document.querySelector("[data-current-action='next']");
  if (button) button.disabled = !validateStep();
}

function field(q) {
  const value = state.answers[q.id];
  if (q.type === "namePair") {
    return el("div", { class: "name-grid" }, [
      el("label", { class: "named-input" }, [
        el("span", {}, ["Имя"]),
        el("input", {
          class: "input",
          value: state.answers.firstName || "",
          placeholder: "Анна",
          oninput: event => setNamePart("firstName", event.target.value)
        })
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Фамилия"]),
        el("input", {
          class: "input",
          value: state.answers.lastName || "",
          placeholder: "Иванова",
          oninput: event => setNamePart("lastName", event.target.value)
        })
      ])
    ]);
  }
  if (q.type === "contactPair") {
    return el("div", { class: "name-grid" }, [
      el("label", { class: "named-input" }, [
        el("span", {}, ["Email"]),
        el("input", {
          class: "input",
          type: "email",
          value: state.answers.email || "",
          placeholder: "name@example.com",
          oninput: event => setContactPart("email", event.target.value)
        })
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Телефон"]),
        el("input", {
          class: "input",
          type: "tel",
          value: state.answers.phone || "",
          placeholder: "+7 999 000-00-00",
          oninput: event => setContactPart("phone", event.target.value)
        })
      ])
    ]);
  }
  if (q.type === "text") {
    return el("input", {
      class: "input",
      value: value || "",
      placeholder: q.placeholder || "",
      oninput: event => {
        state.answers[q.id] = event.target.value;
        updateCurrentActionState();
      }
    });
  }
  if (q.type === "textarea") {
    return el("div", { class: "textarea-wrap" }, [
      el("textarea", {
        class: "textarea",
        maxlength: q.max,
        placeholder: "Коротко, по делу. Достаточно 4-6 строк.",
        oninput: event => {
          state.answers[q.id] = event.target.value;
          const counter = document.querySelector(`[data-counter="${q.id}"]`);
          if (counter) counter.textContent = `${event.target.value.length}/${q.max}`;
          updateCurrentActionState();
        }
      }, [value || ""]),
      el("span", { class: "counter", "data-counter": q.id }, [`${String(value || "").length}/${q.max}`])
    ]);
  }
  if (q.type === "expectations") {
    return el("div", { class: "expectations-grid" }, [
      el("div", { class: "mini-field" }, [
        el("h3", {}, ["Что для вас ближе всего в работе?"]),
        el("p", { class: "mini-hint" }, ["Выберите до 3 вариантов."]),
        el("div", { class: "choice-grid compact" }, Object.entries(labels.workValues).map(([key, label]) => {
          const checked = state.answers.workValues.includes(key);
          return el("label", { class: `choice ${checked ? "selected" : ""}` }, [
            el("input", {
              type: "checkbox",
              checked: checked ? "checked" : null,
              onchange: event => setAnswer("workValues", key, event.target.checked, 3)
            }),
            el("span", { html: checked ? icon("check") : "" }),
            el("strong", {}, [label])
          ]);
        }))
      ]),
      el("div", { class: "mini-field" }, [
        el("h3", {}, ["Формат работы"]),
        el("div", { class: "choice-grid compact" }, Object.entries(labels.workFormat).map(([key, label]) => {
          const checked = state.answers.workFormat.includes(key);
          return el("label", { class: `choice ${checked ? "selected" : ""}` }, [
            el("input", {
              type: "checkbox",
              checked: checked ? "checked" : null,
              onchange: event => setAnswer("workFormat", key, event.target.checked)
            }),
            el("span", { html: checked ? icon("check") : "" }),
            el("strong", {}, [label])
          ]);
        }))
      ]),
      el("div", { class: "mini-field" }, [
        el("h3", {}, ["Ожидания по доходу"]),
        el("input", {
          class: "input",
          value: state.answers.income || "",
          placeholder: "Например: 120 000 руб.",
          oninput: event => {
            state.answers.income = event.target.value;
            updateCurrentActionState();
          }
        })
      ]),
      el("div", { class: "mini-field" }, [
        el("h3", {}, ["Когда готовы выйти?"]),
        el("div", { class: "choice-list compact" }, Object.entries(labels.availability).map(([key, label]) => {
          const checked = state.answers.availability === key;
          return el("label", { class: `choice ${checked ? "selected" : ""}` }, [
            el("input", {
              type: "radio",
              name: "availability",
              checked: checked ? "checked" : null,
              onchange: event => setAnswer("availability", key, event.target.checked)
            }),
            el("span", { html: checked ? icon("check") : "" }),
            el("strong", {}, [label])
          ]);
        }))
      ])
    ]);
  }
  const choices = Object.entries(labels[q.id] || {});
  return el("div", { class: q.type === "checkbox" ? "choice-grid" : "choice-list" }, choices.map(([key, label]) => {
    const checked = Array.isArray(value) ? value.includes(key) : value === key;
    return el("label", { class: `choice ${checked ? "selected" : ""}` }, [
      el("input", {
        type: q.type,
        name: q.id,
        value: key,
        checked: checked ? "checked" : null,
        onchange: event => setAnswer(q.id, key, event.target.checked, q.maxPick)
      }),
      el("span", { html: checked ? icon("check") : "" }),
      el("strong", {}, [label])
    ]);
  }));
}

function candidateView() {
  if (!state.config) {
    return el("main", { class: "thanks" }, [
      el("div", { class: "loading-inline" }, ["Загрузка анкеты..."])
    ]);
  }
  if (!state.hasStarted) return welcomeView();
  const q = questions[state.currentStep];
  const stepNumber = state.currentStep + 1;
  if (!state.trackedSteps.has(stepNumber)) {
    state.trackedSteps.add(stepNumber);
    setTimeout(() => trackEvent("question_view", stepNumber), 0);
  }
  const isLast = state.currentStep === questions.length - 1;
  const hint = q.maxPick ? `Можно выбрать до ${q.maxPick} вариантов.` : chatHint(q);
  const guide = guideForQuestion(state.currentStep, q);
  return el("main", { class: "chat-shell" }, [
    el("section", { class: "chat-top" }, [
      el("a", { class: "brand", href: "#candidate" }, [iconEl("spark"), "HR Screening"]),
      brandMark()
    ]),
    el("form", { class: "chat-stage", onsubmit: submitCandidate }, [
      el("aside", { class: "guide-panel" }, [
        el("img", { src: guide.image, alt: "SMM guide", class: "guide-character" }),
        el("div", { class: "guide-caption" }, [
          el("span", {}, [guide.caption])
        ])
      ]),
      el("section", { class: "chat-card" }, [
        el("div", { class: "message assistant" }, [
          el("img", { src: "/assets/smm-guide-character.png", alt: "", class: "avatar" }),
          el("div", { class: "bubble" }, [
            el("span", { class: "question-count" }, [`Вопрос ${currentQuestionNumber()} из ${questions.length}`]),
            el("h2", {}, [q.title]),
            hint ? el("p", {}, [hint]) : el("div")
          ])
        ]),
        el("div", { class: "answer-area" }, [field(q)]),
        el("div", { class: "form-actions chat-actions" }, [
          el("button", { class: "btn ghost", type: "button", onclick: () => {
            if (state.currentStep === 0) {
              state.hasStarted = false;
            } else {
              state.currentStep--;
            }
            render();
          } }, ["Назад"]),
          el("button", { class: "btn primary", "data-current-action": "next", disabled: validateStep() ? null : "disabled", type: isLast ? "submit" : "button", onclick: event => {
            if (!isLast) {
              event.preventDefault();
              if (!validateStep()) {
                showToast("Заполните обязательный вопрос.");
                return;
              }
              state.currentStep++;
              window.scrollTo({ top: 0, behavior: "smooth" });
              render();
            }
          } }, [isLast ? "Отправить анкету" : "Дальше", iconEl("arrow")])
        ])
      ])
    ]),
    siteFooter()
  ]);
}

function chatHint(q) {
  if (q.type === "textarea") return "Коротко, по делу. Нам важна логика, а не идеальный текст.";
  if (q.type === "namePair") return "Заполните два поля, чтобы HR мог корректно связаться с вами.";
  if (q.type === "contactPair") return "Укажите email и номер телефона. Другие контакты на этом этапе не нужны.";
  if (q.id === "portfolio") return "";
  if (q.type === "text") return "Заполните поле, чтобы HR мог корректно связаться с вами и посмотреть опыт.";
  if (q.type === "expectations") return "Это не влияет на профессиональный балл, но помогает HR понять операционные условия.";
  return "Выберите вариант, который ближе всего к вашему реальному опыту.";
}

function welcomeView() {
  const canStart = state.consents.privacy && state.consents.dataProcessing;
  return el("main", { class: "welcome-shell" }, [
    brandMark(),
    el("section", { class: "welcome-card" }, [
      el("div", { class: "welcome-copy" }, [
        el("div", { class: "soft-label mint" }, ["SMM-manager screening"]),
        el("h1", {}, ["Привет! Давайте познакомимся"]),
        el("p", { class: "lead" }, ["Мы рады, что вы заинтересовались вакансией SMM-менеджера. Ответьте на несколько вопросов, чтобы мы быстрее поняли ваш опыт, подход к работе и соответствие роли."]),
        el("p", { class: "sublead" }, ["Анкета займет около 7-10 минут. Большинство вопросов с выбором ответа, а открытых вопросов всего два."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill blue" }, ["20 вопросов"]),
          el("span", { class: "pill green" }, ["7-10 минут"]),
          el("span", { class: "pill yellow" }, ["по делу"])
        ]),
        el("div", { class: "consent-action-panel" }, [
          el("div", { class: "consent-box" }, [
            consentRow("privacy"),
            consentRow("dataProcessing")
          ]),
          el("button", { class: "btn primary start-btn", disabled: canStart ? null : "disabled", onclick: () => {
            if (!canStart) {
              showToast("Нужно отметить оба согласия.");
              return;
            }
            trackEvent("start");
            state.hasStarted = true;
            render();
          } }, ["Поехали", iconEl("arrow")])
        ])
      ]),
      el("div", { class: "welcome-visual" }, [
        el("img", { src: "/assets/smm-guide-character.png", alt: "Помощник анкеты SMM", class: "welcome-character" }),
        el("div", { class: "speech-card" }, ["Я Саша. Помогу вам пройти анкету и ответить на наши вопросы."])
      ])
    ]),
    siteFooter()
  ]);
}

function legalLink(href, text) {
  return el("a", {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    onclick: event => event.stopPropagation()
  }, [text]);
}

function consentRow(id) {
  const checked = state.consents[id];
  const text = id === "privacy"
    ? ["Я согласен(на) с ", legalLink("/privacy", "политикой конфиденциальности"), "."]
    : ["Я даю ", legalLink("/personal-data-consent", "согласие на обработку персональных данных"), " и ответов анкеты для первичного HR-отбора."];
  return el("label", { class: `consent-row ${checked ? "selected" : ""}` }, [
    el("input", { type: "checkbox", checked: checked ? "checked" : null, onchange: event => setConsent(id, event.target.checked) }),
    el("span", { html: checked ? icon("check") : "" }),
    el("strong", {}, text)
  ]);
}

async function submitCandidate(event) {
  event.preventDefault();
  if (!validateStep()) {
    showToast("Заполните обязательный вопрос.");
    return;
  }
  const requiredMissed = questions.find(q => !stepComplete(q));
  if (requiredMissed) {
    state.currentStep = questions.indexOf(requiredMissed);
    render();
    showToast("Заполните обязательные поля.");
    return;
  }
  state.loading = true;
  render();
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: state.answers,
      consents: {
        privacy: state.consents.privacy,
        dataProcessing: state.consents.dataProcessing,
        versions: LEGAL_VERSION
      }
    })
  });
  state.loading = false;
  if (!response.ok) {
    showToast("Не удалось отправить анкету. Попробуйте еще раз.");
    render();
    return;
  }
  const result = await response.json();
  trackEvent("completed");
  state.completedSubmission = result;
  document.querySelector("#app").replaceChildren(thankYouView(result));
}

function thankYouView(result) {
  if (result.nextStep?.testAssignmentEligible) return testInviteView(result);
  return softDeclineView(result);
}

function testInviteView(result) {
  return el("main", { class: "final-shell" }, [
    brandMark(),
    el("section", { class: "final-card" }, [
      el("div", { class: "final-copy" }, [
        el("div", { class: "soft-label yellow" }, ["Анкета отправлена"]),
        el("h1", {}, ["Отлично, идем дальше"]),
        el("p", { class: "lead" }, ["Спасибо за ответы. По итогам анкеты видно, что ваш опыт может быть близок к нашей роли, поэтому предлагаем следующий небольшой шаг — показать себя в деле."]),
        el("p", { class: "sublead" }, ["Это не большое тестовое на полдня, а короткое практическое задание, чтобы мы увидели ваш подход к SMM-мышлению, аналитике и гипотезам."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill green" }, ["ответы сохранены"]),
          el("span", { class: "pill blue" }, ["порог пройден"]),
          el("span", { class: "pill yellow" }, ["следующий шаг — практика"])
        ]),
        el("div", { class: `status-pill ${result.recommendation.code}` }, [`Статус в системе: ${result.recommendation.label}`]),
        el("a", { class: "btn primary final-done", href: result.nextStep.testAssignmentUrl }, ["Показать себя в деле", iconEl("arrow")])
      ]),
      el("aside", { class: "final-visual" }, [
        el("img", { src: "/assets/sasha-thumbs-up.png?v=1", alt: "SMM-гид благодарит кандидата" }),
        el("div", { class: "speech-card" }, ["Класс! Анкета выглядит сильной. Давайте посмотрим, как вы думаете на практике."])
      ])
    ]),
    siteFooter()
  ]);
}

function softDeclineView(result) {
  return el("main", { class: "final-shell" }, [
    brandMark(),
    el("section", { class: "final-card decline-card" }, [
      el("div", { class: "final-copy" }, [
        el("div", { class: "soft-label yellow" }, ["Анкета отправлена"]),
        el("h1", {}, ["Спасибо за ваш отклик"]),
        el("p", { class: "lead" }, ["Мы внимательно приняли ваши ответы. Вы можете быть классным человеком и сильным специалистом, но по текущей роли мы, кажется, немного разные: сейчас нам нужен профиль с другим сочетанием опыта, аналитики и самостоятельности в SMM."]),
        el("p", { class: "sublead" }, ["Желаем вам найти команду, где ваши сильные стороны раскроются максимально ярко. Пусть впереди будет больше интересных проектов, творческих задач и профессионального роста."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill blue" }, ["ответы сохранены"]),
          el("span", { class: "pill yellow" }, ["решение по первому этапу"]),
          el("span", { class: "pill green" }, ["спасибо за время"])
        ]),
        el("div", { class: `status-pill ${result.recommendation.code}` }, [`Статус в системе: ${result.recommendation.label}`])
      ]),
      el("aside", { class: "final-visual" }, [
        el("img", { src: "/assets/poses/sasha-q01.png?v=1", alt: "SMM-гид прощается с кандидатом" }),
        el("div", { class: "speech-card" }, ["Спасибо, что прошли анкету. Удачи вам и больших творческих побед!"])
      ])
    ]),
    siteFooter()
  ]);
}

function testAssignmentView() {
  const id = state.route.replace("#test/", "");
  return el("main", { class: "final-shell test-shell" }, [
    brandMark(),
    el("section", { class: "test-card" }, [
      el("header", { class: "test-head" }, [
        el("div", {}, [
          el("div", { class: "soft-label mint" }, ["Практическое задание"]),
          el("h1", {}, ["Показать себя в деле"]),
          el("p", { class: "lead" }, ["По итогам анкетирования мы видим, что можем попробовать поработать вместе. До личного знакомства предлагаем небольшой практический шаг: посмотреть на реальный SMM-профиль и показать, как вы думаете, анализируете и предлагаете улучшения."])
        ]),
        el("img", { src: "/assets/sasha-thumbs-up.png?v=1", alt: "Саша поддерживает кандидата" })
      ]),
      el("section", { class: "task-panel" }, [
        el("h2", {}, ["Что нужно сделать"]),
        el("p", {}, ["Подготовьте Google Документ с коротким аудитом Instagram-профиля: ", el("a", { href: "https://www.instagram.com/mednikova.promanagement/", target: "_blank", rel: "noopener noreferrer" }, ["@mednikova.promanagement"]), "."]),
        el("ol", {}, [
          el("li", {}, ["Опишите первое впечатление: что понятно сразу, а что вызывает вопросы."]),
          el("li", {}, ["Найдите 3 сильные стороны профиля с точки зрения SMM."]),
          el("li", {}, ["Найдите 3 зоны роста: упаковка, контент, визуал, stories, закрепы, CTA или путь к заявке."]),
          el("li", {}, ["Предложите 5 конкретных гипотез улучшения на ближайшие 2 недели."]),
          el("li", {}, ["Предложите 3-5 контент-единиц: пост, Reels, stories, Telegram-адаптация или другой формат."]),
          el("li", {}, ["Укажите метрики, по которым вы бы проверяли результат."])
        ]),
        el("p", { class: "sublead" }, ["Сделайте документ открытым по ссылке для просмотра. Объем: 1-3 страницы, без длинной презентации. Важна логика, конкретика и аккуратная структура."])
      ]),
      el("section", { class: "task-submit" }, [
        el("label", { class: "named-input" }, [
          el("span", {}, ["Ссылка на Google Документ"]),
          el("input", {
            class: "input",
            value: state.testLink,
            placeholder: "https://docs.google.com/...",
            oninput: event => { state.testLink = event.target.value; }
          })
        ]),
        el("button", { class: "btn primary", onclick: () => submitTestAssignment(id) }, ["Отправить ссылку", iconEl("arrow")]),
        state.testSubmitted ? el("p", { class: "success-note" }, ["Ссылка сохранена. Спасибо! HR увидит тестовое в вашей карточке."]) : el("div")
      ])
    ]),
    siteFooter()
  ]);
}

async function submitTestAssignment(id) {
  const response = await fetch(`/api/submissions/${id}/test-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testLink: state.testLink })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить ссылку." }));
    showToast(error.error || "Не удалось сохранить ссылку.");
    return;
  }
  state.testSubmitted = true;
  showToast("Ссылка на тестовое сохранена.");
  render();
}

async function loadAdmin() {
  const [subs, analytics] = await Promise.all([
    fetch("/api/admin/submissions"),
    fetch("/api/admin/analytics")
  ]);
  if (subs.status === 401 || analytics.status === 401) return false;
  state.submissions = (await subs.json()).submissions;
  state.analytics = (await analytics.json()).analytics;
  return true;
}

async function ensureAdminLoaded() {
  if (!state.user) return;
  if (!state.analytics) {
    state.loading = true;
    render();
    await loadAdmin();
    state.loading = false;
    render();
  }
}

function loginView() {
  let username = "admin";
  let password = "";
  return el("main", { class: "login-shell" }, [
    el("section", { class: "login-card" }, [
      el("div", { class: "badge" }, [iconEl("user"), "Admin"]),
      el("h1", {}, ["HR-кабинет"]),
      el("p", {}, ["Введите логин и пароль администратора. Сессия хранится в защищенной HttpOnly-cookie."]),
      el("input", { class: "input", type: "text", value: username, placeholder: "Логин", oninput: event => { username = event.target.value; } }),
      el("input", { class: "input", type: "password", placeholder: "Пароль", oninput: event => { password = event.target.value; } }),
      el("button", { class: "btn primary wide", onclick: async () => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
          showToast("Неверный пароль.");
          return;
        }
        const data = await response.json();
        state.user = data.user;
        localStorage.setItem(ADMIN_USER_KEY, data.user.username);
        await loadAdmin();
        render();
      } }, ["Войти", iconEl("arrow")])
    ])
  ]);
}

function kpi(label, value, tone = "") {
  return el("div", { class: `kpi ${tone}` }, [
    el("span", {}, [label]),
    el("strong", {}, [String(value)])
  ]);
}

function adminNavButton(section, label, iconName) {
  return el("button", {
    class: `btn ghost ${state.adminSection === section ? "active" : ""}`,
    onclick: () => {
      state.adminSection = section;
      render();
    }
  }, [iconEl(iconName), label]);
}

function statusBar(analytics) {
  const total = Math.max(analytics.total, 1);
  const parts = ["green", "yellow", "orange", "red"].map(code => {
    const count = analytics.statusCounts[code] || 0;
    return el("span", { class: code, style: `width:${(count / total) * 100}%` });
  });
  return el("div", { class: "status-bar" }, parts);
}

function candidateRow(item) {
  return el("button", { class: "candidate-row", onclick: () => openSubmission(item.id) }, [
    el("div", {}, [
      el("strong", {}, [item.candidate.fullName || "Без имени"]),
      el("span", {}, [new Date(item.submittedAt).toLocaleString("ru-RU")])
    ]),
    el("div", { class: `score-badge ${item.recommendation.code}` }, [`${item.score.total}`]),
    el("div", { class: `status-pill ${item.recommendation.code}` }, [item.recommendation.label]),
    el("span", { class: "row-icon", html: icon("eye") })
  ]);
}

async function openSubmission(id) {
  const response = await fetch(`/api/admin/submissions/${id}`);
  if (!response.ok) return showToast("Не удалось открыть карточку.");
  state.selected = (await response.json()).submission;
  render();
}

async function runAiInsights() {
  state.loading = true;
  render();
  const response = await fetch("/api/admin/ai-insights", { method: "POST" });
  state.loading = false;
  if (!response.ok) return showToast("AI-анализ не запустился.");
  state.aiInsights = (await response.json()).insights;
  render();
}

function analyticsList(title, items, field) {
  return el("div", { class: "mini-panel" }, [
    el("h3", {}, [title]),
    ...(items.length ? items.map(item => el("div", { class: "rank-row" }, [
      el("span", {}, [optionLabel(field, item.key)]),
      el("strong", {}, [String(item.count)])
    ])) : [el("p", { class: "muted" }, ["Данных пока нет."])])
  ]);
}

function percentage(value) {
  return `${Number(value || 0)}%`;
}

function barRow(label, value, max, tone = "") {
  const width = max ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return el("div", { class: "bar-row" }, [
    el("div", { class: "bar-label" }, [
      el("span", {}, [label]),
      el("strong", {}, [String(value)])
    ]),
    el("div", { class: "bar-track" }, [
      el("span", { class: tone, style: `width:${width}%` })
    ])
  ]);
}

function funnelPanel(analytics) {
  const funnel = analytics.funnel || { visitors: 0, started: 0, reachedLastQuestion: 0, completed: 0 };
  const max = Math.max(funnel.visitors, funnel.started, funnel.reachedLastQuestion, funnel.completed, 1);
  return el("section", { class: "chart-panel wide" }, [
    el("div", { class: "panel-head" }, [
      el("h2", {}, ["Воронка прохождения"]),
      el("span", {}, ["посещения, старт, последний вопрос, отправка"])
    ]),
    barRow("Зашли на анкету", funnel.visitors, max, "blue"),
    barRow("Начали проходить", funnel.started, max, "mint"),
    barRow("Дошли до последнего вопроса", funnel.reachedLastQuestion, max, "yellow"),
    barRow("Отправили анкету", funnel.completed, max, "green"),
    el("div", { class: "conversion-grid" }, [
      kpi("Старт из входа", percentage(funnel.visitToStart)),
      kpi("Доходимость от старта", percentage(funnel.startToComplete), "green"),
      kpi("Конверсия вход → анкета", percentage(funnel.visitToComplete), "yellow")
    ])
  ]);
}

function statusChart(analytics) {
  const total = Math.max(analytics.total || 0, 1);
  const rows = [
    ["Green", analytics.statusCounts?.green || 0, "green"],
    ["Yellow", analytics.statusCounts?.yellow || 0, "yellow"],
    ["Orange", analytics.statusCounts?.orange || 0, "orange"],
    ["Red", analytics.statusCounts?.red || 0, "red"]
  ];
  return el("section", { class: "chart-panel" }, [
    el("div", { class: "panel-head" }, [
      el("h2", {}, ["Качество потока"]),
      el("span", {}, [`Всего анкет: ${analytics.total || 0}`])
    ]),
    ...rows.map(([label, count, tone]) => barRow(label, count, total, tone)),
    el("div", { class: "conversion-grid two" }, [
      kpi("Средний балл", `${analytics.avgScore || 0}/100`),
      kpi("Стоп-факторов на кандидата", analytics.avgFlags || 0, "red")
    ])
  ]);
}

function blockChart(analytics) {
  const blocks = analytics.avgBlocks || {};
  const labelsByBlock = {
    portfolio: "Портфолио",
    experience: "Опыт",
    responsibilities: "Ответственность",
    contentCase: "Мини-кейс",
    tools: "Инструменты",
    analytics: "Аналитика",
    culture: "Культура"
  };
  const values = Object.entries(labelsByBlock).map(([key, label]) => [label, blocks[key] || 0]);
  const max = Math.max(...values.map(item => item[1]), 1);
  return el("section", { class: "chart-panel" }, [
    el("div", { class: "panel-head" }, [
      el("h2", {}, ["Средние баллы по блокам"]),
      el("span", {}, ["показывает слабые места потока"])
    ]),
    ...values.map(([label, value]) => barRow(label, value, max, "blue"))
  ]);
}

function questionDropoffChart(analytics) {
  const views = analytics.funnel?.questionViews || [];
  const max = Math.max(...views.map(item => item.count), 1);
  return el("section", { class: "chart-panel wide" }, [
    el("div", { class: "panel-head" }, [
      el("h2", {}, ["Просмотры вопросов"]),
      el("span", {}, ["где люди потенциально отваливаются"])
    ]),
    el("div", { class: "question-bars" }, views.map(item => el("div", { class: "question-bar" }, [
      el("span", { style: `height:${max ? Math.max(8, Math.round((item.count / max) * 100)) : 0}%` }),
      el("strong", {}, [String(item.step)]),
      el("em", {}, [String(item.count)])
    ])))
  ]);
}

function analyticsDashboardView(analytics) {
  return el("section", { class: "analytics-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("chart"), "Аналитика воронки"]),
        el("h1", {}, ["Визуальная аналитика"]),
        el("p", {}, ["Здесь видно, сколько кандидатов заходит, где они доходят до конца и какого качества получается поток."])
      ]),
      el("button", { class: "btn primary", onclick: runAiInsights }, [iconEl("spark"), "AI-выводы"])
    ]),
    el("div", { class: "analytics-grid" }, [
      funnelPanel(analytics),
      statusChart(analytics),
      blockChart(analytics),
      questionDropoffChart(analytics),
      analyticsList("Типы проектов", analytics.topProjectTypes || [], "projectTypes"),
      analyticsList("Инструменты", analytics.topTools || [], "tools"),
      analyticsList("Метрики", analytics.topMetrics || [], "metrics"),
      el("section", { class: "insight-panel chart-panel" }, [
        el("h2", {}, ["Выводы"]),
        ...(analytics.recommendations || []).map(text => el("p", {}, [text])),
        state.aiInsights ? el("div", { class: "ai-box" }, [
          el("span", { class: "mode" }, [state.aiInsights.mode === "yandex" ? "YandexGPT" : state.aiInsights.mode === "ai" ? "OpenAI" : "Локальная аналитика"]),
          el("strong", {}, [state.aiInsights.summary || ""]),
          ...(state.aiInsights.recommendations || []).map(text => el("p", {}, [text])),
          ...(state.aiInsights.interviewFocus || []).map(text => el("p", {}, [`Интервью: ${text}`])),
          ...(state.aiInsights.risks || []).map(text => el("p", { class: "risk-text" }, [text]))
        ]) : el("p", { class: "muted" }, ["Нажмите AI-выводы, чтобы получить интерпретацию потока через YandexGPT."])
      ])
    ])
  ]);
}

async function saveConfig() {
  let parsed;
  try {
    parsed = JSON.parse(state.configText);
  } catch {
    showToast("JSON методологии содержит ошибку.");
    return;
  }
  const response = await fetch("/api/admin/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config: parsed })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить методологию." }));
    showToast(error.error || "Не удалось сохранить методологию.");
    return;
  }
  const data = await response.json();
  applyConfig(data.config);
  state.configOpen = false;
  showToast("Методология сохранена.");
  render();
}

function configPanel() {
  return el("section", { class: "config-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Методология анкеты"]),
        el("span", {}, ["Вопросы, варианты, баллы, лимиты и пороги хранятся в SQLite."])
      ]),
      el("div", { class: "top-actions" }, [
        el("button", { class: "btn ghost", onclick: () => {
          state.configText = JSON.stringify(state.config, null, 2);
          render();
        } }, ["Отменить"]),
        el("button", { class: "btn primary", onclick: saveConfig }, ["Сохранить"])
      ])
    ]),
    el("textarea", {
      class: "config-editor",
      spellcheck: "false",
      oninput: event => { state.configText = event.target.value; }
    }, [state.configText])
  ]);
}

function adminView() {
  if (!state.user) return loginView();
  ensureAdminLoaded();
  const analytics = state.analytics || { total: 0, avgScore: 0, statusCounts: {}, recommendations: [], topProjectTypes: [], topTools: [], topMetrics: [], summary: "" };
  const selected = state.selected;
  return el("main", { class: "admin-shell" }, [
    el("nav", { class: "topbar" }, [
      el("a", { class: "brand", href: "#candidate" }, [iconEl("chart"), "HR Screening"]),
      el("div", { class: "top-actions" }, [
        adminNavButton("candidates", "Кандидаты", "list"),
        adminNavButton("analytics", "Аналитика", "chart"),
        el("button", { class: "btn ghost", onclick: async () => { await loadAdmin(); render(); } }, ["Обновить"]),
        el("button", { class: "btn ghost", onclick: () => { state.configOpen = !state.configOpen; render(); } }, ["Методология"]),
        el("button", { class: "btn danger", onclick: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          localStorage.removeItem(ADMIN_USER_KEY);
          state.user = null;
          state.analytics = null;
          render();
        } }, ["Выйти"])
      ])
    ]),
    state.configOpen ? configPanel() : el("div"),
    state.adminSection === "analytics" ? analyticsDashboardView(analytics) : el("section", { class: "dashboard-grid" }, [
      el("div", { class: "dashboard-main" }, [
        el("header", { class: "dash-header" }, [
          el("div", {}, [
            el("div", { class: "badge" }, [iconEl("filter"), "Воронка подбора"]),
            el("h1", {}, ["Дашборд кандидатов"]),
            el("p", {}, [analytics.summary || "Загрузка..."])
          ]),
          el("button", { class: "btn primary", onclick: runAiInsights }, [iconEl("spark"), "AI-анализ потока"])
        ]),
        el("div", { class: "kpi-grid" }, [
          kpi("Анкет", analytics.total),
          kpi("Средний балл", `${analytics.avgScore}/100`),
          kpi("Green", analytics.statusCounts.green || 0, "green"),
          kpi("Yellow", analytics.statusCounts.yellow || 0, "yellow")
        ]),
        statusBar(analytics),
        el("section", { class: "table-panel" }, [
          el("div", { class: "panel-head" }, [el("h2", {}, ["Кандидаты"]), el("span", {}, ["Нажмите на строку, чтобы открыть профиль"])]),
          ...(state.submissions.length ? state.submissions.map(candidateRow) : [el("div", { class: "empty" }, ["Пока нет заполненных анкет. Отправьте кандидату ссылку на главную страницу."])])
        ])
      ]),
      el("aside", { class: "dashboard-side" }, [
        el("section", { class: "insight-panel" }, [
          el("h2", {}, ["Рекомендации"]),
          ...(analytics.recommendations || []).map(text => el("p", {}, [text])),
          state.aiInsights ? el("div", { class: "ai-box" }, [
            el("span", { class: "mode" }, [state.aiInsights.mode === "yandex" ? "YandexGPT" : state.aiInsights.mode === "ai" ? "OpenAI" : "Локальная аналитика"]),
            el("strong", {}, [state.aiInsights.summary || ""]),
            ...(state.aiInsights.recommendations || []).map(text => el("p", {}, [text])),
            ...(state.aiInsights.risks || []).map(text => el("p", { class: "risk-text" }, [text]))
          ]) : el("p", { class: "muted" }, ["AI-блок подключен через YandexGPT. Нажмите AI-анализ потока, чтобы получить выводы."])
        ]),
        analyticsList("Типы проектов", analytics.topProjectTypes || [], "projectTypes"),
        analyticsList("Инструменты", analytics.topTools || [], "tools"),
        analyticsList("Метрики", analytics.topMetrics || [], "metrics")
      ])
    ]),
    selected ? profileDrawer(selected) : el("div")
  ]);
}

function answerLine(title, value) {
  return el("div", { class: "answer-line" }, [el("span", {}, [title]), el("strong", {}, [value || "—"])]);
}

function profileDrawer(item) {
  return el("div", { class: "drawer-backdrop", onclick: event => { if (event.target.className === "drawer-backdrop") { state.selected = null; render(); } } }, [
    el("aside", { class: "drawer" }, [
      el("button", { class: "close-btn", onclick: () => { state.selected = null; render(); } }, ["×"]),
      el("div", { class: "profile-head" }, [
        el("div", { class: `score-badge big ${item.recommendation.code}` }, [String(item.score.total)]),
        el("div", {}, [
          el("h2", {}, [item.candidate.fullName || "Без имени"]),
          el("p", {}, [item.candidate.contacts || "Контакты не указаны"]),
          el("div", { class: `status-pill ${item.recommendation.code}` }, [`${item.recommendation.label} — ${item.recommendation.status}`])
        ])
      ]),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Рекомендация HR"]),
        el("p", {}, [item.hrNote]),
        el("h3", {}, ["Сильные стороны"]),
        el("ul", {}, item.strengths.map(text => el("li", {}, [text]))),
        el("h3", {}, ["Риски"]),
        el("ul", {}, item.risks.map(text => el("li", {}, [text]))),
        item.flags.length ? el("div", { class: "flags" }, item.flags.map(flag => el("span", { class: flag.severity }, [flag.title]))) : el("div", { class: "flags ok" }, ["Стоп-факторы не найдены"])
      ]),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Баллы по блокам"]),
        ...Object.entries(item.score.blocks).map(([key, value]) => answerLine(blockName(key), String(value)))
      ]),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Согласия"]),
        answerLine("Политика конфиденциальности", consentText(item.consents?.privacy)),
        answerLine("Обработка персональных данных", consentText(item.consents?.dataProcessing)),
        answerLine("IP", item.consents?.source?.ip),
        answerLine("Браузер", item.consents?.source?.userAgent)
      ]),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Тестовое задание"]),
        answerLine("Выдано", item.testAssignment?.eligible ? "да" : "нет"),
        answerLine("Статус", testAssignmentStatus(item.testAssignment)),
        item.testAssignment?.link
          ? answerLine("Ссылка", item.testAssignment.link)
          : answerLine("Ссылка", "не отправлена")
      ]),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Ответы"]),
        answerLine("Портфолио", item.candidate.portfolio),
        answerLine("Опыт", selectedText("experienceYears", item.answers.experienceYears)),
        answerLine("Проекты", selectedText("projectTypes", item.answers.projectTypes)),
        answerLine("Соцсети", selectedText("socialNetworks", item.answers.socialNetworks)),
        answerLine("Ответственность", selectedText("responsibilities", item.answers.responsibilities)),
        answerLine("Готов делать", selectedText("readiness", item.answers.readiness)),
        answerLine("Инструменты", selectedText("tools", item.answers.tools)),
        answerLine("Метрики", selectedText("metrics", item.answers.metrics)),
        answerLine("Формат", selectedText("workFormat", item.candidate.workFormat)),
        answerLine("Доход", item.candidate.income),
        answerLine("Выход", selectedText("availability", item.candidate.availability)),
        answerLine("Мини-кейс", item.answers.contentCase),
        answerLine("Новое в SMM", item.answers.innovation)
      ])
    ])
  ]);
}

function consentText(consent) {
  if (!consent?.accepted) return "не зафиксировано";
  const date = consent.acceptedAt ? new Date(consent.acceptedAt).toLocaleString("ru-RU") : "дата не указана";
  return `${consent.version || "без версии"}; принято ${date}`;
}

function testAssignmentStatus(testAssignment) {
  if (!testAssignment?.eligible) return "не назначалось";
  if (testAssignment.status === "submitted") return "ссылка получена";
  if (testAssignment.status === "assigned") return "ожидаем выполнение";
  return testAssignment.status || "не назначалось";
}

function blockName(key) {
  return {
    portfolio: "Портфолио",
    experience: "Релевантный опыт",
    responsibilities: "Зона ответственности",
    contentCase: "Мини-кейс",
    tools: "Инструменты",
    analytics: "Аналитика / рост",
    culture: "Культура"
  }[key] || key;
}

function showToast(text) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const node = el("div", { class: "toast" }, [text]);
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

function siteFooter() {
  return el("footer", { class: "site-footer" }, [
    el("div", { class: "footer-main" }, [
      el("strong", {}, [OPERATOR.project]),
      el("span", {}, [`Оператор персональных данных: ${OPERATOR.legalName}`]),
      el("span", {}, [`ИНН ${OPERATOR.inn}`]),
      el("span", {}, [`ОГРНИП ${OPERATOR.ogrnip}`]),
      el("span", {}, [`Адрес: ${OPERATOR.address}`]),
      el("span", {}, ["Email для обращений по персональным данным: ", el("a", { href: `mailto:${OPERATOR.email}` }, [OPERATOR.email])])
    ]),
    el("nav", { class: "footer-links" }, [
      el("a", { href: "/privacy" }, ["Политика конфиденциальности"]),
      el("a", { href: "/personal-data-consent" }, ["Согласие на обработку персональных данных"])
    ])
  ]);
}

function legalPage(kind) {
  const isPrivacy = kind === "privacy";
  const title = isPrivacy
    ? "Политика конфиденциальности"
    : "Согласие на обработку персональных данных";
  const version = isPrivacy ? LEGAL_VERSION.privacy : LEGAL_VERSION.personalDataConsent;
  const sections = isPrivacy ? privacySections() : consentSections();
  return el("main", { class: "legal-shell" }, [
    el("section", { class: "legal-top" }, [
      el("a", { class: "brand", href: "/" }, [iconEl("spark"), "HR Screening"]),
      brandMark()
    ]),
    el("article", { class: "legal-card" }, [
      el("div", { class: "soft-label yellow" }, [`Версия: ${version}`]),
      el("h1", {}, [title]),
      el("p", { class: "legal-note" }, [`Документ действует для HR-анкеты проекта ${OPERATOR.project}. По вопросам обработки персональных данных и отзыва согласия: ${OPERATOR.email}.`]),
      ...sections.map(section => el("section", { class: "legal-section" }, [
        el("h2", {}, [section.title]),
        ...section.items.map(item => Array.isArray(item)
          ? el("ul", {}, item.map(text => el("li", {}, [text])))
          : el("p", {}, [item]))
      ])),
      el("div", { class: "legal-actions" }, [
        el("a", { class: "btn ghost", href: "/" }, ["Вернуться к анкете"])
      ])
    ]),
    siteFooter()
  ]);
}

function privacySections() {
  return [
    {
      title: "1. Оператор и область применения",
      items: [
        `Настоящая Политика определяет порядок обработки персональных данных кандидатов, заполняющих HR-анкету на сайте ${location.origin}.`,
        `Оператор персональных данных: ${OPERATOR.legalName}, ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip}, адрес: ${OPERATOR.address}.`,
        `Проект оператора: ${OPERATOR.project}. Контакт для вопросов по персональным данным и отзыва согласия: ${OPERATOR.email}.`
      ]
    },
    {
      title: "2. Какие персональные данные обрабатываются",
      items: [[
        "имя и фамилия;",
        "email и номер телефона;",
        "ссылка на резюме, портфолио или документ с резюме;",
        "ответы на вопросы анкеты;",
        "результаты автоматизированного скоринга анкеты, рекомендации и риск-факторы, сформированные системой;",
        "технические данные: дата и время отправки, IP-адрес, сведения о браузере и устройстве."
      ]]
    },
    {
      title: "3. Цели и правовые основания обработки",
      items: [
        "Правовыми основаниями обработки являются согласие субъекта персональных данных, действия кандидата по заполнению анкеты, а также законные интересы оператора по организации подбора персонала и обеспечению безопасности сервиса.",
        [
          "первичный HR-отбор кандидатов;",
          "оценка профессионального соответствия роли;",
          "формирование карточки кандидата для HR;",
          "связь с кандидатом по результатам рассмотрения анкеты;",
          "аналитика качества потока кандидатов и корректировка воронки подбора;",
          "обеспечение работы сайта, информационной безопасности и подтверждение факта согласия."
        ]
      ]
    },
    {
      title: "4. Действия с персональными данными",
      items: [[
        "сбор;",
        "запись;",
        "систематизация;",
        "накопление;",
        "хранение;",
        "уточнение и обновление;",
        "использование;",
        "анализ с применением автоматизированной скоринговой методологии;",
        "обезличивание;",
        "блокирование;",
        "удаление и уничтожение."
      ]]
    },
    {
      title: "5. Хранение, доступ и передача",
      items: [
        `Анкеты кандидатов хранятся до ${OPERATOR.dataRetention} с даты отправки анкеты, если кандидат не отозвал согласие раньше и если более длительное хранение не требуется по закону или для защиты прав оператора.`,
        "Данные доступны только уполномоченным пользователям HR-службы, руководителям, участвующим в подборе, и техническим администраторам, которым доступ необходим для сопровождения сервиса.",
        "Персональные данные кандидатов не передаются клиентам и иным третьим лицам для самостоятельного использования.",
        "Для работы сервиса могут использоваться технические поставщики инфраструктуры: хостинг, домен, серверное администрирование, резервное копирование. Такие лица получают доступ только в объеме, необходимом для технического сопровождения.",
        "AI-аналитика потока кандидатов в текущей версии должна выполняться по обезличенным или агрегированным данным без передачи ФИО, email, телефона и ссылок на резюме во внешние AI-сервисы."
      ]
    },
    {
      title: "6. Автоматизированная оценка",
      items: [
        "Анкета использует автоматизированную скоринговую методологию для первичной сортировки ответов и помощи HR-специалисту.",
        "Автоматическая оценка является вспомогательным инструментом и не является единственным основанием для итогового кадрового решения. Финальное решение принимает уполномоченный представитель оператора."
      ]
    },
    {
      title: "7. Права кандидата",
      items: [
        `Кандидат вправе запросить информацию об обработке своих персональных данных, уточнение, блокирование или удаление данных, а также отозвать согласие. Для обращения нужно написать на ${OPERATOR.email}.`,
        "При отзыве согласия оператор прекращает обработку и удаляет данные, если отсутствуют законные основания для дальнейшего хранения."
      ]
    },
    {
      title: "8. Актуализация политики",
      items: [
        "Оператор может обновлять Политику при изменении сервиса, правовых требований или процессов обработки данных.",
        "Версия документа фиксируется в системе вместе с фактом согласия кандидата."
      ]
    }
  ];
}

function consentSections() {
  return [
    {
      title: "1. Согласие субъекта персональных данных",
      items: [
        `Я, кандидат, заполняющий HR-анкету на сайте ${location.origin}, свободно, своей волей и в своем интересе даю согласие оператору персональных данных ${OPERATOR.legalName}, ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip}, адрес: ${OPERATOR.address}, на обработку моих персональных данных.`,
        `Проект оператора: ${OPERATOR.project}. Контакт для отзыва согласия и обращений по персональным данным: ${OPERATOR.email}.`
      ]
    },
    {
      title: "2. Перечень персональных данных",
      items: [[
        "имя и фамилия;",
        "email и номер телефона;",
        "ссылка на резюме, портфолио или документ с резюме;",
        "ответы на вопросы анкеты;",
        "оценочные результаты анкеты, автоматически рассчитанные системой;",
        "дата, время, IP-адрес и сведения о браузере в момент отправки анкеты."
      ]]
    },
    {
      title: "3. Цели обработки",
      items: [[
        "первичный отбор кандидатов на позицию SMM-менеджера;",
        "оценка профессионального соответствия роли;",
        "формирование карточки кандидата для HR-службы;",
        "связь с кандидатом по результатам рассмотрения анкеты;",
        "аналитика качества потока кандидатов и улучшение воронки подбора;",
        "подтверждение факта получения согласия и обеспечение безопасности сервиса."
      ]]
    },
    {
      title: "4. Разрешенные действия с данными",
      items: [[
        "сбор;",
        "запись;",
        "систематизация;",
        "накопление;",
        "хранение;",
        "уточнение;",
        "использование для HR-оценки;",
        "анализ ответов с применением автоматизированной скоринговой методологии;",
        "обезличивание;",
        "блокирование;",
        "удаление и уничтожение."
      ]]
    },
    {
      title: "5. Автоматизированная обработка и AI-аналитика",
      items: [
        "Я уведомлен(а), что ответы анкеты могут обрабатываться с применением автоматизированной скоринговой методологии для первичной оценки соответствия роли.",
        "Автоматическая оценка является вспомогательным инструментом HR-службы и не является единственным основанием для итогового кадрового решения.",
        "Внешние AI-сервисы в текущей версии могут использоваться только для анализа обезличенных или агрегированных данных потока кандидатов без передачи ФИО, email, телефона и ссылок на резюме."
      ]
    },
    {
      title: "6. Передача третьим лицам и доступ",
      items: [
        "Персональные данные кандидата не передаются клиентам и иным третьим лицам для самостоятельного использования.",
        "Доступ к данным может предоставляться уполномоченным сотрудникам HR-службы, руководителям, участвующим в подборе, и техническим администраторам в объеме, необходимом для работы и сопровождения сервиса.",
        "Технические поставщики инфраструктуры могут обрабатывать данные только в объеме, необходимом для хостинга, резервного копирования, защиты и сопровождения сервиса."
      ]
    },
    {
      title: "7. Срок действия и отзыв согласия",
      items: [
        `Согласие действует до достижения целей обработки, но не более ${OPERATOR.dataRetention} с даты отправки анкеты, если более длительное хранение не требуется по закону или для защиты прав оператора.`,
        `Я могу отозвать согласие, направив запрос на ${OPERATOR.email}. После получения отзыва оператор прекращает обработку и удаляет данные, если отсутствуют законные основания для дальнейшего хранения.`
      ]
    }
  ];
}

function render() {
  const app = document.querySelector("#app");
  const route = currentAppRoute();
  if (route === "candidate" && !state.hasStarted) {
    setTimeout(trackLandingOnce, 0);
  }
  const view = route === "admin"
    ? adminView()
    : route === "test-assignment"
      ? testAssignmentView()
    : route === "privacy" || route === "personal-data-consent"
      ? legalPage(route)
      : candidateView();
  app.replaceChildren(view);
  if (state.loading) document.body.append(el("div", { class: "loading" }, ["Загрузка..."]));
  else document.querySelectorAll(".loading").forEach(node => node.remove());
}

async function boot() {
  state.loading = true;
  render();
  try {
    await loadConfig();
    const me = await fetch("/api/auth/me");
    if (me.ok) {
      const data = await me.json();
      state.user = data.user;
      localStorage.setItem(ADMIN_USER_KEY, data.user.username);
      if (state.route === "#admin") await loadAdmin();
    } else {
      localStorage.removeItem(ADMIN_USER_KEY);
    }
  } catch {
    showToast("Не удалось загрузить конфигурацию приложения.");
  } finally {
    state.loading = false;
    render();
  }
}

boot();
