const ADMIN_USER_KEY = "hr_admin_user";
const FUNNEL_SESSION_KEY = "hr_funnel_session";
const FUNNEL_LANDING_KEY = "hr_funnel_landing_tracked";
const APP_CLIENT_VERSION = "2026-06-30-06";
const APP_RELEASE_SEEN_KEY = "hr_seen_release_version";
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
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
const ADMIN_SECTIONS = new Set(["overview", "candidates", "questionnaire", "interview", "analytics", "hiring", "hh", "notifications", "staff", "audit"]);

let labels = {
  experienceYears: {
    less1: "Менее 1 года",
    "1_2": "1-2 года",
    "2_3": "2-3 года",
    "3_5": "3-5 лет",
    more5: "Более 5 лет"
  },
  projectTypes: {
    b2b: "Корпоративные проекты",
    expert: "Экспертные продукты",
    education: "Образовательные проекты",
    consulting: "Консалтинг / услуги",
    premium: "Премиальные продукты",
    b2c: "Проекты для массового потребителя",
    personalBrand: "Личный бренд",
    ecommerce: "Интернет-магазины",
    lifestyle: "Развлекательные проекты",
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
    stories: "Истории / интерактивы",
    reels: "Короткие вертикальные видео",
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
    qualityCheck: "Проверять ссылки, призывы к действию и метки ссылок",
    statistics: "Анализировать статистику",
    growthHypotheses: "Предлагать гипотезы роста",
    competitorsTrends: "Мониторить конкурентов и тренды",
    aiTools: "Работать с ИИ-инструментами",
    onlyPublishing: "Только публиковать материалы"
  },
  tools: {
    canva: "Canva",
    figma: "Figma",
    capcut: "Видеоредактор",
    autopostingServices: "Сервисы автопостинга",
    sheets: "Электронные таблицы",
    projectTools: "Сервисы управления задачами",
    textAi: "Текстовые ИИ",
    visualAi: "ИИ для визуалов",
    socialAnalytics: "Аналитика соцсетей",
    noTools: "Не использую проф. инструменты"
  },
  soloDesign: {
    stories: "Оформить истории",
    carousel: "Сверстать карусель",
    cover: "Сделать обложку",
    banner: "Подготовить баннер",
    resize: "Адаптировать размеры",
    videoCut: "Нарезать короткое видео",
    nothing: "Ничего из перечисленного"
  },
  metrics: {
    reach: "Охваты / показы",
    er: "Уровень вовлеченности",
    saves: "Сохранения / репосты",
    comments: "Комментарии и реакции",
    videoRetention: "Досмотры / удержание",
    clicks: "Переходы",
    follows: "Подписки / отписки",
    leads: "Заявки / лиды",
    ctrUtm: "Кликабельность, метки ссылок и конверсии",
    leadQuality: "Качество лидов",
    noAnalytics: "Не работал(а) с аналитикой"
  },
  noLeadsActions: {
    audienceQuality: "Проверю качество аудитории",
    ctaOffer: "Проверю призыв к действию и предложение",
    userPath: "Проверю путь пользователя",
    funnelConversion: "Проверю конверсии этапов",
    wrongReachTopics: "Найду темы с нецелевым охватом",
    funnelHypotheses: "Предложу гипотезы по воронке",
    morePosts: "Увеличу количество постов",
    notResponsible: "специалист по соцсетям не отвечает за заявки",
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
  { section: "Релевантный опыт", id: "experienceYears", title: "Сколько лет вы работаете с соцсетями?", type: "radio", required: true },
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
  { id: "innovation", title: "Что нового вы внедрили в работе с соцсетями за последние 3-6 месяцев?", type: "textarea", max: 500, required: true },
  { section: "Культура и рабочее поведение", id: "deadlineBehavior", title: "Что вы делаете, если понимаете, что не успеваете к дедлайну?", type: "radio", required: true },
  { id: "weakPlanBehavior", title: "Что вы делаете, если видите, что текущий контент-план не даст результата?", type: "radio", required: true },
  { id: "feedbackBehavior", title: "Как вы реагируете на прямую обратную связь по своей работе?", type: "radio", required: true },
  { section: "Ожидания", id: "workValues", title: "Что для вас ближе всего в работе?", type: "checkbox", maxPick: 3, required: true },
  { id: "workFormat", title: "Какой формат работы вам подходит?", type: "checkbox", required: true },
  { id: "income", title: "Какие у вас ожидания по доходу?", type: "text", required: true, placeholder: "Например: 120 000 руб." },
  { id: "availability", title: "Когда вы готовы выйти?", type: "radio", required: true }
];

const state = {
  route: location.hash || "#candidate",
  activeVacancyCode: vacancyCodeFromPath(),
  vacancies: {},
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
    domains: [],
    projectResponsibilities: [],
    projectTools: [],
    resumeFile: null,
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
  aiActionProposal: null,
  aiActionEditText: "",
  acceptedAiActions: [],
  completedSubmission: null,
  testLink: "",
  testSubmitted: false,
  testRefusalOpen: false,
  testRefusalReason: "",
  testRefused: false,
  testViewedIds: new Set(),
  user: null,
  config: null,
  adminConfigRoot: null,
  integrations: {},
  configText: "",
  questionnaireDraft: null,
  questionnaireDraftVacancyCode: "",
  questionnaireSaving: false,
  adminSection: adminSectionFromHash(),
  adminVacancyCode: adminVacancyCodeFromHash(),
  adminUsers: [],
  auditLogs: [],
  staffPasswordDrafts: {},
  loginUsername: localStorage.getItem(ADMIN_USER_KEY) || "",
  loginPassword: "",
  loginPasswordVisible: false,
  loginError: "",
  hiringRequests: [],
  vacancyOpenings: [],
  hhTexts: [],
  hhPublications: [],
  hhPublicationDrafts: {},
  hhExistingPublicationForm: {
    vacancyCode: "",
    url: "",
    hhVacancyId: ""
  },
  hhStatus: null,
  hhPromotionStatus: null,
  hhImporting: false,
  hhImportResult: null,
  vacancyDuplicateAnalysis: null,
  platformQuestion: "",
  platformAnswer: null,
  platformQuestionLoading: false,
  hhResponses: [],
  bitrixNotifications: null,
  bitrixNotificationDraft: null,
  updateAvailable: false,
  updateVersion: null,
  updateCheckInProgress: false,
  releaseNotesOpen: false,
  releaseNoteIndex: 0,
  candidateListExpanded: false,
  interviewCandidateId: "",
  interviewDrafts: {},
  testManualDrafts: {},
  hrDecisionDrafts: {},
  testSettingsDrafts: {},
  hiringRequestForm: {
    requestType: "start_existing",
    vacancyCode: "",
    title: "",
    reason: "",
    reasonMode: "preset",
    urgency: "normal",
    desiredStartDate: "",
    headcount: 1,
    responsibilities: "",
    expectedResult: "",
    budget: "",
    comment: ""
  },
  openingForm: {
    vacancyCode: "",
    reason: "",
    reasonMode: "preset",
    urgency: "normal",
    desiredStartDate: "",
    headcount: 1,
    recruitmentChannels: ["hh"]
  },
  vacancyWizard: {
    active: false,
    step: "input",
    sourceText: "",
    questions: [],
    answers: {},
    questionIndex: 0,
    draft: null,
    loading: false,
    listening: false
  },
  vacancyReviewPrompt: null,
  staffForm: {
    email: "",
    displayName: "",
    role: "hr",
    password: "",
    vacancyAccess: []
  },
  trackedSteps: new Set(),
  loading: false
};

async function uploadResumeFile(file) {
  if (!file) return;
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}`.toLowerCase() : "";
  if (!allowed.includes(ext)) {
    showToast("Можно прикрепить только PDF, DOC или DOCX.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast("Файл слишком большой. Максимум 8 МБ.");
    return;
  }
  state.loading = true;
  render();
  const formData = new FormData();
  formData.append("resume", file);
  const response = await fetch("/api/uploads/resume", {
    method: "POST",
    body: formData
  });
  state.loading = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось загрузить файл." }));
    showToast(error.error || "Не удалось загрузить файл.");
    render();
    return;
  }
  const data = await response.json();
  state.answers.resumeFile = data.file;
  const resumeQuestion = questions.find(question => question.type === "resumeAttachment");
  if (resumeQuestion && !String(state.answers[resumeQuestion.id] || "").trim()) {
    state.answers[resumeQuestion.id] = data.file.url;
  }
  showToast("Файл резюме прикреплен.");
  render();
}

function vacancyCodeFromPath() {
  const match = location.pathname.match(/^\/v\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : "smm";
}

function adminVacancyCodeFromHash() {
  const match = location.hash.match(/^#admin\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return "smm";
  const first = decodeURIComponent(match[1] || "");
  const second = decodeURIComponent(match[2] || "");
  if (ADMIN_SECTIONS.has(first)) return second || "smm";
  return first || "smm";
}

function adminSectionFromHash() {
  const match = location.hash.match(/^#admin\/([^/]+)/);
  if (!match) return "overview";
  const value = decodeURIComponent(match[1]);
  return ADMIN_SECTIONS.has(value) ? value : "vacancies";
}

function activeVacancy() {
  return state.vacancies[state.activeVacancyCode] || {
    code: state.activeVacancyCode,
    title: state.config?.publicTitle || state.config?.title || "Вакансия",
    adminTitle: state.config?.adminTitle || state.config?.publicTitle || "Вакансия"
  };
}

function vacancyLabel(code = state.activeVacancyCode) {
  const vacancy = state.vacancies[code];
  return vacancy?.adminTitle || vacancy?.title || code;
}

function isOwner() {
  return state.user?.role === "owner";
}

function isHrOrOwner() {
  return state.user?.role === "owner" || state.user?.role === "hr";
}

function canEditQuestionnaire() {
  return isHrOrOwner();
}

function canStartRecruitment() {
  return isHrOrOwner() || state.user?.role === "hiring_manager";
}

function roleLabel(role) {
  if (role === "owner") return "Владелец";
  if (role === "hr") return "HR";
  if (role === "hiring_manager") return "Руководитель-заказчик";
  return role || "—";
}

function questionnaireUrl(code = state.adminVacancyCode || state.activeVacancyCode || "smm") {
  return `${location.origin}/v/${encodeURIComponent(code)}`;
}

async function copyToClipboard(text, successText = "Ссылка скопирована.") {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    showToast(successText);
  } catch {
    showToast("Не удалось скопировать ссылку. Скопируйте ее вручную из поля.");
  }
}

function extractHhVacancyId(value) {
  const text = String(value || "").trim();
  const pathMatch = text.match(/\/vacancy\/(\d+)/i);
  if (pathMatch) return pathMatch[1];
  const queryMatch = text.match(/[?&]vacancy_id=(\d+)/i);
  if (queryMatch) return queryMatch[1];
  return /^\d+$/.test(text) ? text : "";
}

window.addEventListener("hashchange", () => {
  state.route = location.hash || "#candidate";
  if (state.route.startsWith("#admin")) {
    const previousVacancyCode = state.adminVacancyCode;
    state.adminSection = adminSectionFromHash();
    state.adminVacancyCode = adminVacancyCodeFromHash();
    state.analytics = null;
    state.submissions = [];
    state.candidateListExpanded = false;
    if (previousVacancyCode !== state.adminVacancyCode) {
      state.config = null;
      state.questionnaireDraft = null;
      state.questionnaireDraftVacancyCode = "";
    }
  }
  render();
});

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (key === "value" && "value" in node) node.value = value;
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
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    bell: '<path d="M10 21h4"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>'
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
      vacancyCode: state.activeVacancyCode,
      eventType,
      step
    })
  }).catch(() => {});
}

function trackLandingOnce() {
  const key = `${FUNNEL_LANDING_KEY}_${state.activeVacancyCode}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
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
  if (state.config?.guideCaptions?.[q.id]) {
    const pose = String(Math.min(index + 1, 20)).padStart(2, "0");
    return {
      image: `/assets/poses/sasha-q${pose}.png?v=1`,
      caption: state.config.guideCaptions[q.id]
    };
  }
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
    trendFrequency: "Работа с соцсетями быстро меняется, поэтому важно видеть рынок и референсы.",
    innovation: "Расскажите про реальное внедрение, а не просто наблюдение за трендами.",
    deadlineBehavior: "Дедлайны проверяют ответственность и коммуникацию.",
    weakPlanBehavior: "Здесь важна проактивность: заметить проблему и предложить решение.",
    feedbackBehavior: "Обратная связь показывает, как человек растет в работе.",
    workValues: "Сверяем рабочие принципы и то, как вам комфортно взаимодействовать с командой.",
    workFormat: "Уточняем формат, чтобы не тратить время на неподходящие условия.",
    income: "Фиксируем ожидания по доходу до интервью.",
    availability: "Понимаем, когда реально можно планировать выход."
  };
  const pose = String(Math.min(index + 1, 20)).padStart(2, "0");
  return {
    image: `/assets/poses/sasha-q${pose}.png?v=1`,
    caption: captions[q.id] || "Ответьте по вашему реальному опыту."
  };
}

const VALUE_LABEL_OVERRIDES = {
  b2b: "Корпоративные проекты",
  b2c: "Проекты для массового потребителя",
  expert: "Экспертные продукты",
  education: "Образовательные проекты",
  consulting: "Консалтинг / услуги",
  premium: "Премиальные продукты",
  personalBrand: "Личный бренд",
  ecommerce: "Интернет-магазины",
  lifestyle: "Развлекательные проекты",
  reach: "Охваты и показы",
  er: "Уровень вовлеченности",
  saves: "Сохранения и репосты",
  follows: "Подписки и отписки",
  portfolio: "Резюме и портфолио",
  experience: "Релевантный опыт",
  responsibilities: "Зона ответственности",
  contentCase: "Практический мини-кейс",
  practicalCases: "Практические ситуации",
  tools: "Инструменты",
  analytics: "Аналитика и рост",
  culture: "Рабочее поведение",
  green: "сильный кандидат",
  yellow: "ручная проверка",
  orange: "резерв",
  red: "отказ",
  hidden_potential: "скрытый потенциал",
  Green: "сильный кандидат",
  Yellow: "ручная проверка",
  Orange: "резерв",
  Red: "отказ"
};

const FIELD_LABEL_OVERRIDES = {
  projectTypes: {
    b2b: "Корпоративные проекты",
    b2c: "Проекты для массового потребителя",
    ecommerce: "Интернет-магазины",
    lifestyle: "Развлекательные проекты"
  },
  responsibilities: {
    stories: "Истории / интерактивы",
    reels: "Короткие вертикальные видео"
  },
  readiness: {
    qualityCheck: "Проверять ссылки, призывы к действию и метки ссылок"
  },
  tools: {
    capcut: "Видеоредактор",
    sheets: "Электронные таблицы",
    projectTools: "Сервисы управления задачами",
    textAi: "Текстовые ИИ"
  },
  soloDesign: {
    stories: "Оформить истории"
  },
  metrics: {
    er: "Уровень вовлеченности",
    ctrUtm: "Кликабельность, метки ссылок и конверсии"
  },
  noLeadsActions: {
    ctaOffer: "Проверю призыв к действию и предложение",
    notResponsible: "специалист по соцсетям не отвечает за заявки"
  }
};

function optionLabel(field, value) {
  return FIELD_LABEL_OVERRIDES[field]?.[value] || labels[field]?.[value] || VALUE_LABEL_OVERRIDES[value] || value || "—";
}

function selectedText(field, values) {
  const list = Array.isArray(values) ? values : [values];
  return list.filter(Boolean).map(value => optionLabel(field, value)).join(", ") || "—";
}

function recommendationLabel(recommendation = {}) {
  return VALUE_LABEL_OVERRIDES[recommendation.label] || VALUE_LABEL_OVERRIDES[recommendation.code] || recommendation.label || "ручная проверка";
}

function modelModeLabel(mode) {
  if (mode === "local") return "Расчет платформы";
  return "ИИ HR";
}

function aiActionTarget(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("анкет") || lower.includes("опрос") || lower.includes("вопрос")) {
    return {
      title: "Изменение опросника",
      section: "questionnaire",
      editLabel: "Открыть опросник",
      result: "Предложение принято. Откройте редактор опросника, проверьте формулировки и сохраните изменения."
    };
  }
  if (lower.includes("интерв")) {
    return {
      title: "Изменение сценария интервью",
      section: "interview",
      editLabel: "Открыть интервью",
      result: "Предложение принято. Проверьте сценарий интервью и внесите правки перед использованием."
    };
  }
  if (lower.includes("ваканс") || lower.includes("описан") || lower.includes("требован") || lower.includes("доход")) {
    return {
      title: "Изменение описания вакансии",
      section: "hh",
      editLabel: "Открыть публикации",
      result: "Предложение принято. Проверьте текст вакансии перед публикацией или синхронизацией."
    };
  }
  return {
    title: "Рабочая рекомендация",
    section: "analytics",
    editLabel: "Открыть аналитику",
    result: "Предложение принято. Проверьте рекомендацию и назначьте ответственное действие вручную."
  };
}

function openAiActionProposal(text, source = "ai") {
  const action = aiActionTarget(text);
  state.aiActionProposal = {
    id: `ai_action_${Date.now()}`,
    source,
    text,
    ...action
  };
  state.aiActionEditText = text;
  render();
}

function closeAiActionProposal() {
  state.aiActionProposal = null;
  state.aiActionEditText = "";
  render();
}

function acceptAiActionProposal() {
  const proposal = state.aiActionProposal;
  if (!proposal) return;
  state.acceptedAiActions = [
    ...(state.acceptedAiActions || []),
    {
      ...proposal,
      text: state.aiActionEditText || proposal.text,
      acceptedAt: new Date().toISOString()
    }
  ];
  const message = proposal.result || "Предложение принято.";
  closeAiActionProposal();
  showToast(message);
}

function editAiActionProposal() {
  const proposal = state.aiActionProposal;
  if (!proposal) return;
  const nextSection = proposal.section || "analytics";
  state.adminSection = nextSection;
  if (nextSection === "vacancies" || nextSection === "questionnaire") {
    state.questionnaireDraft = null;
    state.questionnaireDraftVacancyCode = "";
  }
  const hash = nextSection === "overview"
    ? "#admin"
    : nextSection === "questionnaire"
      ? `#admin/questionnaire/${encodeURIComponent(state.adminVacancyCode || "smm")}`
      : `#admin/${nextSection}`;
  history.replaceState(null, "", hash);
  closeAiActionProposal();
}

function aiRecommendationItem(text, source = "ai") {
  return el("div", { class: "ai-recommendation-row" }, [
    el("p", {}, [text]),
    el("button", { class: "btn ghost ai-apply-button", onclick: () => openAiActionProposal(text, source) }, ["Применить"])
  ]);
}

function aiRecommendationList(items = [], source = "ai") {
  return el("div", { class: "ai-recommendation-list" }, (
    items.length
      ? items.map(text => aiRecommendationItem(text, source))
      : [el("p", { class: "muted" }, ["Рекомендаций пока нет."])]
  ));
}

function applyConfig(config) {
  state.config = config;
  labels = config.labels || labels;
  questions = config.questions || questions;
  state.activeVacancyCode = config.vacancyCode || state.activeVacancyCode || "smm";
  state.answers.vacancyCode = state.activeVacancyCode;
  state.answers.vacancyMin = config.defaults?.vacancyMin ?? state.answers.vacancyMin;
  state.answers.vacancyMax = config.defaults?.vacancyMax ?? state.answers.vacancyMax;
  state.configText = JSON.stringify(config, null, 2);
}

