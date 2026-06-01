const labels = {
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

const questions = [
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

const optionScores = {
  experienceYears: { less1: 0, "1_2": 2, "2_3": 4, "3_5": 5, more5: 5 },
  projectTypes: { b2b: 2, expert: 2, education: 2, consulting: 2, premium: 2, b2c: 1, personalBrand: 1, ecommerce: 1, lifestyle: 0, other: 0 },
  socialNetworks: { instagram: 2, telegram: 2, linkedin: 2, facebook: 1, youtubeShorts: 1, tiktok: 1, vk: 1, other: 0 },
  platformsCount: { one: 1, two: 3, three: 5, fourFive: 5, moreFive: 4 },
  responsibilities: { publishing: 1, textAdaptation: 3, expertContent: 3, contentPlanning: 2, basicDesign: 3, stories: 2, reels: 2, autoposting: 2, analyticsReports: 3, growth: 3, leadgen: 4, competitors: 2, trendwatching: 2, contractors: 2 },
  readiness: { adaptTexts: 3, basicDesign: 3, autoposting: 2, qualityCheck: 2, statistics: 3, growthHypotheses: 3, competitorsTrends: 3, aiTools: 2, onlyPublishing: 0 },
  tools: { canva: 2, figma: 2, capcut: 2, autopostingServices: 3, sheets: 2, projectTools: 2, textAi: 2, visualAi: 1, socialAnalytics: 2, noTools: 0 },
  soloDesign: { stories: 2, carousel: 3, cover: 2, banner: 2, resize: 2, videoCut: 2, nothing: 0 },
  metrics: { reach: 1, er: 2, saves: 2, comments: 1, videoRetention: 2, clicks: 2, follows: 2, leads: 4, ctrUtm: 3, leadQuality: 3, noAnalytics: 0 },
  noLeadsActions: { audienceQuality: 2, ctaOffer: 2, userPath: 2, funnelConversion: 2, wrongReachTopics: 2, funnelHypotheses: 2, morePosts: 0, notResponsible: 0, adsNoAnalysis: 0 },
  trendFrequency: { weekly: 5, monthly: 4, taskBased: 2, rare: 1, never: 0 },
  deadlineBehavior: { warnAndSolve: 5, askMove: 3, qualityDrop: 2, lateNotice: 0, waitManager: 0 },
  weakPlanBehavior: { analyzeHypotheses: 5, tellAndWait: 2, keepExecuting: 1, changeAlone: 1, notMyZone: 0 },
  feedbackBehavior: { improveCalmly: 5, okIfSpecific: 4, hardButWork: 2, defend: 1, dislike: 0 },
  workValues: { openComms: 2, honesty: 2, responsibility: 3, testingNew: 2, development: 2, strongTeam: 1, freedom: 1, stableTasks: 0, creativityNoMetrics: 0, onlyClearTasks: 0 }
};

const defaultConfig = {
  version: 6,
  title: "Анкета SMM-менеджера",
  intro: "7-10 минут. Большинство вопросов с выбором ответа. Цель — быстро понять релевантность опыта и не тратить ваше время на неподходящие этапы.",
  defaults: {
    vacancyMin: 90000,
    vacancyMax: 140000
  },
  labels,
  questions,
  scoring: {
    rawMax: 178,
    optionScores,
    caps: {
      projectTypes: 8,
      socialNetworks: 8,
      responsibilities: 20,
      readiness: 18,
      tools: 15,
      soloDesign: 10,
      metrics: 18,
      noLeadsActions: 10,
      workValues: 8
    },
    thresholds: {
      green: 80,
      yellow: 65,
      orange: 50
    }
  }
};

module.exports = { defaultConfig };