async function loadConfig() {
  state.activeVacancyCode = vacancyCodeFromPath();
  const response = await fetch(`/api/config?vacancy=${encodeURIComponent(state.activeVacancyCode)}`);
  if (!response.ok) throw new Error("Config load failed");
  const data = await response.json();
  state.vacancies = data.vacancies || {};
  state.integrations = data.integrations || {};
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

function setQuestionRating(id, value) {
  state.answers[id] = value;
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
  return state.route === "#admin" || state.route.startsWith("#admin/") ? "admin" : "candidate";
}

function progress() {
  return Math.round(((state.currentStep + 1) / questions.length) * 100);
}

function currentQuestionNumber() {
  return state.currentStep + 1;
}

function stepComplete(q) {
  if (!q) return false;
  if (q.type === "resumeAttachment") {
    return String(state.answers[q.id] || "").trim().length > 0 || Boolean(state.answers.resumeFile?.url);
  }
  if (q.type === "questionRating") {
    return Number(state.answers[q.id] || 0) > 0;
  }
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
        el("span", {}, ["Электронная почта"]),
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
  if (q.type === "resumeAttachment") {
    return el("div", { class: "resume-upload-field" }, [
      el("input", {
        class: "input",
        value: state.answers[q.id] || "",
        placeholder: q.placeholder || "Ссылка на резюме или профиль",
        oninput: event => {
          state.answers[q.id] = event.target.value;
          updateCurrentActionState();
        }
      }),
      el("div", { class: "resume-upload-actions" }, [
        el("label", { class: "btn ghost resume-upload-button" }, [
          "Прикрепить файл",
          el("input", {
            type: "file",
            accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            onchange: event => uploadResumeFile(event.target.files?.[0])
          })
        ]),
        state.answers.resumeFile
          ? el("div", { class: "resume-file-note" }, [
            el("strong", {}, ["Файл прикреплен: "]),
            el("span", {}, [state.answers.resumeFile.originalName || "резюме"]),
            el("small", {}, [`${formatFileSize(state.answers.resumeFile.size)}`])
          ])
          : el("p", { class: "resume-file-note" }, ["Можно вставить ссылку или прикрепить PDF/DOC/DOCX до 8 МБ."])
      ])
    ]);
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
  if (q.type === "questionRating") {
    const rating = Number(value || 0);
    const tone = rating <= 2 ? "red" : rating <= 4 ? "yellow" : "green";
    return el("div", { class: "question-rating", role: "radiogroup", "aria-label": q.title }, [
      el("div", { class: "question-rating-row" }, [1, 2, 3, 4, 5].map(score => {
        const filled = rating >= score;
        return el("button", {
          type: "button",
          class: `question-mark-rate ${filled ? `filled ${tone}` : ""}`,
          "aria-label": `Оценка ${score} из 5`,
          "aria-pressed": rating === score ? "true" : "false",
          onclick: () => setQuestionRating(q.id, score)
        }, ["?"]);
      })),
      rating ? el("p", { class: `rating-caption ${tone}` }, [
        rating <= 2 ? "Спасибо, зафиксировали: вопросы нужно улучшить." :
          rating <= 4 ? "Спасибо, зафиксировали: в целом полезно, но есть что усилить." :
            "Спасибо, зафиксировали: вопросы показались полезными."
      ]) : el("p", { class: "rating-caption" }, ["Нажмите на один из знаков вопроса."])
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
      el("a", { class: "brand", href: "#candidate" }, [iconEl("spark"), "Платформа подбора"]),
      brandMark()
    ]),
    el("form", { class: "chat-stage", onsubmit: submitCandidate }, [
      el("aside", { class: "guide-panel" }, [
        el("img", { src: guide.image, alt: "Помощник анкеты", class: "guide-character" }),
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
  if (q.type === "questionRating") return "Выберите оценку от 1 до 5. Значки слева направо заполнятся цветом.";
  if (q.type === "textarea") return "Коротко, по делу. Нам важна логика, а не идеальный текст.";
  if (q.type === "namePair") return "Заполните два поля, чтобы HR мог корректно связаться с вами.";
  if (q.type === "contactPair") return "Укажите email и номер телефона. Другие контакты на этом этапе не нужны.";
  if (q.id === "portfolio") return "";
  if (q.id === "workValues") return "Выберите до 3 вариантов, которые реально важны для вас в работе.";
  if (q.id === "workFormat") return "Можно выбрать один или несколько подходящих форматов.";
  if (q.id === "income") return "Укажите сумму или диапазон, на который вы ориентируетесь.";
  if (q.id === "availability") return "Выберите ближайший реалистичный срок выхода.";
  if (q.type === "text") return "Заполните поле, чтобы HR мог корректно связаться с вами и посмотреть опыт.";
  if (q.type === "expectations") return "Это не влияет на профессиональный балл, но помогает HR понять операционные условия.";
  return "Выберите вариант, который ближе всего к вашему реальному опыту.";
}

function welcomeView() {
  const canStart = state.consents.privacy && state.consents.dataProcessing;
  const ui = state.config?.ui || {};
  const facts = ui.facts || ["20 вопросов", "7-10 минут", "по делу"];
  return el("main", { class: "welcome-shell" }, [
    brandMark(),
    el("section", { class: "welcome-card" }, [
      el("div", { class: "welcome-copy" }, [
        el("div", { class: "soft-label mint" }, [ui.welcomeLabel || activeVacancy().title]),
        el("h1", {}, [ui.welcomeTitle || "Привет! Давайте познакомимся"]),
        el("p", { class: "lead" }, [ui.welcomeLead || state.config.intro || "Ответьте на несколько вопросов по вашему опыту."]),
        el("p", { class: "sublead" }, [ui.welcomeSublead || "Анкета займет около 7-10 минут."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill blue" }, [facts[0] || "анкета"]),
          el("span", { class: "pill green" }, [facts[1] || "быстро"]),
          el("span", { class: "pill yellow" }, [facts[2] || "по делу"])
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
        el("img", { src: "/assets/smm-guide-character.png", alt: ui.guideAlt || "Помощник анкеты", class: "welcome-character" }),
        el("div", { class: "speech-card" }, [ui.sashaIntro || "Я Саша. Помогу вам пройти анкету и ответить на наши вопросы."])
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
      vacancyCode: state.activeVacancyCode,
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

function telegramDeepLink(candidateId) {
  const username = state.integrations?.telegramBotUsername;
  if (!username || !candidateId) return "";
  return `https://t.me/${username}?start=c_${encodeURIComponent(candidateId)}`;
}

function telegramConnectBlock(resultOrId) {
  const candidateId = typeof resultOrId === "string" ? resultOrId : resultOrId?.id;
  const href = typeof resultOrId === "object" ? resultOrId?.nextStep?.telegramBotUrl || telegramDeepLink(candidateId) : telegramDeepLink(candidateId);
  if (!href) return el("div");
  return el("div", { class: "telegram-connect" }, [
    el("div", {}, [
      el("strong", {}, ["Получать уведомления в Telegram"]),
      el("p", {}, ["Привяжите бот, чтобы мы могли присылать сообщения по следующим этапам подбора."])
    ]),
    el("a", { class: "btn ghost", href, target: "_blank", rel: "noopener noreferrer" }, ["Открыть Telegram", iconEl("arrow")])
  ]);
}

function testInviteView(result) {
  const ui = state.config?.ui || {};
  return el("main", { class: "final-shell" }, [
    brandMark(),
    el("section", { class: "final-card" }, [
      el("div", { class: "final-copy" }, [
        el("div", { class: "soft-label yellow" }, ["Анкета отправлена"]),
        el("h1", {}, ["Отлично, идем дальше"]),
        el("p", { class: "lead" }, [ui.testLead || "Спасибо за ответы. По итогам анкеты видно, что ваш опыт может быть близок к нашей роли, поэтому предлагаем следующий небольшой шаг - показать себя в деле."]),
        el("p", { class: "sublead" }, [ui.testSublead || "Это короткое практическое задание, чтобы мы увидели ваш подход к задачам роли."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill green" }, ["ответы сохранены"]),
          el("span", { class: "pill blue" }, ["порог пройден"]),
          el("span", { class: "pill yellow" }, ["следующий шаг — практика"])
        ]),
        el("div", { class: `status-pill ${result.recommendation.code}` }, [`Статус в системе: ${recommendationLabel(result.recommendation)}`]),
        el("a", { class: "btn primary final-done", href: result.nextStep.testAssignmentUrl }, ["Показать себя в деле", iconEl("arrow")]),
        telegramConnectBlock(result)
      ]),
      el("aside", { class: "final-visual" }, [
        el("img", { src: "/assets/sasha-thumbs-up.png?v=1", alt: "Саша благодарит кандидата" }),
        el("div", { class: "speech-card" }, [ui.testSpeech || "Класс! Анкета выглядит сильной. Давайте посмотрим, как вы думаете на практике."])
      ])
    ]),
    siteFooter()
  ]);
}

function softDeclineView(result) {
  const ui = state.config?.ui || {};
  return el("main", { class: "final-shell" }, [
    brandMark(),
    el("section", { class: "final-card decline-card" }, [
      el("div", { class: "final-copy" }, [
        el("div", { class: "soft-label yellow" }, ["Анкета отправлена"]),
        el("h1", {}, ["Спасибо за ваш отклик"]),
        el("p", { class: "lead" }, [ui.declineLead || "Мы сохранили вашу анкету и передадим ее менеджеру по персоналу."]),
        el("p", { class: "sublead" }, ["Если ваш опыт подойдет под текущие задачи роли, команда свяжется с вами по указанным контактам."]),
        el("div", { class: "pill-row" }, [
          el("span", { class: "pill blue" }, ["ответы сохранены"]),
          el("span", { class: "pill yellow" }, ["решение по первому этапу"]),
          el("span", { class: "pill green" }, ["спасибо за время"])
        ]),
        el("div", { class: `status-pill ${result.recommendation.code}` }, [`Статус в системе: ${recommendationLabel(result.recommendation)}`]),
        telegramConnectBlock(result)
      ]),
      el("aside", { class: "final-visual" }, [
        el("img", { src: "/assets/poses/sasha-q01.png?v=1", alt: "Саша благодарит кандидата" }),
        el("div", { class: "speech-card" }, [ui.declineSpeech || "Спасибо, что прошли анкету."])
      ])
    ]),
    siteFooter()
  ]);
}

function testAssignmentView() {
  const id = state.route.replace("#test/", "");
  setTimeout(() => markTestAssignmentViewed(id), 0);
  const task = state.config?.testAssignment || {};
  return el("main", { class: "final-shell test-shell" }, [
    brandMark(),
    el("section", { class: "test-card" }, [
      el("header", { class: "test-head" }, [
        el("div", {}, [
          el("div", { class: "soft-label mint" }, ["Практическое задание"]),
          el("h1", {}, ["Показать себя в деле"]),
          el("p", { class: "lead" }, [state.config?.ui?.testSublead || "До личного знакомства предлагаем небольшой практический шаг: показать, как вы думаете и решаете задачи роли."])
        ]),
        el("img", { src: "/assets/sasha-thumbs-up.png?v=1", alt: "Саша поддерживает кандидата" })
      ]),
      el("section", { class: "task-panel" }, [
        el("h2", {}, ["Что нужно сделать"]),
        task.profileUrl
          ? el("p", {}, ["Подготовьте Google Документ с коротким аудитом профиля: ", el("a", { href: task.profileUrl, target: "_blank", rel: "noopener noreferrer" }, [task.profileUrl]), "."])
          : el("p", {}, [task.title || "Подготовьте короткое практическое задание по описанию ниже."]),
        el("ol", {}, (task.instruction || []).map(text => el("li", {}, [text]))),
        el("p", { class: "sublead" }, [`Сделайте документ открытым по ссылке для просмотра. Формат: ${task.submitFormat || "Google Документ с открытым доступом по ссылке"}. Важны не красивые макеты и не бесплатная работа, а ваша логика, конкретика и аккуратная структура.`])
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
        el("button", { class: "btn ghost test-refuse-button", onclick: () => {
          state.testRefusalOpen = true;
          render();
        } }, ["Не готов(а) выполнять задание"]),
        telegramConnectBlock(id),
        state.testSubmitted ? el("p", { class: "success-note" }, ["Ссылка сохранена. Спасибо! HR увидит тестовое в вашей карточке."]) : el("div"),
        state.testRefused ? el("p", { class: "success-note muted" }, ["Спасибо, мы сохранили ваш ответ."]) : el("div")
      ]),
      state.testRefusalOpen ? testRefusalModal(id) : el("div")
    ]),
    siteFooter()
  ]);
}

function testRefusalModal(id) {
  return el("div", { class: "modal-backdrop", onclick: event => {
    if (event.target.className === "modal-backdrop") {
      state.testRefusalOpen = false;
      render();
    }
  } }, [
    el("section", { class: "modal-card test-refusal-modal" }, [
      el("h2", {}, ["Отказаться от задания"]),
      el("p", {}, ["Мы уважительно относимся к вашему решению. Просим в двух словах написать причину: это поможет нам сделать отбор понятнее и удобнее для кандидатов."]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Причина отказа"]),
        el("textarea", {
          class: "textarea",
          placeholder: "Например: сейчас нет времени, не хочу делать задание до интервью, задание кажется слишком объемным",
          value: state.testRefusalReason,
          oninput: event => { state.testRefusalReason = event.target.value; }
        })
      ]),
      el("div", { class: "modal-actions" }, [
        el("button", { class: "btn ghost", onclick: () => {
          state.testRefusalOpen = false;
          render();
        } }, ["Вернуться к заданию"]),
        el("button", { class: "btn danger", onclick: () => refuseTestAssignment(id) }, ["Отказаться"])
      ])
    ])
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

async function refuseTestAssignment(id) {
  const reason = String(state.testRefusalReason || "").trim();
  if (reason.length < 3) return showToast("Напишите причину отказа хотя бы в двух словах.");
  const response = await fetch(`/api/submissions/${id}/test-assignment/refuse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить отказ." }));
    showToast(error.error || "Не удалось сохранить отказ.");
    return;
  }
  state.testRefusalOpen = false;
  state.testRefused = true;
  showToast("Ответ сохранен.");
  render();
}

function markTestAssignmentViewed(id) {
  if (state.testViewedIds.has(id)) return;
  state.testViewedIds.add(id);
  fetch(`/api/submissions/${id}/test-assignment/viewed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }).catch(() => {});
}

async function loadAdmin() {
  const vacancy = encodeURIComponent(state.adminVacancyCode || "smm");
  const requests = [
    fetch(`/api/admin/submissions?vacancy=${vacancy}`),
    fetch(`/api/admin/analytics?vacancy=${vacancy}`),
    fetch("/api/admin/config"),
    fetch("/api/admin/hiring-requests"),
    fetch("/api/admin/vacancy-openings"),
    fetch("/api/admin/hh-texts"),
    fetch("/api/admin/hh-publications"),
    fetch("/api/admin/hh/status"),
    fetch("/api/admin/hh/promotion-status"),
    fetch("/api/admin/hh/responses"),
    fetch("/api/admin/vacancy-duplicate-analysis"),
    fetch("/api/admin/bitrix/notifications")
  ];
  if (isOwner()) {
    requests.push(fetch("/api/admin/users"));
    requests.push(fetch("/api/admin/audit"));
  }
  const [subs, analytics, configResponse, hiringRequestsResponse, openingsResponse, hhTextsResponse, hhPublicationsResponse, hhStatusResponse, hhPromotionStatusResponse, hhResponsesResponse, vacancyDuplicateAnalysisResponse, bitrixNotificationsResponse, usersResponse, auditResponse] = await Promise.all(requests);
  if (subs.status === 401 || analytics.status === 401) return false;
  if (subs.status === 403 || analytics.status === 403) {
    showToast("У вашей учетной записи нет доступа к этой вакансии.");
    return false;
  }
  const subsData = await subs.json();
  const analyticsData = await analytics.json();
  state.submissions = subsData.submissions;
  state.analytics = analyticsData.analytics;
  state.adminVacancyCode = subsData.vacancyCode || analyticsData.vacancyCode || state.adminVacancyCode;
  if (configResponse?.ok) {
    const configData = await configResponse.json();
    state.adminConfigRoot = configData.config || state.adminConfigRoot;
    state.vacancies = configData.vacancies || state.vacancies;
    if (!state.vacancies[state.adminVacancyCode]) {
      state.adminVacancyCode = Object.keys(state.vacancies)[0] || state.adminVacancyCode;
    }
    const adminConfig = configData.config?.vacancies?.[state.adminVacancyCode] || configData.config;
    if (adminConfig) {
      applyConfig(adminConfig);
      if (state.questionnaireDraftVacancyCode !== state.adminVacancyCode) {
        state.questionnaireDraft = null;
      }
    }
  }
  if (hiringRequestsResponse?.ok) state.hiringRequests = (await hiringRequestsResponse.json()).requests;
  if (openingsResponse?.ok) state.vacancyOpenings = (await openingsResponse.json()).openings;
  if (hhTextsResponse?.ok) state.hhTexts = (await hhTextsResponse.json()).texts;
  if (hhPublicationsResponse?.ok) state.hhPublications = (await hhPublicationsResponse.json()).publications;
  if (hhStatusResponse?.ok) state.hhStatus = await hhStatusResponse.json();
  if (hhPromotionStatusResponse?.ok) {
    state.hhPromotionStatus = await hhPromotionStatusResponse.json();
  } else if (hhPromotionStatusResponse) {
    state.hhPromotionStatus = await hhPromotionStatusResponse.json().catch(() => ({ error: "Не удалось получить статус оплат HeadHunter." }));
  }
  if (hhResponsesResponse?.ok) state.hhResponses = (await hhResponsesResponse.json()).responses;
  if (vacancyDuplicateAnalysisResponse?.ok) {
    state.vacancyDuplicateAnalysis = await vacancyDuplicateAnalysisResponse.json();
  } else if (vacancyDuplicateAnalysisResponse) {
    state.vacancyDuplicateAnalysis = await vacancyDuplicateAnalysisResponse.json().catch(() => ({ error: "Не удалось выполнить анализ дублей вакансий." }));
  }
  if (bitrixNotificationsResponse?.ok) {
    const data = await bitrixNotificationsResponse.json();
    state.bitrixNotifications = data.settings;
    state.bitrixNotificationDraft = { ...data.settings, events: { ...(data.settings?.events || {}) } };
  }
  if (usersResponse?.ok) state.adminUsers = (await usersResponse.json()).users;
  if (auditResponse?.ok) state.auditLogs = (await auditResponse.json()).logs;
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

async function submitLogin(event = null) {
  const form = event?.currentTarget || document.querySelector(".login-card");
  const formData = form ? new FormData(form) : null;
  const username = String(formData?.get("username") || state.loginUsername || "").trim();
  const password = String(formData?.get("password") || state.loginPassword || "");
  if (!username || !password) {
    state.loginError = "Введите логин и пароль.";
    render();
    return;
  }
  state.loginUsername = username;
  state.loginPassword = password;
  state.loginError = "";
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    state.loginError = response.status === 401 ? "Неверный логин или пароль." : "Не удалось войти. Попробуйте еще раз.";
    render();
    return;
  }
  const data = await response.json();
  state.user = data.user;
  state.loginPassword = "";
  state.loginError = "";
  localStorage.setItem(ADMIN_USER_KEY, data.user.username);
  await loadAdmin();
  render();
}

function loginView() {
  return el("main", { class: "login-shell" }, [
    el("form", {
      class: "login-card",
      autocomplete: "on",
      onsubmit: event => {
        event.preventDefault();
        submitLogin(event);
      }
    }, [
      el("div", { class: "badge" }, [iconEl("user"), "Вход для команды"]),
      el("h1", {}, ["HR-платформа"]),
      el("p", {}, ["Войдите под выданным логином: владелец, HR или руководитель-заказчик вакансии. Доступ и разделы определяются вашей ролью."]),
      el("label", { class: `named-input login-field ${state.loginError ? "has-error" : ""}` }, [
        el("span", {}, ["Логин"]),
        el("input", {
          class: "input",
          type: "text",
          name: "username",
          autocomplete: "username",
          value: state.loginUsername,
          placeholder: "Почта или логин",
          "aria-invalid": state.loginError ? "true" : "false",
          oninput: event => {
            state.loginUsername = event.target.value;
            if (state.loginError) {
              state.loginError = "";
              render();
            }
          }
        })
      ]),
      el("label", { class: `named-input login-field ${state.loginError ? "has-error" : ""}` }, [
        el("span", {}, ["Пароль"]),
        el("div", { class: `password-field ${state.loginError ? "has-error" : ""}` }, [
          el("input", {
            class: "input",
            type: state.loginPasswordVisible ? "text" : "password",
            name: "password",
            autocomplete: "current-password",
            value: state.loginPassword,
            placeholder: "Пароль",
            "aria-invalid": state.loginError ? "true" : "false",
            oninput: event => {
              state.loginPassword = event.target.value;
              if (state.loginError) {
                state.loginError = "";
                render();
              }
            }
          }),
          el("button", {
            class: "password-toggle",
            type: "button",
            title: state.loginPasswordVisible ? "Скрыть пароль" : "Показать пароль",
            onclick: () => {
              state.loginPasswordVisible = !state.loginPasswordVisible;
              render();
            }
          }, [iconEl("eye")])
        ])
      ]),
      state.loginError ? el("p", { class: "login-error", role: "alert" }, [state.loginError]) : el("p", { class: "login-error empty" }, [""]),
      el("button", { class: "btn primary wide", type: "submit" }, ["Войти", iconEl("arrow")])
    ])
  ]);
}

function kpi(label, value, tone = "", note = "") {
  return el("div", { class: `kpi ${tone}` }, [
    el("span", {}, [label]),
    el("strong", {}, [String(value)]),
    note ? el("em", {}, [note]) : el("em")
  ]);
}

function hasSubmittedTestAssignment(item = {}) {
  const test = item.testAssignment || {};
  return Boolean(
    test.link ||
    test.submittedAt ||
    ["submitted", "evaluated", "manual_reviewed"].includes(test.status)
  );
}

function hasManualTestScore(item = {}) {
  const score = item.testAssignment?.manualReview?.score;
  return score !== null && score !== undefined && score !== "" && !Number.isNaN(Number(score));
}

function testAssignmentKpiCounts() {
  const submitted = (state.submissions || []).filter(hasSubmittedTestAssignment);
  return {
    submitted: submitted.length,
    withoutReview: submitted.filter(item => !hasManualTestScore(item)).length
  };
}

function adminNavButton(section, label, iconName) {
  return el("button", {
    class: `btn ghost ${state.adminSection === section ? "active" : ""}`,
    onclick: () => {
      state.adminSection = section;
      const hash = section === "overview"
        ? "#admin"
        : section === "questionnaire"
          ? `#admin/questionnaire/${encodeURIComponent(state.adminVacancyCode || "smm")}`
          : `#admin/${section}`;
      if (location.hash !== hash) history.replaceState(null, "", hash);
      render();
    }
  }, [iconEl(iconName), label]);
}

function adminVacancyButton(code, vacancy) {
  return el("button", {
    class: `admin-subnav ${state.adminSection === "vacancies" && state.adminVacancyCode === code ? "active" : ""}`,
    onclick: async () => {
      state.adminSection = "vacancies";
      state.adminVacancyCode = code;
      if (location.hash !== `#admin/${code}`) history.replaceState(null, "", `#admin/${code}`);
      state.selected = null;
      state.aiInsights = null;
      state.candidateListExpanded = false;
      state.config = null;
      state.questionnaireDraft = null;
      state.questionnaireDraftVacancyCode = "";
      state.loading = true;
      render();
      await loadAdmin();
      state.loading = false;
      render();
    }
  }, [vacancy.adminTitle || vacancy.title || code]);
}

function adminSidebar() {
  const vacancies = Object.entries(state.vacancies || {});
  return el("aside", { class: "admin-sidebar" }, [
    el("div", { class: "admin-menu-group" }, [
      el("span", { class: "admin-menu-title" }, ["Разделы"]),
      adminNavButton("overview", "Обзор", "chart"),
      adminNavButton("candidates", "Кандидаты", "list"),
      adminNavButton("questionnaire", "Опросник", "list"),
      adminNavButton("interview", "Интервью", "user"),
      adminNavButton("analytics", "Аналитика", "chart"),
      adminNavButton("hiring", "Подобрать сотрудника", "filter"),
      adminNavButton("hh", "HeadHunter", "copy"),
      adminNavButton("notifications", "Уведомления", "bell"),
      ...(isOwner() ? [
        adminNavButton("staff", "Сотрудники", "user"),
        adminNavButton("audit", "Журнал", "list")
      ] : [])
    ]),
    el("div", { class: "admin-menu-group" }, [
      el("span", { class: "admin-menu-title" }, ["Вакансии"]),
      ...(vacancies.length ? vacancies.map(([code, vacancy]) => adminVacancyButton(code, vacancy)) : [
        adminVacancyButton("smm", { adminTitle: "SMM-менеджер" }),
        adminVacancyButton("project-manager", { adminTitle: "Менеджер проектов" })
      ])
    ])
  ]);
}

function pluralRu(number, one, few, many) {
  const value = Math.abs(Number(number || 0));
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function activeOpeningCount() {
  return (state.vacancyOpenings || []).filter(item => !["closed", "cancelled"].includes(item.status)).length;
}

function overviewMetric(label, value, note = "", tone = "") {
  return el("div", { class: `overview-metric ${tone}` }, [
    el("span", {}, [label]),
    el("strong", {}, [String(value)]),
    note ? el("em", {}, [note]) : el("em")
  ]);
}

function overviewVacancyCard(code, vacancy) {
  const title = vacancy.adminTitle || vacancy.title || code;
  const url = questionnaireUrl(code);
  const status = vacancy.active === false ? "приостановлена" : "активна";
  return el("div", { class: `overview-vacancy-card ${vacancy.active === false ? "paused" : ""}` }, [
    el("div", {}, [
      el("strong", {}, [title]),
      el("span", {}, [`Опросник: /v/${code}`])
    ]),
    el("div", { class: "overview-card-actions" }, [
      el("button", {
        class: "btn ghost",
        onclick: async () => {
          state.adminSection = "vacancies";
          state.adminVacancyCode = code;
          history.replaceState(null, "", `#admin/${code}`);
          state.selected = null;
          state.aiInsights = null;
          state.config = null;
          state.questionnaireDraft = null;
          state.questionnaireDraftVacancyCode = "";
          state.loading = true;
          render();
          await loadAdmin();
          state.loading = false;
          render();
        }
      }, ["Открыть"]),
      el("button", {
        class: "btn ghost",
        onclick: () => copyToClipboard(url, `Ссылка на опросник "${title}" скопирована.`)
      }, [iconEl("copy"), "Ссылка"])
    ]),
    el("div", { class: `status-pill ${vacancy.active === false ? "red" : "green"}` }, [status])
  ]);
}

function duplicateStatsText(item) {
  const stats = item.stats || {};
  return [
    `${stats.candidates || 0} ${pluralRu(stats.candidates || 0, "кандидат", "кандидата", "кандидатов")}`,
    `${stats.hhResponses || 0} ${pluralRu(stats.hhResponses || 0, "отклик", "отклика", "откликов")}`,
    `${stats.hhPublications || 0} ${pluralRu(stats.hhPublications || 0, "публикация", "публикации", "публикаций")}`,
    `${stats.activeOpenings || 0} ${pluralRu(stats.activeOpenings || 0, "активный подбор", "активных подбора", "активных подборов")}`
  ].join(" · ");
}

function openVacancyFromDuplicateAnalysis(code) {
  state.adminSection = "vacancies";
  state.adminVacancyCode = code;
  history.replaceState(null, "", `#admin/${code}`);
  state.selected = null;
  state.aiInsights = null;
  state.config = null;
  state.questionnaireDraft = null;
  state.questionnaireDraftVacancyCode = "";
  state.loading = true;
  render();
  loadAdmin().then(() => {
    state.loading = false;
    render();
  });
}

function duplicateVacancyMiniCard(item, primaryCode) {
  const isPrimary = item.code === primaryCode;
  return el("div", { class: `duplicate-vacancy-card ${isPrimary ? "primary" : ""}` }, [
    el("div", {}, [
      el("span", { class: "duplicate-label" }, [isPrimary ? "Рекомендуем оставить основной" : "Возможный дубль"]),
      el("strong", {}, [item.title || vacancyLabel(item.code)]),
      el("em", {}, [duplicateStatsText(item)])
    ]),
    el("button", { class: "btn ghost", onclick: () => openVacancyFromDuplicateAnalysis(item.code) }, ["Открыть"])
  ]);
}

function vacancyDuplicateAnalysisPanel() {
  const analysis = state.vacancyDuplicateAnalysis;
  if (!analysis) return el("div");
  if (analysis.error) {
    return el("section", { class: "overview-section duplicate-analysis danger" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Дубли вакансий"]),
        el("span", {}, ["Проверка не выполнена"])
      ]),
      el("div", { class: "empty danger-note" }, [analysis.error])
    ]);
  }
  const groups = analysis.duplicateGroups || [];
  return el("section", { class: `overview-section duplicate-analysis ${groups.length ? "warning" : "ok"}` }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Дубли вакансий"]),
        el("span", {}, [analysis.checkedAt ? `Проверено: ${formatDateTime(analysis.checkedAt)}` : ""])
      ]),
      el("span", {}, [groups.length ? `Найдено групп: ${groups.length}` : "Дублей не найдено"])
    ]),
    groups.length
      ? el("div", { class: "duplicate-group-list" }, groups.map(group => el("div", { class: "duplicate-group" }, [
        el("div", { class: "duplicate-summary" }, [
          el("strong", {}, [group.summary || "Похожие вакансии"]),
          group.reasons?.length ? el("span", {}, [`Почему подсвечено: ${group.reasons.join(", ")}.`]) : el("span", {}, ["Почему подсвечено: названия и контекст похожи."])
        ]),
        el("div", { class: "duplicate-card-grid" }, (group.all || []).map(item => duplicateVacancyMiniCard(item, group.primary?.code))),
        el("div", { class: "duplicate-conclusion" }, [
          el("strong", {}, ["Заключение"]),
          el("p", {}, [group.conclusion || "Проверьте, не описывает ли группа одну и ту же роль."]),
          el("strong", {}, ["Что сделать"]),
          el("p", {}, [group.recommendation || "Оставить одну основную вакансию, вторую объединить или переименовать, если это другая роль."])
        ])
      ])))
      : el("div", { class: "duplicate-ok-note" }, [
        el("strong", {}, ["Все нормально"]),
        el("p", {}, [`Проверено вакансий: ${analysis.totalVacancies || 0}. Явных дублей по названию, связям с HeadHunter и активности воронок не найдено.`])
      ])
  ]);
}

async function askPlatformQuestion() {
  const question = String(state.platformQuestion || "").trim();
  if (question.length < 4) return showToast("Напишите вопрос чуть подробнее.");
  state.platformQuestionLoading = true;
  state.platformAnswer = null;
  render();
  try {
    const response = await fetch("/api/admin/platform-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Не удалось получить ответ.");
    state.platformAnswer = data;
  } catch (error) {
    showToast(error.message || "Не удалось получить ответ платформы.");
  } finally {
    state.platformQuestionLoading = false;
    render();
  }
}

function askPlatformExample(question) {
  state.platformQuestion = question;
  askPlatformQuestion();
}

function platformAssistantPanel() {
  const examples = [
    "Менеджер проектов и проектный маркетолог - это дубли?",
    "Какие вакансии сейчас выглядят похожими?",
    "Что проверить перед объединением вакансий?"
  ];
  return el("section", { class: "overview-section platform-assistant-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Спросить платформу"]),
        el("span", {}, ["Ответ по данным вакансий, подборов и подключенных интеграций."])
      ]),
      el("span", {}, [state.platformAnswer?.mode === "local" ? "локальный ответ" : state.platformAnswer ? "ответ ИИ HR" : ""])
    ]),
    el("div", { class: "platform-question-form" }, [
      el("textarea", {
        class: "textarea platform-question-input",
        placeholder: "Например: менеджер проектов и проектный маркетолог - это дубли?",
        value: state.platformQuestion,
        oninput: event => {
          state.platformQuestion = event.target.value;
        }
      }),
      el("button", {
        class: "btn primary platform-question-button",
        onclick: askPlatformQuestion,
        disabled: state.platformQuestionLoading ? "disabled" : null
      }, [state.platformQuestionLoading ? "Думаю..." : "Задать вопрос", iconEl("arrow")])
    ]),
    el("div", { class: "platform-question-examples" }, examples.map(question => (
      el("button", { class: "chip-button", onclick: () => askPlatformExample(question) }, [question])
    ))),
    state.platformAnswer
      ? el("div", { class: "platform-answer" }, [
        el("strong", {}, ["Ответ"]),
        ...String(state.platformAnswer.answer || "")
          .split(/\n+/)
          .map(part => part.trim())
          .filter(Boolean)
          .map(part => el("p", {}, [part])),
        state.platformAnswer.contextSummary
          ? el("small", {}, [`Учтено вакансий: ${state.platformAnswer.contextSummary.vacancies || 0}; групп дублей: ${state.platformAnswer.contextSummary.duplicateGroups || 0}.`])
          : el("small")
      ])
      : el("div")
  ]);
}

function adminOverviewView() {
  const vacancies = Object.entries(state.vacancies || {});
  const activeVacancies = vacancies.filter(([, vacancy]) => vacancy.active !== false).length;
  const openings = activeOpeningCount();
  const hhConnected = Boolean(state.hhStatus?.account?.connected);
  const staffCount = state.adminUsers?.length || 0;
  const currentVacancy = vacancyLabel(state.adminVacancyCode);
  return el("section", { class: "overview-page" }, [
    el("header", { class: "dash-header overview-hero" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("chart"), "Общий центр подбора"]),
        el("h1", {}, ["Платформа подбора"]),
        el("p", {}, ["Здесь общий вход в систему подбора: вакансии, запуски, кандидаты, hh.ru, сотрудники и журнал действий. Конкретная воронка по соцсетям открывается отдельно через список вакансий."])
      ])
    ]),
    el("div", { class: "overview-metrics" }, [
      overviewMetric("Вакансий в системе", vacancies.length || 0, `${activeVacancies} ${pluralRu(activeVacancies, "активная", "активные", "активных")}`, "green"),
      overviewMetric("Подбор сотрудников", openings, openings ? "есть активные запросы" : "активных подборов нет", "yellow"),
      overviewMetric("Текущая воронка", currentVacancy, "для детальной аналитики и кандидатов"),
      overviewMetric("HeadHunter", hhConnected ? "подключен" : "не подключен", hhConnected ? "можно синхронизировать отклики" : "можно подготовить ручную публикацию", hhConnected ? "green" : "red"),
      overviewMetric("Сотрудников", staffCount || "—", isOwner() ? "пользователи и права доступа" : "доступно владельцу")
    ]),
    el("section", { class: "overview-section" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Вакансии в работе"]),
        el("span", {}, ["Откройте конкретную вакансию, чтобы увидеть кандидатов, аналитику и ссылку на опросник."])
      ]),
      vacancies.length ? el("div", { class: "overview-vacancy-grid" }, vacancies.map(([code, vacancy]) => overviewVacancyCard(code, vacancy))) : el("div", { class: "empty" }, ["Пока нет заведенных вакансий."])
    ]),
    platformAssistantPanel(),
    vacancyDuplicateAnalysisPanel(),
    el("section", { class: "overview-section overview-guide" }, [
      el("div", {}, [
        el("h2", {}, ["Как работать с системой"]),
        el("ol", {}, [
          el("li", {}, ["Откройте нужную вакансию в блоке «Вакансии в работе»."]),
          el("li", {}, ["Скопируйте ссылку на опросник и отправьте кандидату или используйте ее для HeadHunter."]),
          el("li", {}, ["Смотрите кандидатов, баллы, тестовые задания и рекомендации по конкретной вакансии."]),
          el("li", {}, ["Раз в несколько дней проверяйте аналитику, чтобы понять качество потока и слабые места воронки."])
        ])
      ]),
      el("div", { class: "overview-note" }, [
        el("strong", {}, ["Важно"]),
        el("p", {}, ["Этот экран не оценивает кандидатов и не относится к одной вакансии. Он нужен как нейтральная стартовая панель для всей HR-системы."])
      ])
    ])
  ]);
}

function adminQuestionnaireLinksPanel() {
  const code = state.adminVacancyCode || "smm";
  const vacancy = state.vacancies?.[code] || { adminTitle: vacancyLabel(code) };
  const url = questionnaireUrl(code);
  return el("section", { class: "table-panel questionnaire-links-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Ссылка на опросник"]),
        el("span", {}, ["Для отправки кандидату, публикации в вакансии или передачи менеджеру по персоналу."])
      ])
    ]),
    el("div", { class: "questionnaire-link-list" }, [
      el("div", { class: "questionnaire-link-row active" }, [
        el("div", { class: "questionnaire-link-meta" }, [
          el("strong", {}, [vacancy.adminTitle || vacancy.title || code]),
          el("input", {
            class: "questionnaire-link-input",
            readonly: "readonly",
            value: url,
            onclick: event => event.target.select()
          })
        ]),
        el("button", {
          class: "btn ghost copy-link-button",
          onclick: () => copyToClipboard(url, `Ссылка на опросник "${vacancy.adminTitle || vacancy.title || code}" скопирована.`)
        }, [iconEl("copy"), "Копировать"])
      ])
    ])
  ]);
}

function testSettingsDraft() {
  const code = state.adminVacancyCode || "smm";
  const current = state.config?.testAssignment || {};
  if (!state.testSettingsDrafts[code]) {
    state.testSettingsDrafts[code] = {
      mode: current.mode || "after_questionnaire",
      threshold: current.threshold ?? 80
    };
  }
  return state.testSettingsDrafts[code];
}

function testAssignmentModeLabel(mode) {
  return {
    after_questionnaire: "сразу после сильной анкеты",
    after_call: "после короткого созвона",
    manual: "только вручную"
  }[mode] || "сразу после сильной анкеты";
}

async function saveTestAssignmentSettings() {
  const code = state.adminVacancyCode || "smm";
  const draft = testSettingsDraft();
  const response = await fetch(`/api/admin/vacancies/${encodeURIComponent(code)}/test-assignment-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить настройки тестового." }));
    showToast(error.error || "Не удалось сохранить настройки тестового.");
    return;
  }
  const data = await response.json();
  state.adminConfigRoot = data.rootConfig || state.adminConfigRoot;
  state.vacancies = data.vacancies || state.vacancies;
  if (data.config) applyConfig(data.config);
  state.testSettingsDrafts[code] = {
    mode: data.config?.testAssignment?.mode || draft.mode,
    threshold: data.config?.testAssignment?.threshold ?? draft.threshold
  };
  showToast("Настройки тестового сохранены.");
  render();
}

function testAssignmentSettingsPanel() {
  const editable = isHrOrOwner();
  const draft = testSettingsDraft();
  return el("section", { class: "table-panel test-settings-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Настройки тестового"]),
        el("span", {}, [`Сейчас: ${testAssignmentModeLabel(draft.mode)}. Порог анкеты: ${draft.threshold}/100.`])
      ]),
      editable ? el("button", { class: "btn primary", onclick: saveTestAssignmentSettings }, ["Сохранить"]) : el("span")
    ]),
    el("div", { class: "test-settings-grid" }, [
      el("label", { class: "named-input" }, [
        el("span", {}, ["Когда выдавать задание"]),
        el("select", {
          class: "input",
          disabled: editable ? null : "disabled",
          onchange: event => {
            draft.mode = event.target.value;
            render();
          }
        }, [
          el("option", { value: "after_questionnaire", selected: draft.mode === "after_questionnaire" ? "selected" : null }, ["Сразу после сильной анкеты"]),
          el("option", { value: "after_call", selected: draft.mode === "after_call" ? "selected" : null }, ["После короткого созвона"]),
          el("option", { value: "manual", selected: draft.mode === "manual" ? "selected" : null }, ["Только вручную"])
        ]),
        el("small", {}, ["Если выбрать созвон или ручной режим, кандидат не получит тестовое автоматически после анкеты."])
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Порог анкеты"]),
        el("input", {
          class: "input",
          type: "number",
          min: "0",
          max: "100",
          disabled: editable ? null : "disabled",
          value: draft.threshold,
          oninput: event => { draft.threshold = event.target.value; }
        }),
        el("small", {}, ["Работает только в режиме автоматической выдачи после анкеты."])
      ])
    ])
  ]);
}

function openQuestionnaireEditor() {
  state.adminSection = "questionnaire";
  state.questionnaireDraft = null;
  state.questionnaireDraftVacancyCode = "";
  history.replaceState(null, "", `#admin/questionnaire/${encodeURIComponent(state.adminVacancyCode || "smm")}`);
  render();
}

const QUESTION_TYPE_LABELS = {
  namePair: "Имя и фамилия",
  contactPair: "Электронная почта и телефон",
  resumeAttachment: "Резюме или файл",
  text: "Короткий текст",
  textarea: "Развернутый ответ",
  radio: "Один вариант ответа",
  checkbox: "Несколько вариантов ответа",
  questionRating: "Оценка понятности анкеты"
};

function cloneQuestionForEditor(question) {
  return {
    id: String(question.id || `customQuestion${Date.now()}`),
    section: question.section || "",
    title: question.title || "",
    type: question.type || "text",
    required: Boolean(question.required),
    placeholder: question.placeholder || "",
    max: question.max || "",
    maxPick: question.maxPick || ""
  };
}

function ensureQuestionnaireDraft() {
  if (state.questionnaireDraft && state.questionnaireDraftVacancyCode === state.adminVacancyCode) return state.questionnaireDraft;
  state.questionnaireDraft = (state.config?.questions || questions || []).map(cloneQuestionForEditor);
  state.questionnaireDraftVacancyCode = state.adminVacancyCode;
  return state.questionnaireDraft;
}

function updateQuestionnaireDraft(index, patch, rerender = true) {
  const draft = ensureQuestionnaireDraft();
  draft[index] = { ...draft[index], ...patch };
  if (rerender) render();
}

function addQuestionnaireQuestion() {
  const draft = ensureQuestionnaireDraft();
  draft.push({
    id: `customQuestion${Date.now()}`,
    section: "Дополнительные вопросы",
    title: "Новый вопрос",
    type: "text",
    required: true,
    placeholder: "",
    max: "",
    maxPick: ""
  });
  render();
}

function deleteQuestionnaireQuestion(index) {
  const draft = ensureQuestionnaireDraft();
  const title = draft[index]?.title || `вопрос ${index + 1}`;
  if (!confirm(`Удалить вопрос "${title}"?`)) return;
  draft.splice(index, 1);
  render();
}

function moveQuestionnaireQuestion(index, direction) {
  const draft = ensureQuestionnaireDraft();
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draft.length) return;
  const [item] = draft.splice(index, 1);
  draft.splice(nextIndex, 0, item);
  render();
}

function sanitizedQuestionDraft(question) {
  const result = {
    id: String(question.id || `customQuestion${Date.now()}`).trim(),
    title: String(question.title || "").trim(),
    type: String(question.type || "text").trim(),
    required: Boolean(question.required)
  };
  const section = String(question.section || "").trim();
  const placeholder = String(question.placeholder || "").trim();
  const max = Number(question.max);
  const maxPick = Number(question.maxPick);
  if (section) result.section = section;
  if (placeholder) result.placeholder = placeholder;
  if (Number.isFinite(max) && max > 0) result.max = Math.round(max);
  if (Number.isFinite(maxPick) && maxPick > 0) result.maxPick = Math.round(maxPick);
  return result;
}

function questionnaireDraftValidation(questionsToSave) {
  if (!questionsToSave.length) return "В опроснике должен быть хотя бы один вопрос.";
  const ids = new Set();
  for (const item of questionsToSave) {
    if (!item.title) return "У каждого вопроса должен быть текст.";
    if (!QUESTION_TYPE_LABELS[item.type]) return `Неизвестный тип вопроса: ${item.type}.`;
    if (ids.has(item.id)) return `Повторяется технический код вопроса: ${item.id}.`;
    ids.add(item.id);
    if ((item.type === "radio" || item.type === "checkbox") && !Object.keys(labels[item.id] || {}).length) {
      return `Для закрытого вопроса "${item.title}" не найдены варианты ответа. Пока добавляйте новые вопросы как текстовые, либо отдельно обновите варианты и баллы в методологии.`;
    }
  }
  return "";
}

async function saveQuestionnaireDraft() {
  const draft = ensureQuestionnaireDraft();
  const questionsToSave = draft.map(sanitizedQuestionDraft);
  const validationError = questionnaireDraftValidation(questionsToSave);
  if (validationError) {
    showToast(validationError);
    return;
  }
  state.questionnaireSaving = true;
  render();
  const response = await fetch(`/api/admin/vacancies/${encodeURIComponent(state.adminVacancyCode)}/questions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions: questionsToSave })
  });
  state.questionnaireSaving = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить опросник." }));
    showToast(error.error || "Не удалось сохранить опросник.");
    render();
    return;
  }
  const data = await response.json();
  state.adminConfigRoot = data.rootConfig || state.adminConfigRoot;
  state.vacancies = data.vacancies || state.vacancies;
  if (data.config) applyConfig(data.config);
  state.questionnaireDraft = (data.config?.questions || questionsToSave).map(cloneQuestionForEditor);
  state.questionnaireDraftVacancyCode = state.adminVacancyCode;
  showToast("Опросник сохранен.");
  render();
}

function questionnaireTypeSelect(question, index, editable) {
  return el("select", {
    class: "input",
    disabled: editable ? null : "disabled",
    onchange: event => updateQuestionnaireDraft(index, { type: event.target.value })
  }, Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
    el("option", { value, selected: question.type === value ? "selected" : null }, [label])
  )));
}

function questionEditorCard(question, index, total, editable) {
  const hasChoices = Object.keys(labels[question.id] || {}).length > 0;
  const needsChoices = question.type === "radio" || question.type === "checkbox";
  return el("article", { class: "question-editor-card" }, [
    el("div", { class: "question-editor-head" }, [
      el("div", { class: "question-number" }, [`${index + 1}`]),
      el("div", {}, [
        el("strong", {}, [question.title || "Вопрос без текста"]),
        el("span", {}, [QUESTION_TYPE_LABELS[question.type] || "Тип не задан"])
      ]),
      el("div", { class: "question-editor-actions" }, [
        el("button", {
          class: "btn ghost icon-btn",
          type: "button",
          disabled: !editable || index === 0 ? "disabled" : null,
          title: "Поднять вопрос выше",
          onclick: () => moveQuestionnaireQuestion(index, -1)
        }, ["↑"]),
        el("button", {
          class: "btn ghost icon-btn",
          type: "button",
          disabled: !editable || index === total - 1 ? "disabled" : null,
          title: "Опустить вопрос ниже",
          onclick: () => moveQuestionnaireQuestion(index, 1)
        }, ["↓"]),
        el("button", {
          class: "btn ghost icon-btn danger-lite",
          type: "button",
          disabled: !editable ? "disabled" : null,
          title: "Удалить вопрос",
          onclick: () => deleteQuestionnaireQuestion(index)
        }, [iconEl("trash")])
      ])
    ]),
    el("div", { class: "question-editor-grid" }, [
      el("label", { class: "named-input question-title-field" }, [
        el("span", {}, ["Текст вопроса"]),
        el("textarea", {
          class: "input question-title-input",
          disabled: editable ? null : "disabled",
          oninput: event => updateQuestionnaireDraft(index, { title: event.target.value }, false)
        }, [question.title || ""])
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Тип ответа"]),
        questionnaireTypeSelect(question, index, editable)
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Раздел"]),
        el("input", {
          class: "input",
          disabled: editable ? null : "disabled",
          value: question.section || "",
          placeholder: "Например: Опыт",
          oninput: event => updateQuestionnaireDraft(index, { section: event.target.value }, false)
        })
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Подсказка в поле"]),
        el("input", {
          class: "input",
          disabled: editable ? null : "disabled",
          value: question.placeholder || "",
          placeholder: "Необязательно",
          oninput: event => updateQuestionnaireDraft(index, { placeholder: event.target.value }, false)
        })
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Лимит символов"]),
        el("input", {
          class: "input",
          disabled: editable ? null : "disabled",
          type: "number",
          min: "1",
          value: question.max || "",
          placeholder: "Для текстовых ответов",
          oninput: event => updateQuestionnaireDraft(index, { max: event.target.value }, false)
        })
      ]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Максимум вариантов"]),
        el("input", {
          class: "input",
          disabled: editable ? null : "disabled",
          type: "number",
          min: "1",
          value: question.maxPick || "",
          placeholder: "Для множественного выбора",
          oninput: event => updateQuestionnaireDraft(index, { maxPick: event.target.value }, false)
        })
      ]),
      el("label", { class: "inline-check question-required" }, [
        el("input", {
          type: "checkbox",
          disabled: editable ? null : "disabled",
          checked: question.required ? "checked" : null,
          onchange: event => updateQuestionnaireDraft(index, { required: event.target.checked })
        }),
        el("span", {}, ["Обязательный вопрос"])
      ])
    ]),
    needsChoices && !hasChoices ? el("p", { class: "question-editor-warning" }, [
      "У этого закрытого вопроса пока нет вариантов ответа. Новые закрытые вопросы нужно дополнять вариантами и баллами в методологии."
    ]) : el("div")
  ]);
}

function questionnaireEditorPanel() {
  if (!state.config) {
    return el("section", { class: "table-panel questionnaire-editor-panel" }, [
      el("div", { class: "panel-head" }, [
        el("div", {}, [
          el("h2", {}, ["Опросник вакансии"]),
          el("span", {}, ["Загружаем вопросы для выбранной вакансии."])
        ])
      ])
    ]);
  }
  const editable = canEditQuestionnaire();
  const draft = ensureQuestionnaireDraft();
  return el("section", { class: "table-panel questionnaire-editor-panel" }, [
    el("div", { class: "panel-head questionnaire-editor-headline" }, [
      el("div", {}, [
        el("h2", {}, ["Опросник вакансии"]),
        el("span", {}, ["Все вопросы на одной странице: можно быстро проверить текст, порядок, обязательность и лимиты."])
      ]),
      el("div", { class: "questionnaire-editor-top-actions" }, [
        el("button", {
          class: "btn ghost",
          type: "button",
          disabled: !editable ? "disabled" : null,
          onclick: addQuestionnaireQuestion
        }, [iconEl("plus"), "Добавить вопрос"]),
        el("button", {
          class: "btn primary",
          type: "button",
          disabled: !editable || state.questionnaireSaving ? "disabled" : null,
          onclick: saveQuestionnaireDraft
        }, [state.questionnaireSaving ? "Сохраняем..." : "Сохранить опросник"])
      ])
    ]),
    editable ? el("p", { class: "questionnaire-editor-note" }, [
      "Безопасный режим: редактируются вопросы и порядок. Варианты ответов и баллы закрытых вопросов остаются в методологии оценки, чтобы случайно не сломать скоринг."
    ]) : el("p", { class: "questionnaire-editor-note" }, [
      "У вас режим просмотра. Менять опросник может владелец или HR."
    ]),
    el("div", { class: "question-editor-list" }, draft.map((question, index) => questionEditorCard(question, index, draft.length, editable)))
  ]);
}

function questionnaireSummaryPanel() {
  const total = (state.config?.questions || questions || []).length;
  const editable = canEditQuestionnaire();
  return el("section", { class: "table-panel questionnaire-summary-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Опросник вакансии"]),
        el("span", {}, [`Вопросов: ${total}. Редактирование вынесено на отдельный экран.`])
      ]),
      el("button", {
        class: "btn primary",
        type: "button",
        disabled: editable ? null : "disabled",
        onclick: openQuestionnaireEditor
      }, ["Редактировать"])
    ])
  ]);
}

function questionnaireEditorView() {
  const currentVacancyTitle = vacancyLabel(state.adminVacancyCode);
  return el("section", { class: "questionnaire-editor-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("h1", {}, ["Опросник"]),
        el("p", {}, [currentVacancyTitle])
      ]),
      el("button", {
        class: "btn ghost",
        onclick: () => {
          state.adminSection = "vacancies";
          history.replaceState(null, "", `#admin/${encodeURIComponent(state.adminVacancyCode || "smm")}`);
          render();
        }
      }, ["Вернуться к вакансии"])
    ]),
    questionnaireEditorPanel()
  ]);
}

function pctText(value, total) {
  if (!total) return "—";
  return `${Math.round((Number(value || 0) / Number(total || 1)) * 100)}%`;
}

function metricValue(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function selectedVacancyHhPublications() {
  const code = state.adminVacancyCode || "smm";
  return (state.hhPublications || []).filter(item => item.vacancyCode === code);
}

function selectedVacancyHhResponses() {
  const code = state.adminVacancyCode || "smm";
  return (state.hhResponses || []).filter(item => item.vacancyCode === code);
}

function sumKnown(values) {
  let hasKnown = false;
  const sum = values.reduce((acc, value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return acc;
    hasKnown = true;
    return acc + numeric;
  }, 0);
  return hasKnown ? sum : null;
}

function isTodayDate(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

function vacancyChannelMetrics(analytics) {
  const publications = selectedVacancyHhPublications();
  const responses = selectedVacancyHhResponses();
  const hhViews = sumKnown(publications.map(item => item.payload?.hhMetrics?.views));
  const hhResponsesFromMetrics = sumKnown(publications.map(item => item.payload?.hhMetrics?.responses));
  const hhResponses = Math.max(responses.length, hhResponsesFromMetrics || 0);
  const sentQuestionnaires = responses.filter(item => item.questionnaireSent).length;
  const hhResponsesToday = responses.filter(item => isTodayDate(item.createdAt || item.updatedAt)).length;
  const sentQuestionnairesToday = responses.filter(item => item.questionnaireSent && isTodayDate(item.questionnaireSentAt)).length;
  const completedToday = (state.submissions || []).filter(item => isTodayDate(item.submittedAt)).length;
  const funnel = analytics.funnel || {};
  return {
    publications,
    hhViews,
    hhResponses,
    hhResponsesToday,
    sentQuestionnaires,
    sentQuestionnairesToday,
    landingViews: funnel.visitors || 0,
    started: funnel.started || 0,
    completed: analytics.total || 0,
    completedToday,
    hhViewToResponse: hhViews ? pctText(hhResponses, hhViews) : "—",
    responseToQuestionnaire: hhResponses ? pctText(sentQuestionnaires, hhResponses) : "—",
    visitToComplete: funnel.visitToComplete !== undefined ? `${funnel.visitToComplete}%` : pctText(analytics.total || 0, funnel.visitors || 0),
    lastSyncAt: publications
      .map(item => item.payload?.hhMetrics?.fetchedAt || item.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) || null
  };
}

function funnelMetricLine(label, total, today, note = "") {
  return el("div", { class: "funnel-metric-line" }, [
    el("div", {}, [
      el("strong", {}, [label]),
      note ? el("span", {}, [note]) : el("span")
    ]),
    el("div", { class: "funnel-metric-values" }, [
      el("b", {}, [metricValue(total)]),
      el("em", {}, [`сегодня: ${metricValue(today)}`])
    ])
  ]);
}

function vacancyMetricsDashboard(analytics) {
  const metrics = vacancyChannelMetrics(analytics);
  const hasHhPublication = metrics.publications.some(item => item.hhVacancyId);
  const lastSync = metrics.lastSyncAt ? formatDateTime(metrics.lastSyncAt) : "еще не синхронизировалось";
  return el("section", { class: "table-panel vacancy-channel-dashboard" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Метрики воронки"]),
        el("span", {}, ["Всего за время работы воронки и отдельно за сегодня."])
      ]),
      hasHhPublication ? el("button", {
        class: "btn ghost",
        onclick: async () => {
          const publication = metrics.publications.find(item => item.hhVacancyId);
          if (!publication) return;
          await saveAndSyncHhResponses(publication);
        }
      }, ["Синхронизировать hh.ru"]) : el("span", { class: "muted" }, ["Вакансия hh.ru еще не привязана"])
    ]),
    el("div", { class: "funnel-metrics-card" }, [
      funnelMetricLine("Отклики hh.ru", metrics.hhResponses, metrics.hhResponsesToday, "кандидаты, откликнувшиеся на вакансию"),
      funnelMetricLine("Приглашения с анкетой", metrics.sentQuestionnaires, metrics.sentQuestionnairesToday, "кандидатам отправлена ссылка на опросник"),
      funnelMetricLine("Заполненные анкеты", metrics.completed, metrics.completedToday, `${metrics.visitToComplete} от переходов на опросник`)
    ]),
    el("p", { class: "channel-dashboard-note" }, [
      `Последняя синхронизация hh.ru: ${lastSync}. `,
      "Просмотры доступны только если hh.ru отдает их через подключение работодателя; отклики и анкеты считаются платформой."
    ])
  ]);
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
  const rowScore = item.funnelReview?.totalScore ?? item.score.total;
  const rowRecommendation = item.funnelReview?.recommendation || item.recommendation;
  const rowCode = rowRecommendation.code === "pending" ? item.recommendation.code : rowRecommendation.code;
  return el("div", { class: "candidate-row" }, [
    el("button", { class: "candidate-open", onclick: () => openSubmission(item.id) }, [
      el("div", {}, [
        el("strong", {}, [item.candidate.fullName || "Без имени"]),
        el("span", {}, [new Date(item.submittedAt).toLocaleString("ru-RU")])
      ]),
      el("div", { class: `score-badge ${rowCode}` }, [`${rowScore}`]),
      el("div", { class: `status-pill ${rowCode}` }, [rowRecommendation.label]),
      el("span", { class: "row-icon", html: icon("eye") })
    ]),
    isHrOrOwner() ? el("button", {
      class: "row-delete",
      title: "Удалить тестовую запись",
      "aria-label": `Удалить ${item.candidate.fullName || "кандидата"}`,
      onclick: () => deleteSubmission(item)
    }, [iconEl("trash")]) : el("div")
  ]);
}

function candidatesPanel(currentVacancyTitle) {
  const limit = 8;
  const total = state.submissions.length;
  const visible = state.candidateListExpanded ? state.submissions : state.submissions.slice(0, limit);
  return el("section", { class: "table-panel candidates-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Кандидаты"]),
        el("span", {}, [total ? `Показано ${visible.length} из ${total}` : "Нажмите на строку, чтобы открыть профиль"])
      ]),
      total > limit ? el("button", {
        class: "btn ghost",
        onclick: () => {
          state.candidateListExpanded = !state.candidateListExpanded;
          render();
        }
      }, [state.candidateListExpanded ? "Свернуть список" : `Показать всех: ${total}`]) : el("span", {}, ["Нажмите на строку, чтобы открыть профиль"])
    ]),
    ...(total ? visible.map(candidateRow) : [el("div", { class: "empty" }, [`Пока нет заполненных анкет по вакансии "${currentVacancyTitle}". Скопируйте ссылку выше и отправьте ее кандидату.`])])
  ]);
}

function testRefusalsReportPanel() {
  const refusals = (state.submissions || []).filter(item => item.testAssignment?.status === "refused");
  return el("section", { class: "table-panel test-refusals-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Отказы от тестового"]),
        el("span", {}, [refusals.length ? `Всего отказов: ${refusals.length}` : "Появится, если кандидат явно откажется выполнять задание."])
      ])
    ]),
    refusals.length
      ? el("div", { class: "test-refusal-list" }, refusals.map(item => el("button", { class: "test-refusal-row", onclick: () => openSubmission(item.id) }, [
        el("strong", {}, [item.candidate.fullName || "Без имени"]),
        el("span", {}, [item.testAssignment?.refusedAt ? formatDateTime(item.testAssignment.refusedAt) : "дата не указана"]),
        el("p", {}, [item.testAssignment?.refusalReason || "Причина не указана"]),
        el("em", {}, [item.funnelReview?.resumeReview?.hiddenPotential ? "Что делать: короткий созвон, резюме сильнее анкеты." : "Что делать: проверить резюме и принять ручное решение."])
      ])))
      : el("div", { class: "empty" }, ["Явных отказов от тестового пока нет."])
  ]);
}

async function openSubmission(id) {
  const response = await fetch(`/api/admin/submissions/${id}`);
  if (!response.ok) return showToast("Не удалось открыть карточку.");
  state.selected = (await response.json()).submission;
  render();
}

async function deleteSubmission(item) {
  const name = item.candidate.fullName || "этого кандидата";
  const confirmed = window.confirm(`Удалить запись "${name}"? Это действие нельзя отменить.`);
  if (!confirmed) return;
  const response = await fetch(`/api/admin/submissions/${item.id}`, { method: "DELETE" });
  if (!response.ok) return showToast("Не удалось удалить запись.");
  if (state.selected?.id === item.id) state.selected = null;
  await loadAdmin();
  showToast("Запись удалена.");
  render();
}

async function runAiInsights() {
  state.loading = true;
  render();
  const response = await fetch(`/api/admin/ai-insights?vacancy=${encodeURIComponent(state.adminVacancyCode || "smm")}`, { method: "POST" });
  state.loading = false;
  if (!response.ok) return showToast("ИИ HR не запустился.");
  state.aiInsights = (await response.json()).insights;
  render();
}

async function evaluateTestAssignmentForSelected(id) {
  state.loading = true;
  render();
  const response = await fetch(`/api/admin/submissions/${id}/test-assignment/evaluate`, { method: "POST" });
  state.loading = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось оценить тестовое задание." }));
    showToast(error.error || "Не удалось оценить тестовое задание.");
    render();
    return;
  }
  const data = await response.json();
  state.selected = data.submission;
  await loadAdmin();
  showToast("Оценка тестового задания готова.");
  render();
}

function canReviewTestAssignment() {
  return ["owner", "hr", "hiring_manager"].includes(state.user?.role);
}

function testManualDraft(item) {
  const review = item.testAssignment?.manualReview || {};
  if (!state.testManualDrafts[item.id]) {
    state.testManualDrafts[item.id] = {
      score: review.score ?? "",
      decision: review.decision || "",
      comment: review.comment || ""
    };
  }
  return state.testManualDrafts[item.id];
}

async function saveManualTestReview(item) {
  const draft = testManualDraft(item);
  const score = Number(draft.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    showToast("Укажите ручной балл от 0 до 100.");
    return;
  }
  const response = await fetch(`/api/admin/submissions/${item.id}/test-assignment/manual-review`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить ручную оценку." }));
    showToast(error.error || "Не удалось сохранить ручную оценку.");
    return;
  }
  const data = await response.json();
  state.selected = data.submission;
  state.testManualDrafts[item.id] = {
    score: data.submission.testAssignment?.manualReview?.score ?? "",
    decision: data.submission.testAssignment?.manualReview?.decision || "",
    comment: data.submission.testAssignment?.manualReview?.comment || ""
  };
  await loadAdmin();
  showToast("Оценка руководителя сохранена.");
  render();
}

function hrDecisionDraft(item) {
  const review = item.interview?.hrDecision || {};
  if (!state.hrDecisionDrafts[item.id]) {
    state.hrDecisionDrafts[item.id] = {
      decision: review.decision || "",
      comment: review.comment || ""
    };
  }
  return state.hrDecisionDrafts[item.id];
}

function hrDecisionLabel(value) {
  return {
    invite: "Пригласить на интервью",
    call: "Назначить короткий созвон",
    test: "Выдать тестовое",
    reject: "Отклонить",
    pool: "В резерв",
    hidden_potential: "Скрытый потенциал"
  }[value] || value || "—";
}

async function saveHrDecision(item, decision = "") {
  const draft = hrDecisionDraft(item);
  const nextDecision = decision || draft.decision;
  if (!nextDecision) return showToast("Выберите решение HR.");
  const response = await fetch(`/api/admin/submissions/${item.id}/hr-decision`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...draft, decision: nextDecision })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить решение HR." }));
    showToast(error.error || "Не удалось сохранить решение HR.");
    return;
  }
  const data = await response.json();
  state.selected = data.submission;
  state.hrDecisionDrafts[item.id] = {
    decision: data.submission.interview?.hrDecision?.decision || nextDecision,
    comment: data.submission.interview?.hrDecision?.comment || draft.comment || ""
  };
  await loadAdmin();
  showToast("Решение HR сохранено.");
  render();
}

function analyticsList(title, items, field) {
  const descriptions = {
    projectTypes: "Какие рынки и форматы чаще всего встречаются у кандидатов.",
    tools: "Какими рабочими сервисами владеет поток кандидатов.",
    metrics: "С какими показателями кандидаты регулярно работали."
  };
  return el("div", { class: "mini-panel" }, [
    el("h3", {}, [title]),
    descriptions[field] ? el("p", { class: "mini-panel-note" }, [descriptions[field]]) : el("div"),
    ...(items.length ? items.map(item => el("div", { class: "rank-row" }, [
      el("span", {}, [optionLabel(field, item.key)]),
      el("strong", {}, [String(item.count)])
    ])) : [el("p", { class: "muted empty-hint" }, ["Появится после первых заполненных анкет."])])
  ]);
}

function currentInterviewConfig() {
  return state.config?.interview || {};
}

function interviewCandidate() {
  const id = state.interviewCandidateId || state.submissions[0]?.id || "";
  return state.submissions.find(item => item.id === id) || state.submissions[0] || null;
}

function interviewDraft(candidate) {
  if (!candidate) return {};
  if (!state.interviewDrafts[candidate.id]) {
    state.interviewDrafts[candidate.id] = {
      status: "draft",
      interviewer: candidate.interview?.interviewer || state.user?.displayName || state.user?.username || "",
      interviewDate: candidate.interview?.interviewDate || new Date().toISOString().slice(0, 10),
      scriptNotes: { ...(candidate.interview?.scriptNotes || {}) },
      scorecard: { ...(candidate.interview?.scorecard || {}) },
      cases: { ...(candidate.interview?.cases || {}) },
      decision: { ...(candidate.interview?.decision || {}) },
      evaluation: candidate.interview?.evaluation || null
    };
  }
  return state.interviewDrafts[candidate.id];
}

function setInterviewDraft(candidate, updater) {
  if (!candidate) return;
  const draft = interviewDraft(candidate);
  updater(draft);
}

function updateSubmissionInState(updated) {
  state.submissions = state.submissions.map(item => item.id === updated.id ? updated : item);
  if (state.selected?.id === updated.id) state.selected = updated;
  state.interviewDrafts[updated.id] = {
    status: "draft",
    ...(updated.interview || {}),
    scriptNotes: { ...(updated.interview?.scriptNotes || {}) },
    scorecard: { ...(updated.interview?.scorecard || {}) },
    cases: { ...(updated.interview?.cases || {}) },
    decision: { ...(updated.interview?.decision || {}) }
  };
}

async function saveInterviewDraft(candidate, silent = false) {
  if (!candidate) return null;
  const response = await fetch(`/api/admin/submissions/${candidate.id}/interview`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interview: interviewDraft(candidate) })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить интервью." }));
    showToast(error.error || "Не удалось сохранить интервью.");
    return null;
  }
  const data = await response.json();
  updateSubmissionInState(data.submission);
  if (!silent) showToast("Заметки интервью сохранены.");
  return data.submission;
}

async function evaluateInterviewDraft(candidate) {
  if (!candidate) return;
  state.loading = true;
  render();
  const saved = await saveInterviewDraft(candidate, true);
  if (!saved) {
    state.loading = false;
    render();
    return;
  }
  const response = await fetch(`/api/admin/submissions/${candidate.id}/interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interview: interviewDraft(saved) })
  });
  state.loading = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось оценить интервью." }));
    showToast(error.error || "Не удалось оценить интервью.");
    render();
    return;
  }
  const data = await response.json();
  updateSubmissionInState(data.submission);
  await loadAdmin();
  showToast("Оценка интервью ИИ HR готова.");
  render();
}

function ratingSelect(value, onchange) {
  return el("select", { class: "rating-select", onchange }, [
    el("option", { value: "" }, ["Оценка"]),
    ...[1, 2, 3, 4, 5].map(score => el("option", { value: String(score), selected: Number(value) === score ? "selected" : null }, [`${score}`]))
  ]);
}

function interviewScriptPanel(interview) {
  return el("section", { class: "interview-script panel-card" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Скрипт интервью"]),
        el("span", {}, [interview.duration || "45-60 минут"])
      ])
    ]),
    el("div", { class: "script-note" }, [interview.sourceNote || "Структурированное интервью с проективными вопросами и кейсами."]),
    ...(interview.intro || []).map(text => el("p", { class: "script-lead" }, [text])),
    el("div", { class: "script-grid" }, (interview.structure || []).map(item => el("div", { class: "script-step" }, [
      el("strong", {}, [item.title]),
      el("span", {}, [item.timing || ""]),
      el("p", {}, [item.description || ""])
    ]))),
    el("div", { class: "script-block" }, [
      el("h3", {}, ["Принципы"]),
      ...(interview.principles || []).map(text => el("p", {}, [text]))
    ]),
    el("div", { class: "script-block" }, [
      el("h3", {}, ["Проективные вопросы"]),
      ...(interview.projectiveBlocks || []).map(block => el("details", { class: "script-details", open: "open" }, [
        el("summary", {}, [block.title]),
        ...(block.questions || []).map(question => el("div", { class: "script-question" }, [
          el("strong", {}, [question.text]),
          el("span", {}, [question.goal || ""])
        ]))
      ]))
    ]),
    el("div", { class: "script-block" }, [
      el("h3", {}, ["Кейсы"]),
      ...(interview.cases || []).map(item => el("details", { class: "script-details" }, [
        el("summary", {}, [item.title]),
        el("p", {}, [item.situation || ""]),
        el("ul", {}, (item.questions || []).map(text => el("li", {}, [text]))),
        el("span", { class: "script-source" }, [`Оцениваем: ${item.evaluates || ""}`])
      ]))
    ])
  ]);
}

function interviewCandidateSelector(candidate) {
  return el("label", { class: "named-input interview-candidate-select" }, [
    el("span", {}, ["Кандидат для интервью"]),
    el("select", {
      class: "input",
      value: candidate?.id || "",
      onchange: event => {
        state.interviewCandidateId = event.target.value;
        render();
      }
    }, [
      ...(state.submissions.length ? state.submissions.map(item => el("option", {
        value: item.id,
        selected: item.id === candidate?.id ? "selected" : null
      }, [`${item.candidate.fullName || "Без имени"} · ${item.score?.total || 0}/100`])) : [
        el("option", { value: "" }, ["Кандидатов пока нет"])
      ])
    ])
  ]);
}

function interviewMetaFields(candidate, draft) {
  return el("div", { class: "interview-meta-grid" }, [
    el("label", { class: "named-input" }, [
      el("span", {}, ["Кто проводит интервью"]),
      el("input", {
        class: "input",
        value: draft.interviewer || "",
        placeholder: "HR или руководитель",
        oninput: event => setInterviewDraft(candidate, current => { current.interviewer = event.target.value; })
      })
    ]),
    el("label", { class: "named-input" }, [
      el("span", {}, ["Дата интервью"]),
      el("input", {
        class: "input",
        type: "date",
        value: draft.interviewDate || "",
        oninput: event => setInterviewDraft(candidate, current => { current.interviewDate = event.target.value; })
      })
    ])
  ]);
}

function interviewQuestionNotes(candidate, draft, interview) {
  return el("section", { class: "interview-form-section" }, [
    el("h3", {}, ["Заметки по проективным вопросам"]),
    ...(interview.projectiveBlocks || []).map(block => el("details", { class: "interview-note-group" }, [
      el("summary", {}, [block.title]),
      ...(block.questions || []).map(question => {
        const value = draft.scriptNotes?.[question.id] || {};
        return el("div", { class: "interview-question-card" }, [
          el("strong", {}, [question.text]),
          question.goal ? el("span", {}, [question.goal]) : el("span"),
          el("textarea", {
            class: "input",
            placeholder: "Ключевые ответы, факты, цитаты кандидата",
            oninput: event => setInterviewDraft(candidate, current => {
              current.scriptNotes = current.scriptNotes || {};
              current.scriptNotes[question.id] = { ...(current.scriptNotes[question.id] || {}), notes: event.target.value };
            })
          }, [value.notes || ""]),
          el("input", {
            class: "input",
            value: value.conclusion || "",
            placeholder: "Короткий вывод по вопросу",
            oninput: event => setInterviewDraft(candidate, current => {
              current.scriptNotes = current.scriptNotes || {};
              current.scriptNotes[question.id] = { ...(current.scriptNotes[question.id] || {}), conclusion: event.target.value };
            })
          })
        ]);
      })
    ]))
  ]);
}

function interviewScorecard(candidate, draft, interview) {
  return el("section", { class: "interview-form-section" }, [
    el("h3", {}, ["Оценка компетенций"]),
    ...(interview.scorecard || []).map(item => {
      const value = draft.scorecard?.[item.id] || {};
      return el("div", { class: "scorecard-item" }, [
        el("div", { class: "scorecard-head" }, [
          el("div", {}, [
            el("strong", {}, [item.title]),
            el("p", {}, [item.description || ""])
          ]),
          ratingSelect(value.score, event => setInterviewDraft(candidate, current => {
            current.scorecard = current.scorecard || {};
            current.scorecard[item.id] = { ...(current.scorecard[item.id] || {}), score: Number(event.target.value || 0) };
          }))
        ]),
        item.sources ? el("span", { class: "script-source" }, [`Источник проверки: ${item.sources}`]) : el("span"),
        el("textarea", {
          class: "input",
          placeholder: "Факты, цитаты и наблюдения по этой компетенции",
          oninput: event => setInterviewDraft(candidate, current => {
            current.scorecard = current.scorecard || {};
            current.scorecard[item.id] = { ...(current.scorecard[item.id] || {}), notes: event.target.value };
          })
        }, [value.notes || ""])
      ]);
    })
  ]);
}

function interviewCaseNotes(candidate, draft, interview) {
  return el("section", { class: "interview-form-section" }, [
    el("h3", {}, ["Разбор кейсов"]),
    ...(interview.cases || []).map(item => {
      const value = draft.cases?.[item.id] || {};
      return el("div", { class: "case-card" }, [
        el("div", { class: "scorecard-head" }, [
          el("div", {}, [
            el("strong", {}, [item.title]),
            el("p", {}, [item.situation || ""])
          ]),
          ratingSelect(value.score, event => setInterviewDraft(candidate, current => {
            current.cases = current.cases || {};
            current.cases[item.id] = { ...(current.cases[item.id] || {}), score: Number(event.target.value || 0) };
          }))
        ]),
        el("ul", {}, (item.questions || []).map(text => el("li", {}, [text]))),
        el("textarea", {
          class: "input",
          placeholder: "Ключевые решения и аргументы кандидата",
          oninput: event => setInterviewDraft(candidate, current => {
            current.cases = current.cases || {};
            current.cases[item.id] = { ...(current.cases[item.id] || {}), decisions: event.target.value };
          })
        }, [value.decisions || ""]),
        el("textarea", {
          class: "input",
          placeholder: "Сильные стороны в кейсе",
          oninput: event => setInterviewDraft(candidate, current => {
            current.cases = current.cases || {};
            current.cases[item.id] = { ...(current.cases[item.id] || {}), strengths: event.target.value };
          })
        }, [value.strengths || ""]),
        el("textarea", {
          class: "input",
          placeholder: "Риски / слабые места",
          oninput: event => setInterviewDraft(candidate, current => {
            current.cases = current.cases || {};
            current.cases[item.id] = { ...(current.cases[item.id] || {}), risks: event.target.value };
          })
        }, [value.risks || ""])
      ]);
    })
  ]);
}

function interviewDecisionFields(candidate, draft, interview) {
  return el("section", { class: "interview-form-section" }, [
    el("h3", {}, ["Итоги интервью"]),
    ...(interview.decisionFields || []).map(field => {
      const value = draft.decision?.[field.id] || "";
      if (field.type === "select") {
        return el("label", { class: "named-input" }, [
          el("span", {}, [field.title]),
          el("select", {
            class: "input",
            onchange: event => setInterviewDraft(candidate, current => {
              current.decision = current.decision || {};
              current.decision[field.id] = event.target.value;
            })
          }, [
            el("option", { value: "" }, ["Не выбрано"]),
            ...(field.options || []).map(option => el("option", { value: option, selected: value === option ? "selected" : null }, [option]))
          ])
        ]);
      }
      if (field.type === "text") {
        return el("label", { class: "named-input" }, [
          el("span", {}, [field.title]),
          el("input", {
            class: "input",
            value,
            oninput: event => setInterviewDraft(candidate, current => {
              current.decision = current.decision || {};
              current.decision[field.id] = event.target.value;
            })
          })
        ]);
      }
      return el("label", { class: "named-input" }, [
        el("span", {}, [field.title]),
        el("textarea", {
          class: "input",
          oninput: event => setInterviewDraft(candidate, current => {
            current.decision = current.decision || {};
            current.decision[field.id] = event.target.value;
          })
        }, [value])
      ]);
    })
  ]);
}

function interviewEvaluationPanel(candidate, draft) {
  const evaluation = draft.evaluation || candidate?.interview?.evaluation;
  return el("section", { class: "interview-form-section interview-result" }, [
    el("h3", {}, ["Оценка интервью ИИ HR"]),
    evaluation ? el("div", { class: "ai-box" }, [
      el("span", { class: "mode" }, [modelModeLabel(evaluation.mode)]),
      answerLine("Балл интервью", `${evaluation.score || 0}/100`),
      el("p", {}, [evaluation.summary || ""]),
      ...(evaluation.strengths || []).map(text => el("p", {}, [`Сильная сторона: ${text}`])),
      ...(evaluation.risks || []).map(text => el("p", { class: "risk-text" }, [`Риск: ${text}`])),
      evaluation.recommendation ? el("p", {}, [`Решение: ${evaluation.recommendation}`]) : el("div"),
      ...(evaluation.nextSteps || []).map(text => el("p", {}, [`Следующий шаг: ${text}`])),
      ...(evaluation.interviewQuestionsToClarify || []).map(text => el("p", {}, [`Уточнить: ${text}`]))
    ]) : el("p", { class: "muted" }, ["Заполните оценочный лист и запустите оценку ИИ HR. Если ИИ HR недоступен, система посчитает локальную оценку по баллам 1-5."])
  ]);
}

function interviewFormPanel(candidate, interview) {
  if (!candidate) {
    return el("section", { class: "interview-form panel-card" }, [
      el("h2", {}, ["Оценочный лист"]),
      el("div", { class: "empty" }, ["Пока нет кандидатов по этой вакансии. Когда появятся анкеты, здесь можно будет проводить интервью и сохранять оценки."])
    ]);
  }
  const draft = interviewDraft(candidate);
  return el("section", { class: "interview-form panel-card" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Оценочный лист"]),
        el("span", {}, [`${candidate.candidate.fullName || "Без имени"} · анкета ${candidate.score?.total || 0}/100`])
      ]),
      el("div", { class: "top-actions" }, [
        el("button", { class: "btn ghost", onclick: () => saveInterviewDraft(candidate) }, ["Сохранить"]),
        el("button", { class: "btn primary", onclick: () => evaluateInterviewDraft(candidate) }, [iconEl("spark"), "Оценить ИИ"])
      ])
    ]),
    interviewMetaFields(candidate, draft),
    interviewScorecard(candidate, draft, interview),
    interviewQuestionNotes(candidate, draft, interview),
    interviewCaseNotes(candidate, draft, interview),
    interviewDecisionFields(candidate, draft, interview),
    interviewEvaluationPanel(candidate, draft)
  ]);
}

function interviewWorkspaceView() {
  const interview = currentInterviewConfig();
  const candidate = interviewCandidate();
  if (candidate && !state.interviewCandidateId) state.interviewCandidateId = candidate.id;
  return el("section", { class: "interview-page" }, [
    el("header", { class: "dash-header interview-hero" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("user"), `Вакансия: ${vacancyLabel(state.adminVacancyCode)}`]),
        el("h1", {}, [interview.title || `Интервью: ${vacancyLabel(state.adminVacancyCode)}`]),
        el("p", {}, [interview.subtitle || "Сценарий и оценочный лист для структурированного интервью."])
      ]),
      interviewCandidateSelector(candidate)
    ]),
    el("div", { class: "interview-layout" }, [
      interviewScriptPanel(interview),
      interviewFormPanel(candidate, interview)
    ])
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
    ["Сильные кандидаты", analytics.statusCounts?.green || 0, "green"],
    ["Ручная проверка", analytics.statusCounts?.yellow || 0, "yellow"],
    ["Резерв", analytics.statusCounts?.orange || 0, "orange"],
    ["Отказ", analytics.statusCounts?.red || 0, "red"]
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
      ])
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
        el("h2", {}, ["Рекомендации"]),
        aiRecommendationList(analytics.recommendations || [], "platform"),
        state.aiInsights ? el("div", { class: "ai-box" }, [
          el("span", { class: "mode" }, [modelModeLabel(state.aiInsights.mode)]),
          el("strong", {}, [state.aiInsights.summary || ""]),
          el("h3", {}, ["Рекомендации ИИ HR"]),
          aiRecommendationList(state.aiInsights.recommendations || [], "ai"),
          ...(state.aiInsights.interviewFocus || []).map(text => el("p", {}, [`Интервью: ${text}`])),
          ...(state.aiInsights.risks || []).map(text => el("p", { class: "risk-text" }, [text]))
        ]) : el("p", { class: "muted" }, ["Нажмите «Спросить ИИ HR», чтобы получить интерпретацию потока."])
      ])
    ])
  ]);
}

function toggleStaffVacancy(code, checked) {
  const current = new Set(state.staffForm.vacancyAccess || []);
  if (checked) current.add(code);
  else current.delete(code);
  state.staffForm.vacancyAccess = [...current];
  render();
}

async function createStaffUser() {
  const payload = {
    email: state.staffForm.email.trim(),
    displayName: state.staffForm.displayName.trim(),
    role: state.staffForm.role,
    password: state.staffForm.password,
    vacancyAccess: state.staffForm.role === "hiring_manager" ? state.staffForm.vacancyAccess : []
  };
  if (!payload.email || !payload.password) {
    showToast("Укажите почту и пароль сотрудника.");
    return;
  }
  if (payload.password.length < 8) {
    showToast("Пароль должен быть не короче 8 символов.");
    return;
  }
  if (payload.role === "hiring_manager" && payload.vacancyAccess.length === 0) {
    showToast("Для руководителя-заказчика выберите хотя бы одну вакансию.");
    return;
  }
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось добавить сотрудника." }));
    showToast(error.error || "Не удалось добавить сотрудника.");
    return;
  }
  state.staffForm = { email: "", displayName: "", role: "hr", password: "", vacancyAccess: [] };
  await loadAdmin();
  showToast("Сотрудник добавлен.");
  render();
}

async function updateStaffPassword(user) {
  const password = String(state.staffPasswordDrafts[user.id] || "").trim();
  if (!password) {
    showToast("Введите новый пароль для этой учетной записи.");
    return;
  }
  if (password.length < 8) {
    showToast("Пароль должен быть не короче 8 символов.");
    return;
  }
  const response = await fetch(`/api/admin/users/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сменить пароль." }));
    showToast(error.error || "Не удалось сменить пароль.");
    return;
  }
  state.staffPasswordDrafts[user.id] = "";
  await loadAdmin();
  showToast(`Пароль для ${user.email || user.username} обновлен.`);
  render();
}

function staffManagementView() {
  const vacancies = Object.entries(state.vacancies || {});
  return el("section", { class: "staff-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("user"), "Личный кабинет владельца"]),
        el("h1", {}, ["Сотрудники и доступы"]),
        el("p", {}, ["Добавляйте сотрудников по почте и назначайте роль. Руководитель-заказчик видит только выбранные вакансии."])
      ])
    ]),
    el("section", { class: "table-panel staff-form" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Создать учетную запись сотрудника"]),
        el("span", {}, ["Для нового сотрудника задается отдельный логин и начальный пароль."])
      ]),
      el("p", { class: "muted staff-help" }, [
        "Это не пароль владельца и не общий пароль админки. Введите почту сотрудника, выберите роль и задайте начальный пароль, который сотрудник будет использовать для входа."
      ]),
      el("div", { class: "staff-form-grid" }, [
        el("label", { class: "named-input staff-field" }, [
          el("span", {}, ["Логин сотрудника"]),
          el("input", {
            class: "input compact-input",
            type: "email",
            placeholder: "Например: hr@praktiki.pro",
            value: state.staffForm.email,
            oninput: event => { state.staffForm.email = event.target.value; }
          }),
          el("small", {}, ["Обычно это рабочая почта. Именно ее сотрудник вводит при входе."])
        ]),
        el("label", { class: "named-input staff-field" }, [
          el("span", {}, ["Имя в списке сотрудников"]),
          el("input", {
            class: "input compact-input",
            placeholder: "Например: HR или Иван Петров",
            value: state.staffForm.displayName,
            oninput: event => { state.staffForm.displayName = event.target.value; }
          }),
          el("small", {}, ["Это подпись для владельца в админке, не влияет на вход."])
        ]),
        el("label", { class: "named-input staff-field" }, [
          el("span", {}, ["Роль и права доступа"]),
          el("select", {
            class: "input compact-input",
            value: state.staffForm.role,
            onchange: event => {
              state.staffForm.role = event.target.value;
              if (state.staffForm.role !== "hiring_manager") state.staffForm.vacancyAccess = [];
              render();
            }
          }, [
            el("option", { value: "hr", selected: state.staffForm.role === "hr" ? "selected" : null }, ["HR: все вакансии"]),
            el("option", { value: "hiring_manager", selected: state.staffForm.role === "hiring_manager" ? "selected" : null }, ["Руководитель-заказчик: только выбранные вакансии"])
          ]),
          el("small", {}, ["HR видит все воронки. Руководителю ниже нужно выбрать конкретные вакансии."])
        ]),
        el("label", { class: "named-input staff-field" }, [
          el("span", {}, ["Начальный пароль сотрудника"]),
          el("input", {
            class: "input compact-input",
            type: "password",
            placeholder: "Минимум 8 символов",
            value: state.staffForm.password,
            oninput: event => { state.staffForm.password = event.target.value; }
          }),
          el("small", {}, ["Этот пароль будет записан для новой учетной записи. После сохранения посмотреть его нельзя, можно только задать новый."])
        ])
      ]),
      state.staffForm.role === "hiring_manager" ? el("div", { class: "staff-vacancy-access" }, [
        el("strong", {}, ["Доступ к вакансиям"]),
        ...vacancies.map(([code, vacancy]) => {
          const checked = state.staffForm.vacancyAccess.includes(code);
          return el("label", { class: `choice compact-choice ${checked ? "selected" : ""}` }, [
            el("input", {
              type: "checkbox",
              checked: checked ? "checked" : null,
              onchange: event => toggleStaffVacancy(code, event.target.checked)
            }),
            el("span", { html: checked ? icon("check") : "" }),
            el("strong", {}, [vacancy.adminTitle || vacancy.title || code])
          ]);
        })
      ]) : el("p", { class: "muted staff-help" }, ["Вы выбрали роль HR: этот сотрудник получит доступ к админкам по всем вакансиям и сможет работать с кандидатами во всех воронках."]),
      el("button", { class: "btn primary", onclick: createStaffUser }, ["Добавить сотрудника"])
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Текущие учетные записи"]),
        el("span", {}, [`Всего: ${state.adminUsers.length}`])
      ]),
      ...(state.adminUsers.length ? state.adminUsers.map(user => el("div", { class: "staff-account-row" }, [
        el("div", {}, [
          el("strong", {}, [user.displayName || user.email || user.username]),
          el("span", {}, [`Логин для входа: ${user.email || user.username}`]),
          user.role === "owner" ? el("span", {}, ["Это учетная запись владельца. У владельца полный доступ ко всем настройкам."]) : el("span", {}, ["Старый пароль не отображается из соображений безопасности."])
        ]),
        el("div", {}, [
          el("strong", {}, [roleLabel(user.role)]),
          el("span", {}, [
            user.role === "owner"
              ? "полный доступ владельца"
              : user.role === "hr"
                ? "доступ ко всем вакансиям"
                : ((user.vacancyAccess || []).map(code => vacancyLabel(code)).join(", ") || "нет выбранных вакансий")
          ])
        ]),
        el("div", {}, [
          el("div", { class: `status-pill ${user.active ? "green" : "red"}` }, [user.active ? "активен" : "выключен"]),
          el("span", {}, ["Статус доступа к админке"])
        ]),
        el("div", { class: "staff-password-reset" }, [
          el("label", { class: "named-input staff-field" }, [
            el("span", {}, ["Задать новый пароль"]),
            el("input", {
              class: "input compact-input",
              type: "password",
              placeholder: "Новый пароль",
              value: state.staffPasswordDrafts[user.id] || "",
              oninput: event => { state.staffPasswordDrafts[user.id] = event.target.value; }
            }),
            el("small", {}, ["Нажмите кнопку ниже, и этот пароль станет актуальным для выбранного логина."])
          ]),
          el("button", { class: "btn ghost", onclick: () => updateStaffPassword(user) }, ["Сменить пароль"])
        ])
      ])) : [el("div", { class: "empty" }, ["Пользователи еще не добавлены."])])
    ])
  ]);
}

function auditLogView() {
  return el("section", { class: "audit-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("list"), "Контроль"]),
        el("h1", {}, ["Журнал действий"]),
        el("p", {}, ["Здесь фиксируются входы, изменения сотрудников, удаление кандидатов, анализ ИИ HR и оценка тестовых."])
      ])
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Последние действия"]),
        el("button", { class: "btn ghost", onclick: async () => { await loadAdmin(); render(); } }, ["Обновить"])
      ]),
      ...(state.auditLogs.length ? state.auditLogs.map(log => el("div", { class: "audit-row" }, [
        el("div", {}, [
          el("strong", {}, [auditActionLabel(log.action)]),
          el("span", {}, [new Date(log.createdAt).toLocaleString("ru-RU")])
        ]),
        el("div", {}, [log.username || "система"]),
        el("div", {}, [roleLabel(log.role)]),
        el("div", {}, [log.vacancyCode ? vacancyLabel(log.vacancyCode) : "—"])
      ])) : [el("div", { class: "empty" }, ["Журнал пока пуст."])])
    ])
  ]);
}

function auditActionLabel(action) {
  const labels = {
    "auth.login": "Вход в админку",
    "auth.logout": "Выход",
    "user.create": "Создание сотрудника",
    "user.update": "Изменение сотрудника",
    "submission.delete": "Удаление кандидата",
    "test_assignment.evaluate": "Оценка тестового",
    "test_assignment.manual_review": "Оценка руководителя",
    "analytics.ai_insights": "Анализ ИИ HR",
    "vacancy.create": "Создание вакансии",
    "questionnaire.questions.update": "Изменение опросника вакансии",
    "config.update": "Изменение методологии"
  };
  return labels[action] || action;
}

function vacancyOptions(selectedCode) {
  return Object.entries(state.vacancies || {}).map(([code, vacancy]) => (
    el("option", { value: code, selected: selectedCode === code ? "selected" : null }, [vacancy.adminTitle || vacancy.title || code])
  ));
}

function recruitmentChannelLabel(channel) {
  if (channel === "hh") return "HeadHunter";
  if (channel === "telegram") return "Telegram-чаты";
  return channel || "—";
}

function recruitmentChannelsText(channels = []) {
  return channels.length ? channels.map(recruitmentChannelLabel).join(", ") : "каналы не выбраны";
}

const OPENING_REASON_OPTIONS = [
  "Расширение команды",
  "Замена сотрудника",
  "Сотрудник уходит или уже ушел",
  "Рост объема задач",
  "Запуск нового проекта или направления",
  "Усиление слабого участка работы",
  "Временная нагрузка или сезонный пик",
  "Формирование новой функции с нуля",
  "Кадровый резерв на ближайший запуск"
];

function openingReasonPicker(form) {
  const selectedPreset = OPENING_REASON_OPTIONS.includes(form.reason) && form.reasonMode !== "other" ? form.reason : "";
  const isOther = form.reasonMode === "other" || (form.reason && !OPENING_REASON_OPTIONS.includes(form.reason));
  return el("label", { class: "named-input reason-picker" }, [
    el("span", {}, ["Причина открытия"]),
    el("select", {
      class: "input compact-input",
      value: isOther ? "__other__" : selectedPreset,
      onchange: event => {
        if (event.target.value === "__other__") {
          form.reasonMode = "other";
          form.reason = "";
        } else {
          form.reasonMode = "preset";
          form.reason = event.target.value;
        }
        render();
      }
    }, [
      el("option", { value: "" }, ["Причина открытия"]),
      ...OPENING_REASON_OPTIONS.map(reason => el("option", {
        value: reason,
        selected: selectedPreset === reason ? "selected" : null
      }, [reason])),
      el("option", { value: "__other__", selected: isOther ? "selected" : null }, ["Другое"])
    ]),
    el("small", { class: "field-hint" }, ["Выберите, почему нужно открыть подбор. Это поможет HR правильно оформить запуск."]),
    isOther ? el("input", {
      class: "input compact-input",
      placeholder: "Введите свою причину",
      value: form.reason || "",
      oninput: event => { form.reason = event.target.value; }
    }) : el("div"),
    isOther ? el("small", { class: "field-hint" }, ["Кратко опишите причину своими словами."]) : el("div")
  ]);
}

function adminField(label, hint, control) {
  return el("label", { class: "named-input admin-form-field" }, [
    el("span", {}, [label]),
    control,
    hint ? el("small", { class: "field-hint" }, [hint]) : el("small", { class: "field-hint" }, [""])
  ]);
}

function adminInputField(label, hint, attrs) {
  return adminField(label, hint, el("input", attrs));
}

function vacancySelectControl(value, onChange) {
  return el("select", { class: "input compact-input", value, onchange: onChange }, [
    el("option", { value: "" }, ["Выберите вакансию"]),
    ...vacancyOptions(value)
  ]);
}

function hiringVacancyField() {
  return adminField(
    "Готовая вакансия",
    "Выберите позицию из справочника, если она уже заведена в системе.",
    vacancySelectControl(state.hiringRequestForm.vacancyCode, event => {
      state.hiringRequestForm.vacancyCode = event.target.value;
    })
  );
}

function desiredStartDateField(form) {
  return adminInputField("Желаемый срок выхода", "Можно указать точную дату или ориентир по сроку: как можно скорее, в течение месяца.", {
    class: "input compact-input",
    placeholder: "Например: в течение месяца",
    value: form.desiredStartDate,
    oninput: event => { form.desiredStartDate = event.target.value; }
  });
}

function commentField(form) {
  return adminInputField("Комментарий", "Добавьте важные детали: ограничения, пожелания руководителя, особенности команды.", {
    class: "input compact-input",
    placeholder: "Необязательно",
    value: form.comment || "",
    oninput: event => { form.comment = event.target.value; }
  });
}

function openingVacancyField() {
  return adminField(
    "Вакансия",
    "Выберите готовую позицию, по которой нужно запустить рабочую воронку.",
    vacancySelectControl(state.openingForm.vacancyCode, event => {
      state.openingForm.vacancyCode = event.target.value;
    })
  );
}

function toggleRecruitmentChannel(form, channel) {
  const current = Array.isArray(form.recruitmentChannels) ? form.recruitmentChannels : [];
  form.recruitmentChannels = current.includes(channel)
    ? current.filter(item => item !== channel)
    : [...current, channel];
  render();
}

function recruitmentChannelPicker(form) {
  const selected = Array.isArray(form.recruitmentChannels) ? form.recruitmentChannels : [];
  return el("div", { class: "channel-picker" }, [
    el("span", { class: "channel-picker-title" }, ["Каналы подбора"]),
    ...[
      { id: "hh", title: "HeadHunter", note: "текст вакансии для проверки и публикации" },
      { id: "telegram", title: "Telegram-чаты", note: "пост в чат и личное сообщение кандидату" }
    ].map(channel => el("button", {
      type: "button",
      class: `channel-option ${selected.includes(channel.id) ? "selected" : ""}`,
      onclick: () => toggleRecruitmentChannel(form, channel.id)
    }, [
      el("span", { class: "fake-check" }, [selected.includes(channel.id) ? "✓" : ""]),
      el("strong", {}, [channel.title]),
      el("em", {}, [channel.note])
    ]))
  ]);
}

async function createHiringRequestFromAdmin() {
  const payload = { ...state.hiringRequestForm, requestType: "start_existing", title: "", headcount: 1 };
  if (!payload.vacancyCode) return showToast("Выберите вакансию из справочника.");
  const response = await fetch("/api/admin/hiring-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось создать заявку." }));
    return showToast(error.error || "Не удалось создать заявку.");
  }
  state.hiringRequestForm = { requestType: "start_existing", vacancyCode: "", title: "", reason: "", reasonMode: "preset", urgency: "normal", desiredStartDate: "", headcount: 1, responsibilities: "", expectedResult: "", budget: "", comment: "" };
  await loadAdmin();
  showToast("Заявка на подбор создана.");
  render();
}

async function createOpeningFromAdmin() {
  const payload = { ...state.openingForm };
  if (!payload.vacancyCode) return showToast("Выберите вакансию.");
  if (!payload.recruitmentChannels?.length) return showToast("Выберите хотя бы один канал подбора.");
  const response = await fetch("/api/admin/vacancy-openings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось запустить подбор." }));
    return showToast(error.error || "Не удалось запустить подбор.");
  }
  state.openingForm = { vacancyCode: "", reason: "", reasonMode: "preset", urgency: "normal", desiredStartDate: "", headcount: 1, recruitmentChannels: ["hh"] };
  await loadAdmin();
  showToast("Запуск подбора создан.");
  render();
}

function resetVacancyWizard() {
  state.vacancyWizard = {
    active: false,
    step: "input",
    sourceText: "",
    questions: [],
    answers: {},
    questionIndex: 0,
    draft: null,
    loading: false,
    listening: false
  };
}

function openVacancyWizard() {
  state.vacancyWizard.active = true;
  state.vacancyWizard.step = "input";
  render();
}

function closeVacancyWizard() {
  resetVacancyWizard();
  render();
}

function combinedVacancyBrief() {
  const wizard = state.vacancyWizard;
  const answerText = (wizard.questions || [])
    .map((question, index) => {
      const answer = wizard.answers[index];
      return answer ? `${question}\n${answer}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  return [wizard.sourceText, answerText].filter(Boolean).join("\n\n");
}

async function analyzeVacancyWizard(forceDraft = false) {
  const wizard = state.vacancyWizard;
  const text = combinedVacancyBrief().trim();
  if (text.length < 20) return showToast("Опишите роль хотя бы несколькими предложениями.");
  wizard.loading = true;
  render();
  const response = await fetch("/api/admin/vacancy-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText: text,
      forceDraft,
      answers: wizard.answers
    })
  });
  wizard.loading = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось подготовить вакансию." }));
    showToast(error.error || "Не удалось подготовить вакансию.");
    render();
    return;
  }
  const data = await response.json();
  if (!data.complete && data.questions?.length) {
    wizard.questions = data.questions;
    wizard.questionIndex = 0;
    wizard.step = "questions";
    showToast("Нужно уточнить несколько вводных по роли.");
  } else {
    wizard.draft = data.draft;
    wizard.step = "draft";
    showToast(data.mode === "local" ? "Черновик вакансии подготовлен локально." : "ИИ HR подготовил черновик вакансии.");
  }
  render();
}

function setVacancyWizardAnswer(value) {
  state.vacancyWizard.answers[state.vacancyWizard.questionIndex] = value;
}

function nextVacancyWizardQuestion() {
  const wizard = state.vacancyWizard;
  const answer = String(wizard.answers[wizard.questionIndex] || "").trim();
  if (answer.length < 3) return showToast("Ответьте на текущий вопрос.");
  if (wizard.questionIndex < wizard.questions.length - 1) {
    wizard.questionIndex += 1;
    render();
    return;
  }
  analyzeVacancyWizard(true);
}

function previousVacancyWizardQuestion() {
  const wizard = state.vacancyWizard;
  if (wizard.questionIndex > 0) {
    wizard.questionIndex -= 1;
    render();
  } else {
    wizard.step = "input";
    render();
  }
}

function startVacancyDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return showToast("Диктовка в этом браузере недоступна. Можно ввести текст вручную.");
  const recognition = new SpeechRecognition();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  state.vacancyWizard.listening = true;
  render();
  recognition.onresult = event => {
    const text = Array.from(event.results || [])
      .map(result => result[0]?.transcript || "")
      .join(" ")
      .trim();
    if (text) {
      state.vacancyWizard.sourceText = [state.vacancyWizard.sourceText, text].filter(Boolean).join(" ");
    }
  };
  recognition.onerror = () => showToast("Не удалось распознать речь. Попробуйте еще раз или введите текст.");
  recognition.onend = () => {
    state.vacancyWizard.listening = false;
    render();
  };
  recognition.start();
}

async function saveVacancyWizardDraft() {
  const draft = state.vacancyWizard.draft;
  if (!draft) return showToast("Сначала подготовьте черновик вакансии.");
  state.vacancyWizard.loading = true;
  render();
  const response = await fetch("/api/admin/vacancies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft })
  });
  state.vacancyWizard.loading = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить вакансию." }));
    showToast(error.error || "Не удалось сохранить вакансию.");
    render();
    return;
  }
  const data = await response.json();
  resetVacancyWizard();
  state.adminVacancyCode = data.vacancyCode;
  state.config = null;
  state.questionnaireDraft = null;
  state.questionnaireDraftVacancyCode = "";
  state.openingForm.vacancyCode = data.vacancyCode;
  state.vacancyReviewPrompt = {
    vacancyCode: data.vacancyCode,
    title: data.vacancy?.title || data.config?.publicTitle || "Новая вакансия",
    hhText: data.config?.vacancyArtifacts?.hhText || "",
    roleProfile: data.config?.vacancyArtifacts?.roleProfile || "",
    responsibilities: data.config?.vacancyArtifacts?.responsibilities || [],
    showDialog: true
  };
  await loadAdmin();
  state.vacancyReviewPrompt = {
    ...(state.vacancyReviewPrompt || {}),
    vacancyCode: data.vacancyCode,
    title: data.vacancy?.title || data.config?.publicTitle || "Новая вакансия",
    hhText: data.config?.vacancyArtifacts?.hhText || "",
    roleProfile: data.config?.vacancyArtifacts?.roleProfile || "",
    responsibilities: data.config?.vacancyArtifacts?.responsibilities || [],
    showDialog: true
  };
  render();
}

async function createHhTextForOpening(opening) {
  const response = await fetch("/api/admin/hh-texts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vacancyCode: opening.vacancyCode, openingId: opening.id, title: opening.title })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось создать текст HeadHunter." }));
    return showToast(error.error || "Не удалось создать текст HeadHunter.");
  }
  await loadAdmin();
  showToast("Черновик текста HeadHunter создан.");
  render();
}

async function createHhPublicationFromText(text) {
  const response = await fetch("/api/admin/hh-publications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vacancyCode: text.vacancyCode, openingId: text.openingId, hhTextId: text.id, status: "manual_ready" })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось создать публикацию." }));
    return showToast(error.error || "Не удалось создать публикацию.");
  }
  await loadAdmin();
  showToast("Публикация HeadHunter создана как готовая к ручному размещению.");
  render();
}

async function attachExistingHhVacancy() {
  const form = state.hhExistingPublicationForm;
  const vacancyCode = String(form.vacancyCode || "").trim();
  const url = String(form.url || "").trim();
  const hhVacancyId = String(form.hhVacancyId || extractHhVacancyId(url) || "").trim();
  if (!vacancyCode) return showToast("Выберите вакансию на нашей платформе: специалист по соцсетям или менеджер проектов.");
  if (!hhVacancyId) return showToast("Вставьте ссылку на вакансию HeadHunter или ее ID.");
  const response = await fetch("/api/admin/hh-publications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vacancyCode,
      hhVacancyId,
      url,
      status: "published",
      note: "Существующая вакансия HeadHunter подключена вручную"
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось подцепить вакансию HeadHunter." }));
    return showToast(error.error || "Не удалось подцепить вакансию HeadHunter.");
  }
  const data = await response.json();
  state.hhExistingPublicationForm = { vacancyCode: "", url: "", hhVacancyId: "" };
  await loadAdmin();
  showToast("Вакансия HeadHunter подцеплена к нашей платформе.");
  render();
  if (data.publication?.id) await syncHhResponses(data.publication);
}

async function connectHeadHunter() {
  const response = await fetch("/api/admin/hh/oauth-url");
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "HeadHunter API не настроен." }));
    return showToast(error.error || "HeadHunter API не настроен.");
  }
  const data = await response.json();
  location.href = data.url;
}

async function setupHhWebhook() {
  const response = await fetch("/api/admin/hh/webhook/setup", { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось настроить webhook HeadHunter." }));
    return showToast(error.error || "Не удалось настроить webhook HeadHunter.");
  }
  await loadAdmin();
  showToast("Автоматический прием событий hh.ru настроен.");
  render();
}

async function importActiveHhVacancies() {
  if (state.hhImporting) return;
  state.hhImporting = true;
  state.hhImportResult = null;
  render();
  const response = await fetch("/api/admin/hh/import-active-vacancies", { method: "POST" });
  state.hhImporting = false;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось загрузить вакансии HeadHunter." }));
    state.hhImportResult = { error: error.error || "Не удалось загрузить вакансии HeadHunter." };
    showToast(state.hhImportResult.error);
    render();
    return;
  }
  const data = await response.json();
  state.hhImportResult = data;
  await loadAdmin();
  state.hhImportResult = data;
  showToast(`Загрузка завершена: создано ${data.created?.length || 0}, связано с готовыми вакансиями ${data.attached?.length || 0}.`);
  render();
}

async function syncHhResponses(publication) {
  const response = await fetch(`/api/admin/hh/publications/${publication.id}/sync-responses`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось синхронизировать отклики." }));
    return showToast(error.error || "Не удалось синхронизировать отклики.");
  }
  const data = await response.json();
  await loadAdmin();
  showToast(`Отклики HeadHunter синхронизированы: ${data.responses?.length || 0}.`);
  render();
}

async function updateHhPublicationFromAdmin(publication) {
  const draft = state.hhPublicationDrafts[publication.id] || {};
  const extractedId = extractHhVacancyId(draft.url ?? publication.url ?? "");
  const hhVacancyId = String(draft.hhVacancyId || publication.hhVacancyId || extractedId || "").trim();
  const response = await fetch(`/api/admin/hh-publications/${publication.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hhVacancyId,
      url: (draft.url ?? publication.url ?? "").trim(),
      status: hhVacancyId ? "published" : publication.status
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось сохранить публикацию HeadHunter." }));
    return showToast(error.error || "Не удалось сохранить публикацию HeadHunter.");
  }
  await loadAdmin();
  showToast("Публикация HeadHunter сохранена.");
  render();
}

async function saveAndSyncHhResponses(publication) {
  const draft = state.hhPublicationDrafts[publication.id] || {};
  const hhVacancyId = String(draft.hhVacancyId || publication.hhVacancyId || extractHhVacancyId(draft.url ?? publication.url ?? "") || "").trim();
  if (!hhVacancyId) return showToast("Сначала вставьте ссылку на вакансию HeadHunter или ее ID.");
  await updateHhPublicationFromAdmin({ ...publication, hhVacancyId });
  const saved = (state.hhPublications || []).find(item => item.id === publication.id) || { ...publication, hhVacancyId };
  await syncHhResponses(saved);
}

async function sendQuestionnaireToHhResponse(responseItem) {
  const response = await fetch(`/api/admin/hh/responses/${responseItem.id}/send-questionnaire`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Не удалось отправить ссылку кандидату." }));
    return showToast(error.error || "Не удалось отправить ссылку кандидату.");
  }
  await loadAdmin();
  showToast("Ссылка на анкету отправлена кандидату.");
  render();
}

function hiringStatusLabel(status) {
  const labels = {
    new: "Новая",
    accepted: "Принята",
    rejected: "Отклонена",
    draft: "Черновик",
    manual_ready: "Готова к ручной публикации",
    publication_ready: "Готова к публикации",
    published: "Опубликована",
    closed: "Закрыта"
  };
  return labels[status] || status || "—";
}

function vacancyWizardPanel() {
  const wizard = state.vacancyWizard;
  if (!wizard.active) {
    return el("section", { class: "table-panel vacancy-builder-intro" }, [
      el("div", { class: "panel-head" }, [
        el("div", {}, [
          el("h2", {}, ["Создать новую вакансию"]),
          el("span", {}, ["Если нужной позиции нет в справочнике, опишите ее текстом или голосом. Система подготовит профиль роли, обязанности, текст для hh.ru и основу анкеты."])
        ]),
        el("div", { class: "admin-form-actions inline-actions" }, [
          el("button", { class: "btn primary", onclick: openVacancyWizard }, [iconEl("plus"), "Создать вакансию"])
        ])
      ])
    ]);
  }

  if (wizard.step === "questions") {
    const question = wizard.questions[wizard.questionIndex] || "";
    return el("section", { class: "table-panel vacancy-builder" }, [
      el("div", { class: "panel-head" }, [
        el("div", {}, [
          el("h2", {}, ["Уточняем вводные"]),
          el("span", {}, [`Вопрос ${wizard.questionIndex + 1} из ${wizard.questions.length}. Это нужно, чтобы не придумывать за руководителя важные детали.`])
        ]),
        el("button", { class: "btn ghost", onclick: closeVacancyWizard }, ["Отменить"])
      ]),
      el("div", { class: "vacancy-builder-question" }, [
        el("strong", {}, [question]),
        el("textarea", {
          class: "textarea vacancy-builder-textarea",
          value: wizard.answers[wizard.questionIndex] || "",
          placeholder: "Ответьте коротко и по сути.",
          oninput: event => setVacancyWizardAnswer(event.target.value)
        })
      ]),
      el("div", { class: "form-actions vacancy-builder-actions" }, [
        el("button", { class: "btn ghost", onclick: previousVacancyWizardQuestion }, ["Назад"]),
        el("button", { class: "btn primary", onclick: nextVacancyWizardQuestion, disabled: wizard.loading ? "disabled" : null }, [wizard.loading ? "Готовим..." : wizard.questionIndex === wizard.questions.length - 1 ? "Собрать вакансию" : "Дальше", iconEl("arrow")])
      ])
    ]);
  }

  if (wizard.step === "draft" && wizard.draft) {
    const draft = wizard.draft;
    return el("section", { class: "table-panel vacancy-builder" }, [
      el("div", { class: "panel-head" }, [
        el("div", {}, [
          el("h2", {}, ["Черновик вакансии"]),
          el("span", {}, ["Проверьте смысл. После сохранения вакансия появится в справочнике и ее можно будет выбрать для запуска подбора."])
        ]),
        el("button", { class: "btn ghost", onclick: closeVacancyWizard }, ["Отменить"])
      ]),
      el("div", { class: "vacancy-draft-grid" }, [
        el("div", { class: "vacancy-draft-block" }, [
          el("span", {}, ["Название"]),
          el("strong", {}, [draft.title || "Новая вакансия"])
        ]),
        el("div", { class: "vacancy-draft-block" }, [
          el("span", {}, ["Профиль роли"]),
          el("p", {}, [draft.roleProfile || "Профиль будет уточнен после сохранения."])
        ]),
        el("div", { class: "vacancy-draft-block" }, [
          el("span", {}, ["Функциональные обязанности"]),
          el("ul", {}, (draft.responsibilities || []).slice(0, 8).map(item => el("li", {}, [item])))
        ]),
        el("div", { class: "vacancy-draft-block" }, [
          el("span", {}, ["Специальные вопросы анкеты"]),
          el("ul", {}, (draft.specialQuestions || []).slice(0, 8).map(item => el("li", {}, [item])))
        ])
      ]),
      el("div", { class: "vacancy-builder-actions" }, [
        el("button", { class: "btn ghost", onclick: () => { wizard.step = "input"; render(); } }, ["Вернуться к описанию"]),
        el("button", { class: "btn primary", onclick: saveVacancyWizardDraft, disabled: wizard.loading ? "disabled" : null }, [wizard.loading ? "Сохраняем..." : "Сохранить в справочник", iconEl("arrow")])
      ])
    ]);
  }

  return el("section", { class: "table-panel vacancy-builder" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Новая вакансия"]),
        el("span", {}, ["Опишите роль свободно: зачем нужен человек, что он будет делать, какой результат ожидаете, какие навыки критичны, формат работы и доход."])
      ]),
      el("button", { class: "btn ghost", onclick: closeVacancyWizard }, ["Отменить"])
    ]),
    el("textarea", {
      class: "textarea vacancy-builder-textarea",
      value: wizard.sourceText,
      placeholder: "Например: нужен менеджер запусков онлайн-школы, будет вести подготовку вебинаров, контролировать задачи подрядчиков, сроки, таблицы, воронку и отчетность...",
      oninput: event => { wizard.sourceText = event.target.value; }
    }),
    el("div", { class: "vacancy-builder-actions" }, [
      el("button", { class: `btn ghost ${wizard.listening ? "active" : ""}`, onclick: startVacancyDictation }, [iconEl("mic"), wizard.listening ? "Слушаю..." : "Надиктовать"]),
      el("button", { class: "btn primary", onclick: () => analyzeVacancyWizard(false), disabled: wizard.loading ? "disabled" : null }, [wizard.loading ? "Проверяем..." : "Проверить и собрать", iconEl("arrow")])
    ])
  ]);
}

function createdVacancyReviewPanel() {
  const prompt = state.vacancyReviewPrompt;
  if (!prompt?.vacancyCode) return el("div");
  return el("section", { class: "table-panel vacancy-review-panel", id: "vacancy-review-panel" }, [
    el("div", { class: "panel-head" }, [
      el("div", {}, [
        el("h2", {}, ["Описание вакансии к проверке"]),
        el("span", {}, ["Проверьте профиль роли, обязанности и текст для hh.ru перед запуском подбора."])
      ]),
      el("button", { class: "btn ghost", onclick: () => { state.vacancyReviewPrompt = null; render(); } }, ["Скрыть"])
    ]),
    el("div", { class: "vacancy-review-grid" }, [
      el("div", { class: "vacancy-draft-block" }, [
        el("span", {}, ["Вакансия"]),
        el("strong", {}, [prompt.title || vacancyLabel(prompt.vacancyCode)])
      ]),
      prompt.roleProfile ? el("div", { class: "vacancy-draft-block" }, [
        el("span", {}, ["Профиль роли"]),
        el("p", {}, [prompt.roleProfile])
      ]) : el("div"),
      prompt.responsibilities?.length ? el("div", { class: "vacancy-draft-block" }, [
        el("span", {}, ["Обязанности"]),
        el("ul", {}, prompt.responsibilities.slice(0, 8).map(item => el("li", {}, [item])))
      ]) : el("div"),
      prompt.hhText ? el("div", { class: "vacancy-draft-block wide" }, [
        el("span", {}, ["Текст для hh.ru"]),
        el("pre", {}, [prompt.hhText])
      ]) : el("div", { class: "empty" }, ["Текст для hh.ru будет создан при запуске подбора по этой вакансии."])
    ])
  ]);
}

function vacancyCreatedDialog() {
  const prompt = state.vacancyReviewPrompt;
  if (!prompt?.vacancyCode || prompt.showDialog === false) return el("div");
  const closeDialog = () => {
    state.vacancyReviewPrompt = { ...state.vacancyReviewPrompt, showDialog: false };
    render();
  };
  return el("div", { class: "dialog-backdrop", onclick: event => { if (event.target.className === "dialog-backdrop") closeDialog(); } }, [
    el("div", { class: "confirm-dialog" }, [
      el("button", { class: "close-btn", onclick: closeDialog }, ["×"]),
      el("div", { class: "badge" }, [iconEl("check"), "Вакансия создана"]),
      el("h2", {}, ["Проверьте описание перед запуском"]),
      el("p", {}, [`Вакансия "${prompt.title || vacancyLabel(prompt.vacancyCode)}" добавлена в справочник. Перед публикацией и отправкой кандидатов нужно проверить текст, обязанности, условия и вопросы анкеты.`]),
      el("div", { class: "dialog-actions" }, [
        el("button", { class: "btn ghost", onclick: closeDialog }, ["Позже"]),
        el("button", { class: "btn primary", onclick: () => {
          state.adminSection = "hiring";
          state.openingForm.vacancyCode = prompt.vacancyCode;
          state.vacancyReviewPrompt = { ...state.vacancyReviewPrompt, showDialog: false };
          if (location.hash !== "#admin/hiring") history.replaceState(null, "", "#admin/hiring");
          render();
          setTimeout(() => document.getElementById("vacancy-review-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
        } }, ["Перейти к описанию вакансии", iconEl("arrow")])
      ])
    ])
  ]);
}

function hiringDashboardView() {
  const canCreateOpening = canStartRecruitment();
  return el("section", { class: "staff-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("filter"), "Старт воронки"]),
        el("h1", {}, ["Подобрать сотрудника"]),
        el("p", {}, ["Выберите готовую вакансию из справочника или создайте новую позицию отдельным сценарием ниже."])
      ])
    ]),
    el("section", { class: "table-panel staff-form" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Заявка по готовой вакансии"]), el("span", {}, ["Выберите позицию из справочника и укажите причину открытия."])]),
      el("div", { class: "staff-form-grid" }, [
        hiringVacancyField(),
        openingReasonPicker(state.hiringRequestForm),
        desiredStartDateField(state.hiringRequestForm),
        commentField(state.hiringRequestForm)
      ]),
      el("div", { class: "admin-form-actions" }, [
        el("button", { class: "btn primary", onclick: createHiringRequestFromAdmin }, ["Создать заявку"])
      ])
    ]),
    canCreateOpening ? vacancyWizardPanel() : el("div"),
    canCreateOpening ? createdVacancyReviewPanel() : el("div"),
    canCreateOpening ? el("section", { class: "table-panel staff-form" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Начать подбор по готовой вакансии"]), el("span", {}, ["Создает рабочую воронку по выбранной позиции."])]),
      el("div", { class: "staff-form-grid" }, [
        openingVacancyField(),
        openingReasonPicker(state.openingForm),
        desiredStartDateField(state.openingForm)
      ]),
      recruitmentChannelPicker(state.openingForm),
      el("div", { class: "admin-form-actions" }, [
        el("button", { class: "btn primary", onclick: createOpeningFromAdmin }, ["Начать подбор"])
      ])
    ]) : el("div"),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Заявки"]), el("span", {}, [`Всего: ${state.hiringRequests.length}`])]),
      ...(state.hiringRequests.length ? state.hiringRequests.map(item => el("div", { class: "staff-row" }, [
        el("div", {}, [el("strong", {}, [item.title]), el("span", {}, [item.vacancyCode ? vacancyLabel(item.vacancyCode) : "новая вакансия"])]),
        el("div", {}, [hiringStatusLabel(item.status)]),
        el("div", {}, [item.createdByUsername || "—"]),
        el("div", {}, [new Date(item.createdAt).toLocaleString("ru-RU")])
      ])) : [el("div", { class: "empty" }, ["Заявок пока нет."])])
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Активные подборы"]), el("span", {}, [`Всего: ${state.vacancyOpenings.length}`])]),
      ...(state.vacancyOpenings.length ? state.vacancyOpenings.map(openingCard) : [el("div", { class: "empty" }, ["Активных подборов пока нет."])])
    ])
  ]);
}

function openingCard(item) {
  const channels = item.payload?.recruitmentChannels || [];
  const telegramDrafts = item.payload?.telegramDrafts || null;
  return el("div", { class: "opening-card" }, [
    el("div", { class: "opening-card-head" }, [
      el("div", {}, [
        el("strong", {}, [item.title]),
        el("span", {}, [vacancyLabel(item.vacancyCode)]),
        el("span", {}, [`Каналы: ${recruitmentChannelsText(channels)}`])
      ]),
      el("div", { class: "opening-card-status" }, [
        el("span", { class: "status-chip" }, [hiringStatusLabel(item.status)]),
        item.reason ? el("em", {}, [item.reason]) : el("em")
      ])
    ]),
    channels.includes("hh") ? el("div", { class: "opening-channel-block" }, [
      el("h3", {}, ["HeadHunter"]),
      item.hhTextId
        ? el("p", {}, ["Текст вакансии для HH создан и доступен в разделе HeadHunter."])
        : el("p", {}, ["Текст вакансии для HH еще не создан."]),
      isHrOrOwner() && !item.hhTextId ? el("button", { class: "btn ghost", onclick: () => createHhTextForOpening(item) }, ["Создать текст HeadHunter"]) : el("div")
    ]) : el("div"),
    channels.includes("telegram") && telegramDrafts ? el("div", { class: "opening-channel-block" }, [
      el("h3", {}, ["Telegram-чаты"]),
      el("div", { class: "telegram-draft-grid" }, [
        telegramDraftCard("Пост в профильный чат", telegramDrafts.chatPost, "Пост для Telegram скопирован."),
        telegramDraftCard("Личное сообщение кандидату", telegramDrafts.directMessage, "Личное сообщение скопировано.")
      ])
    ]) : el("div")
  ]);
}

function telegramDraftCard(title, text, toast) {
  return el("div", { class: "telegram-draft-card" }, [
    el("div", { class: "panel-head" }, [
      el("h4", {}, [title]),
      el("button", { class: "btn ghost", onclick: () => copyToClipboard(text || "", toast) }, [iconEl("copy"), "Копировать"])
    ]),
    el("pre", {}, [String(text || "").slice(0, 900)])
  ]);
}

function hhPromotionStatusText(item) {
  if (!item) return "данных пока нет";
  return item.promoted ? item.promotionLabel : "без платного продвижения";
}

function hhPromotionStatusPanel() {
  const data = state.hhPromotionStatus;
  if (!data) {
    return el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Оплата и продвижение HeadHunter"]),
        el("span", {}, ["Данные загружаются."])
      ])
    ]);
  }
  if (data.error) {
    return el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Оплата и продвижение HeadHunter"]),
        el("span", {}, ["Не удалось получить данные."])
      ]),
      el("div", { class: "empty" }, [data.error])
    ]);
  }
  const accountPayment = data.accountPayment || {};
  const available = accountPayment.availablePublications || [];
  const vacancies = data.vacancies || [];
  return el("section", { class: "table-panel hh-promotion-panel" }, [
    el("div", { class: "panel-head" }, [
      el("h2", {}, ["Оплата и продвижение HeadHunter"]),
      el("span", {}, [data.fetchedAt ? `Обновлено: ${formatDateTime(data.fetchedAt)}` : ""])
    ]),
    el("div", { class: "hh-payment-summary" }, [
      el("div", {}, [
        el("strong", {}, [accountPayment.hasAvailablePublications ? "Есть оплаченные публикации" : "Оплаченных публикаций нет"]),
        el("span", {}, [`Доступно всего: ${accountPayment.availableTotal || 0}`])
      ]),
      el("div", {}, [
        el("strong", {}, [accountPayment.payableActionsCount ? "Есть активные оплачиваемые действия" : "Активных оплачиваемых действий нет"]),
        el("span", {}, [`Действий: ${accountPayment.payableActionsCount || 0}`])
      ])
    ]),
    available.length ? el("div", { class: "hh-payment-variants" }, available.map(item => el("div", { class: "hh-payment-variant" }, [
      el("strong", {}, [item.title]),
      el("span", {}, [`Доступно: ${item.count}`]),
      item.description ? el("em", {}, [item.description]) : el("em")
    ]))) : el("div", { class: "empty" }, ["HeadHunter не вернул список доступных публикаций."]),
    el("div", { class: "panel-head compact-head" }, [
      el("h3", {}, ["Статус по активным вакансиям"]),
      el("span", {}, [`Всего: ${vacancies.length}`])
    ]),
    vacancies.length ? el("div", { class: "hh-promotion-list" }, vacancies.map(item => {
      const promotion = item.promotion || {};
      return el("div", { class: `hh-promotion-row ${promotion.promoted ? "promoted" : ""}` }, [
        el("div", {}, [
          el("strong", {}, [item.name || `Вакансия ${item.id}`]),
          el("span", {}, [item.url || item.id])
        ]),
        el("div", {}, [
          el("span", {}, ["Тип размещения"]),
          el("strong", {}, [promotion.publicationType || item.billingType || "не определен"])
        ]),
        el("div", {}, [
          el("span", {}, ["Продвижение"]),
          el("strong", {}, [hhPromotionStatusText(promotion)])
        ]),
        el("div", {}, [
          el("span", {}, ["Срок"]),
          el("strong", {}, [promotion.endAt ? formatDateTime(promotion.endAt) : (item.expiresAt ? formatDateTime(item.expiresAt) : "не указан")])
        ])
      ]);
    })) : el("div", { class: "empty" }, ["Активных вакансий HeadHunter не найдено."])
  ]);
}

function hhImportResultPanel() {
  const result = state.hhImportResult;
  if (!result) return el("div");
  if (result.error) {
    return el("div", { class: "empty danger-note" }, [result.error]);
  }
  return el("div", { class: "empty success-note" }, [
    `Загрузка активных вакансий HeadHunter завершена. Найдено: ${result.fetched || 0}. Новых вакансий создано: ${result.created?.length || 0}. Связано с готовыми вакансиями: ${result.attached?.length || 0}. Уже было связано раньше: ${result.linked?.length || 0}. Ошибок: ${result.failed?.length || 0}.`
  ]);
}

function headHunterDashboardView() {
  const status = state.hhStatus || { configured: false, account: { connected: false } };
  const connected = Boolean(status.account?.connected);
  const isEmployerAccount = status.account?.me?.is_employer === true || status.account?.me?.auth_type === "employer";
  return el("section", { class: "staff-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("copy"), "HeadHunter"]),
        el("h1", {}, ["Тексты и публикации"]),
        el("p", {}, ["Здесь готовим текст вакансии, связываем публикацию на HH с нашей воронкой, загружаем отклики и отправляем кандидатам ссылку на анкету."])
      ]),
      isHrOrOwner() ? el("div", { class: "admin-form-actions inline-actions" }, [
        el("button", { class: "btn ghost", onclick: importActiveHhVacancies, disabled: connected && !state.hhImporting ? null : "disabled" }, [
          state.hhImporting ? "Загружаем..." : "Загрузить вакансии"
        ]),
        el("button", { class: "btn primary", onclick: connectHeadHunter }, [
          connected ? "Переподключить HeadHunter" : "Подключить HeadHunter"
        ])
      ]) : el("div")
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Статус подключения"]),
        el("span", {}, [status.configured ? "настройки приложения заданы" : "не заданы HH_CLIENT_ID / HH_CLIENT_SECRET"])
      ]),
      el("div", { class: "staff-row" }, [
        el("div", {}, [
          el("strong", {}, [connected ? (isEmployerAccount ? "HeadHunter подключен как работодатель" : "HeadHunter подключен не тем типом аккаунта") : "HeadHunter не подключен"]),
          el("span", {}, [status.account?.me?.email || status.account?.me?.first_name || "нет данных аккаунта"])
        ]),
        el("div", {}, [status.account?.me?.auth_type || status.account?.status || "disconnected"]),
        el("div", {}, [status.redirectUri || "адрес возврата не задан"]),
        el("div", {}, [status.userAgent || "идентификатор приложения не задан"])
      ]),
      connected && !isEmployerAccount ? el("div", { class: "empty danger-note" }, [
        "Сейчас подключен аккаунт соискателя. Для откликов, сообщений и webhook нужно нажать “Переподключить HeadHunter” и авторизоваться именно под работодателем/менеджером вакансий."
      ]) : el("div"),
      el("div", { class: "staff-row" }, [
        el("div", {}, [
          el("strong", {}, [status.webhook?.configured ? "Автоматический прием событий hh.ru настроен" : "Автоматический прием событий hh.ru не настроен"]),
          el("span", {}, [status.webhook?.subscriptionId ? `Подписка: ${status.webhook.subscriptionId}` : "события от HH пока не приходят автоматически"])
        ]),
        el("div", {}, [status.webhookConfigured ? "адрес приема событий готов" : "не задан секрет приема событий hh.ru"]),
        el("div", {}, [status.webhook?.actions?.join(", ") || "NEW_NEGOTIATION_VACANCY"]),
        isHrOrOwner() ? el("button", { class: "btn ghost", onclick: setupHhWebhook }, [
          status.webhook?.configured ? "Обновить webhook" : "Настроить webhook"
        ]) : el("div")
      ]),
      el("div", { class: "empty" }, [
        connected
          ? "Следующий шаг: вставьте ссылку на опубликованную вакансию HH в публикации ниже и нажмите “Синхронизировать отклики”."
          : "Следующий шаг: нажмите “Подключить HeadHunter”, авторизуйтесь в кабинете работодателя и вернитесь в этот раздел."
      ]),
      hhImportResultPanel()
    ]),
    hhPromotionStatusPanel(),
    el("section", { class: "table-panel staff-form" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Связать вакансию HeadHunter с воронкой"]),
        el("span", {}, ["Для вакансий, которые уже опубликованы на HeadHunter вручную."])
      ]),
      el("div", { class: "staff-form-grid" }, [
        el("label", { class: "named-input" }, [
          el("span", {}, ["К какой воронке привязать"]),
          el("select", {
            class: "input compact-input",
            value: state.hhExistingPublicationForm.vacancyCode,
            onchange: event => {
              state.hhExistingPublicationForm.vacancyCode = event.target.value;
            }
          }, [
            el("option", { value: "" }, ["Выберите вакансию"]),
            ...vacancyOptions(state.hhExistingPublicationForm.vacancyCode)
          ]),
          el("small", { class: "field-hint" }, ["Отклики с HeadHunter попадут в выбранную воронку и будут связаны с ее анкетой."])
        ]),
        el("label", { class: "named-input" }, [
          el("span", {}, ["Опубликованная вакансия HeadHunter"]),
          el("input", {
            class: "input compact-input",
            value: state.hhExistingPublicationForm.url,
            placeholder: "https://hh.ru/vacancy/123456789",
            oninput: event => {
              const nextUrl = event.target.value;
              state.hhExistingPublicationForm.url = nextUrl;
              const extractedId = extractHhVacancyId(nextUrl);
              if (extractedId) state.hhExistingPublicationForm.hhVacancyId = extractedId;
              render();
            }
          }),
          el("small", { class: "field-hint" }, ["Вставьте ссылку на уже опубликованную вакансию. ID заполнится ниже автоматически."])
        ]),
        el("label", { class: "named-input" }, [
          el("span", {}, ["ID вакансии HeadHunter"]),
          el("input", {
            class: "input compact-input",
            value: state.hhExistingPublicationForm.hhVacancyId,
            placeholder: "Заполнится из ссылки автоматически",
            oninput: event => {
              state.hhExistingPublicationForm.hhVacancyId = event.target.value;
            }
          }),
          el("small", { class: "field-hint" }, ["Нужен системе для синхронизации откликов. Обычно заполняется из ссылки."])
        ])
      ]),
      isHrOrOwner() ? el("div", { class: "admin-form-actions" }, [
        el("button", { class: "btn primary", onclick: attachExistingHhVacancy }, [
          "Связать и загрузить отклики"
        ])
      ]) : el("div")
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Тексты HeadHunter"]), el("span", {}, [`Всего: ${state.hhTexts.length}`])]),
      ...(state.hhTexts.length ? state.hhTexts.map(text => el("div", { class: "hh-text-row" }, [
        el("div", {}, [el("strong", {}, [text.title]), el("span", {}, [vacancyLabel(text.vacancyCode)])]),
        el("pre", {}, [text.body.slice(0, 900)]),
        el("button", { class: "btn ghost", onclick: () => copyToClipboard(text.body, "Текст вакансии скопирован.") }, [iconEl("copy"), "Копировать текст"]),
        isHrOrOwner() ? el("button", { class: "btn primary", onclick: () => createHhPublicationFromText(text) }, ["Создать публикацию"]) : el("div")
      ])) : [el("div", { class: "empty" }, ["Тексты еще не созданы. Создайте их из раздела “Подобрать сотрудника”."])])
    ]),
    el("section", { class: "table-panel" }, [
      el("div", { class: "panel-head" }, [el("h2", {}, ["Публикации"]), el("span", {}, [`Всего: ${state.hhPublications.length}`])]),
      ...(state.hhPublications.length ? state.hhPublications.map(pub => {
        const draft = state.hhPublicationDrafts[pub.id] || {};
        const hhVacancyId = draft.hhVacancyId ?? pub.hhVacancyId ?? "";
        const url = draft.url ?? pub.url ?? "";
        return el("div", { class: "hh-publication-row" }, [
          el("div", {}, [
            el("strong", {}, [vacancyLabel(pub.vacancyCode)]),
            el("span", {}, [`Статус: ${hiringStatusLabel(pub.status)}`]),
            el("span", {}, [`Создана: ${new Date(pub.createdAt).toLocaleString("ru-RU")}`])
          ]),
          el("label", { class: "named-input" }, [
            el("span", {}, ["ID вакансии HeadHunter"]),
            el("input", {
              class: "input compact-input",
              value: hhVacancyId,
              placeholder: "Например: 123456789",
              oninput: event => {
                state.hhPublicationDrafts[pub.id] = { ...(state.hhPublicationDrafts[pub.id] || {}), hhVacancyId: event.target.value };
              }
            })
          ]),
          el("label", { class: "named-input" }, [
            el("span", {}, ["Ссылка на вакансию HeadHunter"]),
            el("input", {
              class: "input compact-input",
              value: url,
              placeholder: "https://hh.ru/vacancy/...",
              oninput: event => {
                const nextUrl = event.target.value;
                const extractedId = extractHhVacancyId(nextUrl);
                state.hhPublicationDrafts[pub.id] = {
                  ...(state.hhPublicationDrafts[pub.id] || {}),
                  url: nextUrl,
                  ...(extractedId ? { hhVacancyId: extractedId } : {})
                };
                render();
              }
            })
          ]),
          el("div", { class: "hh-publication-actions" }, [
            isHrOrOwner() ? el("button", { class: "btn primary", onclick: () => updateHhPublicationFromAdmin(pub) }, ["Сохранить"]) : el("div"),
            hhVacancyId || extractHhVacancyId(url) ? el("button", { class: "btn ghost", onclick: () => saveAndSyncHhResponses(pub) }, ["Синхронизировать отклики"]) : el("span", {}, ["Вставьте ссылку на вакансию HH, чтобы загрузить отклики"])
          ])
        ]);
      }) : [el("div", { class: "empty" }, ["Публикаций пока нет."])])
    ])
  ]);
}

async function saveBitrixNotificationSettings() {
  const draft = state.bitrixNotificationDraft || {};
  const response = await fetch("/api/admin/bitrix/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft)
  });
  const data = await response.json().catch(() => ({ error: "Не удалось сохранить настройки Bitrix24." }));
  if (!response.ok) return showToast(data.error || "Не удалось сохранить настройки Bitrix24.");
  state.bitrixNotifications = data.settings;
  state.bitrixNotificationDraft = { ...data.settings, events: { ...(data.settings?.events || {}) } };
  showToast("Настройки Bitrix24 сохранены.");
  render();
}

async function testBitrixNotificationSettings() {
  const response = await fetch("/api/admin/bitrix/notifications/test", { method: "POST" });
  const data = await response.json().catch(() => ({ error: "Не удалось отправить тестовое уведомление." }));
  if (!response.ok) return showToast(data.error || "Не удалось отправить тестовое уведомление.");
  showToast("Тестовое уведомление отправлено в Bitrix24.");
}

function notificationEventCheckbox(key, label, note) {
  const draft = state.bitrixNotificationDraft || { events: {} };
  return el("label", { class: "choice-line" }, [
    el("input", {
      type: "checkbox",
      checked: Boolean(draft.events?.[key]),
      onchange: event => {
        state.bitrixNotificationDraft = {
          ...draft,
          events: { ...(draft.events || {}), [key]: event.target.checked }
        };
        render();
      }
    }),
    el("span", {}, [label]),
    note ? el("em", {}, [note]) : el("em")
  ]);
}

function bitrixNotificationsView() {
  const status = state.bitrixNotifications || {};
  const draft = state.bitrixNotificationDraft || { enabled: false, provider: "im", dialogId: "", events: {} };
  return el("section", { class: "staff-page" }, [
    el("header", { class: "dash-header" }, [
      el("div", {}, [
        el("div", { class: "badge" }, [iconEl("bell"), "Bitrix24"]),
        el("h1", {}, ["Уведомления"]),
        el("p", {}, ["Сообщения о важных шагах кандидатов отправляются в общий чат Bitrix24. Кто состоит в чате, тот видит уведомления."])
      ])
    ]),
    el("section", { class: "table-panel staff-form" }, [
      el("div", { class: "panel-head" }, [
        el("h2", {}, ["Канал уведомлений"]),
        el("span", {}, [status.configured ? "webhook на сервере настроен" : "BITRIX_WEBHOOK_BASE не задан"])
      ]),
      !status.configured ? el("div", { class: "empty danger-note" }, [
        "На сервере не задан BITRIX_WEBHOOK_BASE. Сохранить настройки можно, но отправка сообщений не заработает до настройки webhook."
      ]) : el("div"),
      el("div", { class: "staff-form-grid" }, [
        el("label", { class: "choice-line" }, [
          el("input", {
            type: "checkbox",
            checked: Boolean(draft.enabled),
            onchange: event => {
              state.bitrixNotificationDraft = { ...draft, enabled: event.target.checked };
              render();
            }
          }),
          el("span", {}, ["Включить уведомления Bitrix24"])
        ]),
        el("label", { class: "named-input" }, [
          el("span", {}, ["DIALOG_ID чата"]),
          el("input", {
            class: "input compact-input",
            value: draft.dialogId || "",
            placeholder: "Например: chat2941",
            oninput: event => {
              state.bitrixNotificationDraft = { ...draft, dialogId: event.target.value };
            }
          })
        ]),
        el("label", { class: "named-input" }, [
          el("span", {}, ["Способ отправки"]),
          el("select", {
            class: "input compact-input",
            value: draft.provider || "im",
            onchange: event => {
              state.bitrixNotificationDraft = { ...draft, provider: event.target.value };
              render();
            }
          }, [
            el("option", { value: "im" }, ["Сообщение в чат"]),
            el("option", { value: "imbot" }, ["Сообщение от чат-бота"])
          ])
        ])
      ]),
      el("div", { class: "empty" }, [
        "DIALOG_ID выглядит как chat123. Его можно взять из ссылки/данных чата Bitrix24 или проверить через тестовую отправку."
      ]),
      el("div", { class: "notification-options" }, [
        notificationEventCheckbox("questionnaireSubmitted", "Кандидат заполнил анкету", "основное событие для HR"),
        notificationEventCheckbox("testAssignmentSubmitted", "Кандидат прикрепил тестовое", "сигнал руководителю проверить работу"),
        notificationEventCheckbox("interviewRecommended", "Кандидат рекомендован к интервью", "зарезервировано для следующего шага pipeline")
      ]),
      el("div", { class: "hh-publication-actions" }, [
        isHrOrOwner() ? el("button", { class: "btn primary", onclick: saveBitrixNotificationSettings }, ["Сохранить настройки"]) : el("div"),
        isHrOrOwner() ? el("button", { class: "btn ghost", onclick: testBitrixNotificationSettings }, ["Отправить тест"]) : el("div")
      ])
    ])
  ]);
}

function adminView() {
  if (!state.user) return loginView();
  ensureAdminLoaded();
  const analytics = state.analytics || { total: 0, avgScore: 0, statusCounts: {}, recommendations: [], topProjectTypes: [], topTools: [], topMetrics: [], summary: "" };
  const testKpis = testAssignmentKpiCounts();
  const testConversion = pctText(testKpis.submitted, analytics.total || 0);
  const selected = state.selected;
  const currentVacancyTitle = vacancyLabel(state.adminVacancyCode);
  const mainContent = state.adminSection === "overview"
    ? adminOverviewView()
    : state.adminSection === "staff" && isOwner()
    ? staffManagementView()
    : state.adminSection === "audit" && isOwner()
      ? auditLogView()
      : state.adminSection === "hiring"
        ? hiringDashboardView()
        : state.adminSection === "hh"
          ? headHunterDashboardView()
      : state.adminSection === "notifications"
        ? bitrixNotificationsView()
      : state.adminSection === "interview"
        ? interviewWorkspaceView()
      : state.adminSection === "questionnaire"
        ? questionnaireEditorView()
      : state.adminSection === "analytics"
        ? analyticsDashboardView(analytics)
        : el("section", { class: "dashboard-grid" }, [
      el("div", { class: "dashboard-main" }, [
        el("header", { class: "dash-header" }, [
          el("div", {}, [
            el("h1", {}, [state.adminSection === "vacancies" ? currentVacancyTitle : "Кандидаты"]),
            state.adminSection === "vacancies" ? el("div") : el("p", {}, ["Сводка по кандидатам и этапам отбора."])
          ])
        ]),
        el("div", { class: "kpi-grid" }, [
          kpi("Анкет заполнено", analytics.total),
          kpi("Средний балл", `${analytics.avgScore}/100`),
          kpi("Сильные кандидаты", analytics.statusCounts.green || 0, "green"),
          kpi("Ручная проверка", analytics.statusCounts.yellow || 0, "yellow", "нужно решение HR"),
          kpi("Конверсия в тестовые", testConversion, "", `${testKpis.submitted} из ${analytics.total || 0} анкет`),
          kpi("Не прошли анкету", analytics.statusCounts.red || 0, "red", "низкая оценка или стоп-факторы"),
          kpi("Тестовых сдано", testKpis.submitted, "green", "кандидаты прикрепили результат"),
          kpi("Без оценки", testKpis.withoutReview, testKpis.withoutReview ? "pink" : "", "ожидают проверки руководителем")
        ]),
        statusBar(analytics),
        vacancyMetricsDashboard(analytics),
        adminQuestionnaireLinksPanel(),
        testAssignmentSettingsPanel(),
        questionnaireSummaryPanel(),
        candidatesPanel(currentVacancyTitle),
        testRefusalsReportPanel()
      ]),
      el("aside", { class: "dashboard-side" }, [
        el("section", { class: "insight-panel" }, [
          el("h2", {}, ["Рекомендации"]),
          aiRecommendationList(analytics.recommendations || [], "platform"),
          state.aiInsights ? el("div", { class: "ai-box" }, [
            el("span", { class: "mode" }, [modelModeLabel(state.aiInsights.mode)]),
            el("strong", {}, [state.aiInsights.summary || ""]),
            el("h3", {}, ["Рекомендации ИИ HR"]),
            aiRecommendationList(state.aiInsights.recommendations || [], "ai"),
            ...(state.aiInsights.risks || []).map(text => el("p", { class: "risk-text" }, [text]))
          ]) : el("p", { class: "muted" }, ["Нажмите «Спросить ИИ HR», чтобы получить выводы."])
        ]),
        analyticsList("Типы проектов", analytics.topProjectTypes || [], "projectTypes"),
        analyticsList("Инструменты", analytics.topTools || [], "tools"),
        analyticsList("Метрики", analytics.topMetrics || [], "metrics")
      ])
    ]);
  return el("main", { class: "admin-shell" }, [
    el("nav", { class: "topbar" }, [
      el("a", { class: "brand", href: "#candidate" }, [iconEl("chart"), "Платформа подбора"]),
      el("div", { class: "top-actions" }, [
        updateNotice(),
        el("button", { class: "btn primary", onclick: runAiInsights }, [iconEl("spark"), "Спросить ИИ HR"]),
        el("button", { class: "btn danger", onclick: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          localStorage.removeItem(ADMIN_USER_KEY);
          state.user = null;
          state.analytics = null;
          render();
        } }, ["Выйти"])
      ])
    ]),
    el("div", { class: "admin-layout" }, [
      adminSidebar(),
      el("div", { class: "admin-content" }, [mainContent])
    ]),
    selected ? profileDrawer(selected) : el("div"),
    vacancyCreatedDialog(),
    releaseNotesModal(),
    aiActionProposalDialog()
  ]);
}

function answerLine(title, value) {
  return el("div", { class: "answer-line" }, [el("span", {}, [title]), el("strong", {}, [value || "—"])]);
}

function answerLinkLine(title, href, label) {
  if (!href) return answerLine(title, "—");
  return el("div", { class: "answer-line" }, [
    el("span", {}, [title]),
    el("a", { href, target: "_blank", rel: "noopener", class: "answer-download" }, [label || href])
  ]);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function testAssignmentDeadlineInfo(testAssignment = {}) {
  if (!testAssignment?.eligible) return null;
  const issuedAt = testAssignment.issuedAt || null;
  const submittedAt = testAssignment.submittedAt || null;
  const deadlineMs = 48 * 60 * 60 * 1000;
  const issuedDate = issuedAt ? new Date(issuedAt) : null;
  const submittedDate = submittedAt ? new Date(submittedAt) : null;
  const deadlineDate = issuedDate && !Number.isNaN(issuedDate.getTime())
    ? new Date(issuedDate.getTime() + deadlineMs)
    : null;
  const isSubmitted = submittedDate && !Number.isNaN(submittedDate.getTime());
  const isOverdue = Boolean(deadlineDate && !isSubmitted && Date.now() > deadlineDate.getTime());
  return {
    assignedAt: testAssignment.assignedAt || null,
    issuedAt,
    deadlineAt: deadlineDate ? deadlineDate.toISOString() : null,
    submittedAt,
    isSubmitted,
    isOverdue
  };
}

function testAssignmentTimeline(testAssignment = {}) {
  const info = testAssignmentDeadlineInfo(testAssignment);
  if (!info) return el("div");
  const statusText = info.isSubmitted
    ? "Тестовое выполнено: кандидат прикрепил ссылку с результатом."
    : testAssignment.status === "refused"
      ? "Кандидат явно отказался выполнять тестовое задание."
    : info.isOverdue
      ? "Срок выполнения тестового задания истек."
      : info.issuedAt
        ? "Ждем ссылку на результат тестового задания."
        : "Тестовое назначено, но кандидат еще не открыл страницу задания.";
  return el("div", { class: `test-timeline ${testAssignment.status === "refused" ? "refused" : info.isOverdue ? "overdue" : info.isSubmitted ? "submitted" : ""}` }, [
    el("div", { class: "test-timeline-head" }, [
      el("strong", {}, ["Срок выполнения"]),
      el("span", {}, ["48 часов с момента выдачи"])
    ]),
    answerLine("Назначено", formatDateTime(info.assignedAt)),
    answerLine("Выдано кандидату", info.issuedAt ? formatDateTime(info.issuedAt) : "страница задания еще не открыта"),
    answerLine("Дедлайн", info.deadlineAt ? formatDateTime(info.deadlineAt) : "появится после открытия задания"),
    answerLine("Результат прикреплен", info.submittedAt ? formatDateTime(info.submittedAt) : "ссылка еще не прикреплена"),
    el("p", { class: "test-timeline-status" }, [statusText])
  ]);
}

function communicationStatusText(status) {
  const labels = {
    pending: "ожидает отправки",
    sent: "отправлено",
    received: "получено",
    failed: "ошибка отправки",
    skipped: "пропущено"
  };
  return labels[status] || status || "—";
}

function communicationEventText(eventType) {
  const labels = {
    questionnaire_completed: "анкета получена",
    test_assignment_invite: "приглашение к тестовому",
    test_assignment_received: "тестовое получено",
    test_assignment_refused: "отказ от тестового",
    telegram_deep_link_linked: "Telegram привязан",
    telegram_link_confirmation_sent: "подтверждение в Telegram"
  };
  return labels[eventType] || eventType || "—";
}

function communicationChannelText(channel) {
  if (channel === "email") return "Электронная почта";
  if (channel === "telegram") return "Telegram";
  return channel || "—";
}

function communicationsSection(item) {
  const communications = Array.isArray(item.communications) ? item.communications : [];
  return el("section", { class: "profile-section" }, [
    el("h3", {}, ["Журнал коммуникаций"]),
    communications.length
      ? el("div", { class: "communication-list" }, communications.map(entry => el("div", { class: `communication-item ${entry.status || ""}` }, [
        el("div", { class: "communication-main" }, [
          el("strong", {}, [communicationEventText(entry.eventType)]),
          el("span", {}, [entry.subject || "Без темы"])
        ]),
        answerLine("Дата", entry.createdAt ? new Date(entry.createdAt).toLocaleString("ru-RU") : "—"),
        answerLine("Канал", communicationChannelText(entry.channel)),
        answerLine("Получатель", entry.recipient || "—"),
        answerLine("Статус", communicationStatusText(entry.status)),
        entry.error ? answerLine("Ошибка", entry.error) : el("div")
      ])))
      : el("p", { class: "muted" }, ["Коммуникаций по кандидату пока нет."])
  ]);
}

function telegramProfileSection(item) {
  const link = item.telegramLink || null;
  const name = link?.username ? `@${link.username}` : [link?.firstName, link?.lastName].filter(Boolean).join(" ");
  return el("section", { class: "profile-section" }, [
    el("h3", {}, ["Telegram"]),
    link
      ? el("div", {}, [
        answerLine("Статус", "привязан"),
        answerLine("Контакт", name || link.chatId || "—"),
        answerLine("Привязан", link.updatedAt ? new Date(link.updatedAt).toLocaleString("ru-RU") : "—")
      ])
      : el("p", { class: "muted" }, ["Кандидат еще не привязал Telegram-бота."])
  ]);
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function formatQuestionAnswer(q, answers) {
  const value = answers?.[q.id];
  if (q.type === "resumeAttachment") {
    const file = answers?.resumeFile;
    const parts = [];
    if (value) parts.push(`ссылка: ${value}`);
    if (file?.originalName) parts.push(`файл: ${file.originalName}`);
    return parts.join("; ") || "—";
  }
  if (q.type === "questionRating") return value ? `${value} из 5` : "—";
  if (Array.isArray(value)) return selectedText(q.id, value);
  return selectedText(q.id, value);
}

function profileDrawer(item) {
  const answerRows = (state.config?.questions || []).filter(q => !["namePair", "contactPair", "expectations"].includes(q.type)).map(q => {
    return answerLine(q.title, formatQuestionAnswer(q, item.answers));
  });
  return el("div", { class: "drawer-backdrop", onclick: event => { if (event.target.className === "drawer-backdrop") { state.selected = null; render(); } } }, [
    el("aside", { class: "drawer" }, [
      el("button", { class: "close-btn", onclick: () => { state.selected = null; render(); } }, ["×"]),
      el("div", { class: "profile-head" }, [
        el("div", { class: `score-badge big ${item.recommendation.code}` }, [String(item.score.total)]),
        el("div", {}, [
          el("h2", {}, [item.candidate.fullName || "Без имени"]),
          el("p", {}, [item.candidate.contacts || "Контакты не указаны"]),
          el("p", {}, [`Вакансия: ${vacancyLabel(item.vacancyCode || state.adminVacancyCode)}`]),
          el("div", { class: `status-pill ${item.recommendation.code}` }, [`${recommendationLabel(item.recommendation)} — ${item.recommendation.status}`])
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
      resumeReviewSection(item),
      hrDecisionSection(item),
      funnelReviewSection(item),
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
        answerLine("Назначение", item.testAssignment?.eligible ? "Тестовое назначено кандидату" : "Тестовое не назначалось"),
        answerLine("Статус", testAssignmentStatus(item.testAssignment)),
        testAssignmentTimeline(item.testAssignment),
        testAssignmentRefusalBlock(item.testAssignment),
        item.testAssignment?.link
          ? answerLinkLine("Результат кандидата", item.testAssignment.link, "Открыть Google Документ")
          : answerLine("Результат кандидата", "кандидат еще не прикрепил ссылку"),
        testAssignmentEvaluationBlock(item)
      ]),
      telegramProfileSection(item),
      communicationsSection(item),
      el("section", { class: "profile-section" }, [
        el("h3", {}, ["Ответы"]),
        ...answerRows,
        item.answers?.resumeFile?.url
          ? answerLinkLine("Файл резюме", item.answers.resumeFile.url, item.answers.resumeFile.originalName || "Скачать резюме")
          : el("div")
      ])
    ])
  ]);
}

function resumeReviewSection(item) {
  const review = item.funnelReview?.resumeReview || {};
  return el("section", { class: "profile-section resume-review-section" }, [
    el("h3", {}, ["Оценка резюме"]),
    answerLine("Балл резюме", `${review.score ?? item.funnelReview?.resumeScore ?? 0}/100`),
    answerLine("Статус", review.status || "нет оценки"),
    review.explanation ? el("p", {}, [review.explanation]) : el("p", { class: "muted" }, ["Резюме оценивается по доступным ссылкам, файлам и ответам кандидата."]),
    review.signals?.length ? el("div", {}, [
      el("strong", {}, ["Что подтверждает опыт"]),
      el("ul", {}, review.signals.map(text => el("li", {}, [text])))
    ]) : el("div"),
    review.risks?.length ? el("div", {}, [
      el("strong", {}, ["Что требует проверки"]),
      el("ul", {}, review.risks.map(text => el("li", {}, [text])))
    ]) : el("div"),
    review.hiddenPotential ? el("div", { class: "soft-alert yellow" }, ["Скрытый потенциал: резюме выглядит сильнее анкеты. Рекомендуется короткий созвон перед отказом."]) : el("div")
  ]);
}

function hrDecisionSection(item) {
  const saved = item.interview?.hrDecision || null;
  const draft = hrDecisionDraft(item);
  const options = [
    ["invite", "Пригласить"],
    ["call", "Короткий созвон"],
    ["test", "Выдать тестовое"],
    ["hidden_potential", "Скрытый потенциал"],
    ["pool", "В резерв"],
    ["reject", "Отклонить"]
  ];
  return el("section", { class: "profile-section hr-decision-section" }, [
    el("h3", {}, ["Решение HR"]),
    saved ? el("div", { class: "soft-alert" }, [
      el("strong", {}, [hrDecisionLabel(saved.decision)]),
      el("span", {}, [`Принял(а): ${saved.decidedBy || saved.decidedByUsername || "—"}${saved.decidedAt ? `, ${formatDateTime(saved.decidedAt)}` : ""}`]),
      saved.comment ? el("p", {}, [saved.comment]) : el("p", { class: "muted" }, ["Комментарий не указан."])
    ]) : el("p", { class: "muted" }, ["Ручное решение пока не принято."]),
    canReviewTestAssignment() ? el("div", { class: "hr-decision-actions" }, [
      ...options.map(([value, label]) => el("button", {
        class: `btn ghost ${draft.decision === value ? "active" : ""}`,
        onclick: () => {
          draft.decision = value;
          saveHrDecision(item, value);
        }
      }, [label])),
      el("label", { class: "named-input hr-decision-comment" }, [
        el("span", {}, ["Комментарий к решению"]),
        el("textarea", {
          class: "textarea",
          placeholder: "Коротко: почему приняли такое решение и что делать дальше",
          value: draft.comment,
          oninput: event => { draft.comment = event.target.value; }
        })
      ]),
      el("button", { class: "btn primary", onclick: () => saveHrDecision(item) }, ["Сохранить комментарий"])
    ]) : el("div")
  ]);
}

function testAssignmentRefusalBlock(testAssignment = {}) {
  if (testAssignment.status !== "refused") return el("div");
  return el("div", { class: "test-refusal-note" }, [
    el("strong", {}, ["Кандидат отказался от тестового задания"]),
    answerLine("Дата отказа", testAssignment.refusedAt ? formatDateTime(testAssignment.refusedAt) : "—"),
    answerLine("Причина", testAssignment.refusalReason || "не указана")
  ]);
}

function funnelReviewSection(item) {
  const review = item.funnelReview;
  if (!review) return el("div");
  const rec = review.recommendation || {};
  const testReview = review.testReview || {};
  return el("section", { class: "profile-section funnel-review" }, [
    el("h3", {}, ["Суммарная рекомендация по воронке"]),
    answerLine("Оценка резюме", `${review.resumeScore ?? 0}/100`),
    answerLine("Оценка анкеты", `${review.questionnaireScore}/100`),
    answerLine("Оценка тестового", review.testScore === null ? "тестовое еще не оценено" : `${review.testScore}/100`),
    testReview.formula ? answerLine("Формула тестового", testReview.formula) : el("div"),
    testReview.comparisonLabel ? answerLine("Сравнение оценок", testReview.difference === null ? testReview.comparisonLabel : `${testReview.comparisonLabel}; разница ${testReview.difference} баллов`) : el("div"),
    review.interviewScore === null ? el("div") : answerLine("Оценка интервью", `${review.interviewScore}/100`),
    answerLine("Итоговая оценка", `${review.totalScore}/100`),
    answerLine("Формула", review.formula),
    el("div", { class: `status-pill ${rec.code || "yellow"}` }, [rec.label || "Ручной разбор"]),
    el("p", {}, [rec.action || ""]),
    review.explanation ? el("p", { class: "muted" }, [review.explanation]) : el("div")
  ]);
}

function testAssignmentEvaluationBlock(item) {
  const test = item.testAssignment || {};
  const evaluation = test.evaluation;
  const manualReview = test.manualReview;
  const review = item.funnelReview?.testReview || {};
  const canEvaluate = isHrOrOwner() && test.link && ["submitted", "manual_reviewed", "evaluated"].includes(test.status);
  const canManualReview = canReviewTestAssignment() && test.link;
  const draft = testManualDraft(item);
  return el("div", { class: "test-evaluation-panel" }, [
    el("h3", {}, ["Оценка тестового задания"]),
    review.finalScore !== null && review.finalScore !== undefined ? el("div", { class: `test-score-summary ${review.comparisonStatus || ""}` }, [
      el("strong", {}, [`Итог тестового: ${review.finalScore}/100`]),
      el("span", {}, [review.formula || ""]),
      review.comparisonLabel ? el("em", {}, [review.difference === null ? review.comparisonLabel : `${review.comparisonLabel}. Разница: ${review.difference} баллов.`]) : el("em")
    ]) : el("p", { class: "muted" }, ["Ждем оценку тестового. Нужна ручная оценка руководителя и желательно анализ ИИ HR."]),
    el("div", { class: "test-review-grid" }, [
      el("section", { class: "test-review-card" }, [
        el("h4", {}, ["Оценка руководителя"]),
        manualReview ? el("div", { class: "ai-box compact" }, [
          answerLine("Балл", `${manualReview.score}/100`),
          answerLine("Решение", manualReview.decision || "—"),
          manualReview.comment ? el("p", {}, [manualReview.comment]) : el("p", { class: "muted" }, ["Комментарий не указан."]),
          answerLine("Кто оценил", manualReview.reviewer || manualReview.reviewerUsername || "—")
        ]) : el("p", { class: "muted" }, ["Руководитель еще не поставил оценку."]),
        canManualReview ? el("div", { class: "manual-review-form" }, [
          el("label", { class: "named-input" }, [
            el("span", {}, ["Балл руководителя, 0-100"]),
            el("input", {
              class: "input compact-input",
              type: "number",
              min: "0",
              max: "100",
              value: draft.score,
              placeholder: "Например: 82",
              oninput: event => { draft.score = event.target.value; }
            })
          ]),
          el("label", { class: "named-input" }, [
            el("span", {}, ["Решение"]),
            el("select", {
              class: "input compact-input",
              onchange: event => { draft.decision = event.target.value; }
            }, [
              el("option", { value: "", selected: !draft.decision ? "selected" : null }, ["Не выбрано"]),
              ...["Сильный кандидат", "Спорный кандидат", "Слабое тестовое", "В резерв"].map(option => el("option", { value: option, selected: draft.decision === option ? "selected" : null }, [option]))
            ])
          ]),
          el("label", { class: "named-input" }, [
            el("span", {}, ["Комментарий руководителя"]),
            el("textarea", {
              class: "input",
              placeholder: "Что хорошо, что насторожило, что проверить дальше",
              oninput: event => { draft.comment = event.target.value; }
            }, [draft.comment])
          ]),
          el("button", { class: "btn primary", onclick: () => saveManualTestReview(item) }, ["Сохранить оценку руководителя"])
        ]) : el("div")
      ]),
      el("section", { class: "test-review-card" }, [
        el("h4", {}, ["Оценка ИИ HR"]),
        evaluation ? el("div", { class: "ai-box compact" }, [
          el("span", { class: "mode" }, [modelModeLabel(evaluation.mode)]),
          answerLine("Балл", `${evaluation.score}/100`),
          el("p", {}, [evaluation.summary || ""]),
          ...(evaluation.strengths || []).map(text => el("p", {}, [`Сильная сторона: ${text}`])),
          ...(evaluation.risks || []).map(text => el("p", { class: "risk-text" }, [`Риск: ${text}`])),
          evaluation.recommendation ? el("p", {}, [`Рекомендация: ${evaluation.recommendation}`]) : el("div"),
          ...(evaluation.interviewQuestions || []).map(text => el("p", {}, [`Проверить на интервью: ${text}`]))
        ]) : el("p", { class: "muted" }, ["Оценка ИИ HR еще не выполнена. После прикрепления результата запустите анализ тестового задания."]),
        canEvaluate ? el("button", {
          class: "btn primary",
          onclick: () => evaluateTestAssignmentForSelected(item.id)
        }, [evaluation ? "Переоценить тестовое ИИ" : "Оценить тестовое ИИ"]) : el("div")
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
  if (testAssignment.status === "refused") return "Кандидат отказался выполнять тестовое задание";
  if (testAssignment.status === "evaluated") return "Оценено ИИ: есть анализ и балл тестового задания";
  if (testAssignment.status === "manual_reviewed") return "Оценено руководителем: ожидает оценку ИИ HR или сравнение";
  if (testAssignment.status === "submitted") return "Выполнено: кандидат прикрепил ссылку с результатом";
  if (testAssignment.status === "issued") return "Тестовое выдано: кандидат открыл страницу задания";
  if (testAssignment.status === "assigned") return "Назначено: кандидат получил переход к тестовому, страницу задания еще не открывал";
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
    practicalCases: "Практические ситуации",
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

async function checkAppVersion(showActualToast = false) {
  if (state.updateCheckInProgress) return;
  state.updateCheckInProgress = true;
  try {
    const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("version_check_failed");
    const versionInfo = await response.json();
    const latestVersion = String(versionInfo.version || "").trim();
    const available = Boolean(latestVersion && latestVersion !== APP_CLIENT_VERSION);
    const changed = state.updateAvailable !== available || state.updateVersion?.version !== latestVersion;
    state.updateAvailable = available;
    state.updateVersion = versionInfo;
    if (!available && latestVersion === APP_CLIENT_VERSION && currentAppRoute() === "admin") {
      const seenVersion = localStorage.getItem(APP_RELEASE_SEEN_KEY);
      if (seenVersion !== APP_CLIENT_VERSION) {
        state.releaseNotesOpen = true;
        state.releaseNoteIndex = 0;
      }
    }
    if (showActualToast && !available) showToast("У вас актуальная версия.");
    if ((changed || state.releaseNotesOpen) && currentAppRoute() === "admin") render();
  } catch {
    if (showActualToast) showToast("Не удалось проверить обновления.");
  } finally {
    state.updateCheckInProgress = false;
  }
}

function applyAppUpdate() {
  window.location.reload();
}

function closeReleaseNotes() {
  localStorage.setItem(APP_RELEASE_SEEN_KEY, APP_CLIENT_VERSION);
  state.releaseNotesOpen = false;
  state.releaseNoteIndex = 0;
  render();
}

function releaseNotesModal() {
  if (!state.releaseNotesOpen || currentAppRoute() !== "admin") return el("div");
  const info = state.updateVersion || {};
  const notes = Array.isArray(info.notes) && info.notes.length
    ? info.notes
    : ["Платформа обновлена. Изменения применены и уже доступны в интерфейсе."];
  const index = Math.max(0, Math.min(state.releaseNoteIndex || 0, notes.length - 1));
  const hasMany = notes.length > 1;
  return el("div", { class: "release-backdrop" }, [
    el("section", { class: "release-card" }, [
      el("h2", {}, [info.title || "Платформа обновлена"]),
      el("p", { class: "release-version" }, [`Версия ${info.version || APP_CLIENT_VERSION}${info.releasedAt ? ` от ${formatDateTime(info.releasedAt)}` : ""}`]),
      el("div", { class: "release-note" }, [
        hasMany ? el("span", {}, [`${index + 1} из ${notes.length}`]) : el("span"),
        el("p", {}, [notes[index]])
      ]),
      hasMany ? el("ol", { class: "release-list" }, notes.map((note, noteIndex) => (
        el("li", { class: noteIndex === index ? "active" : "" }, [note])
      ))) : el("div"),
      el("div", { class: "release-actions" }, [
        hasMany && index < notes.length - 1
          ? el("button", { class: "btn primary", onclick: () => {
            state.releaseNoteIndex = index + 1;
            render();
          } }, ["Далее"])
          : el("button", { class: "btn primary", onclick: closeReleaseNotes }, ["Понятно"]),
        hasMany && index < notes.length - 1
          ? el("button", { class: "btn ghost", onclick: closeReleaseNotes }, ["Закрыть"])
          : el("div")
      ])
    ])
  ]);
}

function aiActionProposalDialog() {
  const proposal = state.aiActionProposal;
  if (!proposal || currentAppRoute() !== "admin") return el("div");
  return el("div", { class: "modal-backdrop ai-action-backdrop" }, [
    el("section", { class: "modal-card ai-action-card" }, [
      el("span", { class: "mode" }, ["ИИ HR"]),
      el("h2", {}, [proposal.title || "Применить рекомендацию"]),
      el("p", {}, ["Перед внесением изменений проверьте рекомендацию. Ничего не публикуется и не меняется без вашего подтверждения."]),
      el("label", { class: "named-input" }, [
        el("span", {}, ["Что предлагается сделать"]),
        el("textarea", {
          class: "textarea ai-action-text",
          value: state.aiActionEditText || proposal.text,
          oninput: event => {
            state.aiActionEditText = event.target.value;
          }
        }, [state.aiActionEditText || proposal.text])
      ]),
      el("div", { class: "soft-alert yellow" }, [
        el("strong", {}, ["Важно"]),
        el("p", {}, ["Кнопка «Принять» фиксирует согласие на изменение. Перед публикацией вакансии, сохранением анкеты или изменением скрипта все равно нужно проверить текст вручную."])
      ]),
      el("div", { class: "modal-actions" }, [
        el("button", { class: "btn ghost", onclick: closeAiActionProposal }, ["Отменить"]),
        el("button", { class: "btn ghost", onclick: editAiActionProposal }, ["Редактировать"]),
        el("button", { class: "btn primary", onclick: acceptAiActionProposal }, ["Принять"])
      ])
    ])
  ]);
}

function updateNotice() {
  if (!state.updateAvailable) {
    return el("div");
  }
  return el("button", {
    class: "update-notice",
    title: "На сервере доступна новая версия платформы",
    onclick: applyAppUpdate
  }, [
    el("span", { class: "update-dot" }, ["!"]),
    el("span", {}, ["Готовы обновления"]),
    el("strong", {}, ["Обновиться"])
  ]);
}

function siteFooter() {
  return el("footer", { class: "site-footer" }, [
    el("div", { class: "footer-main" }, [
      el("strong", {}, [OPERATOR.project]),
      el("span", {}, [`Оператор персональных данных: ${OPERATOR.legalName}`]),
      el("span", {}, [`ИНН ${OPERATOR.inn}`]),
      el("span", {}, [`ОГРНИП ${OPERATOR.ogrnip}`]),
      el("span", {}, [`Адрес: ${OPERATOR.address}`]),
      el("span", {}, ["Электронная почта для обращений по персональным данным: ", el("a", { href: `mailto:${OPERATOR.email}` }, [OPERATOR.email])])
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
      el("a", { class: "brand", href: "/" }, [iconEl("spark"), "Платформа подбора"]),
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
        "Аналитика потока кандидатов с помощью нейросети в текущей версии должна выполняться по обезличенным или агрегированным данным без передачи ФИО, электронной почты, телефона и ссылок на резюме во внешние нейросетевые сервисы."
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
        "первичный отбор кандидатов на позицию специалиста по соцсетям;",
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
      title: "5. Автоматизированная обработка и аналитика нейросетью",
      items: [
        "Я уведомлен(а), что ответы анкеты могут обрабатываться с применением автоматизированной скоринговой методологии для первичной оценки соответствия роли.",
        "Автоматическая оценка является вспомогательным инструментом HR-службы и не является единственным основанием для итогового кадрового решения.",
        "Внешние нейросетевые сервисы в текущей версии могут использоваться только для анализа обезличенных или агрегированных данных потока кандидатов без передачи ФИО, электронной почты, телефона и ссылок на резюме."
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
    checkAppVersion(false);
    setInterval(() => checkAppVersion(false), UPDATE_CHECK_INTERVAL_MS);
  }
}

boot();
