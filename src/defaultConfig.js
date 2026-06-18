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
  { id: "portfolio", title: "Прикрепите ссылку на резюме, профиль или файл", type: "resumeAttachment", required: true, placeholder: "Ссылка на резюме или профиль" },
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
  { section: "Ожидания", id: "workValues", title: "Что для вас ближе всего в работе?", type: "checkbox", maxPick: 3, required: true },
  { id: "workFormat", title: "Какой формат работы вам подходит?", type: "checkbox", required: true },
  { id: "income", title: "Какие у вас ожидания по доходу?", type: "text", required: true, placeholder: "Например: 120 000 руб." },
  { id: "availability", title: "Когда вы готовы выйти?", type: "radio", required: true },
  { section: "Финальная оценка", id: "questionnaireFeedbackRating", title: "Это был последний вопрос, вы справились 👍. Пожалуйста поделитесь насколько наши вопросы показались вам интересными и эффективными", type: "questionRating", required: true }
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

const interviewDecisionFields = [
  { id: "strengths", title: "Сильные стороны кандидата", type: "textarea" },
  { id: "risks", title: "Зоны риска и сомнений", type: "textarea" },
  { id: "recommendation", title: "Рекомендация по найму", type: "select", options: ["Двигать дальше", "Двигать с оговорками", "Отказать", "В резерв"] },
  { id: "grade", title: "Уровень компенсации / грейд", type: "text" },
  { id: "startConditions", title: "Условия успешного старта", type: "textarea" },
  { id: "nextSteps", title: "Следующие шаги", type: "textarea" }
];

const interviewPrinciples = [
  "Вести структурированное интервью: одинаковый каркас для кандидатов одной вакансии, чтобы сравнение было честным.",
  "Оценивать не впечатление, а факты: конкретные примеры, решения, формулировки кандидата и логику действий.",
  "Использовать проективные вопросы: спрашивать не только 'как вы поступите', но и 'почему люди обычно так поступают'. Это снижает социально желательные ответы.",
  "Разбирать кейсы из реальной работы роли: дедлайны, конфликты, аналитика, ответственность, работа с экспертами и командой.",
  "После интервью фиксировать оценку 1-5 по компетенциям и короткие факты/цитаты, на которых держится вывод."
];

const smmInterview = {
  title: "Интервью SMM-менеджера",
  subtitle: "Структурированный сценарий для HR и руководителя: проективные вопросы, практические кейсы и оценочный лист.",
  duration: "45-60 минут",
  sourceNote: "Интегрирована методология структурированного интервью по Светлане Ивановой: проективные вопросы, кейсы, фиксация фактов и оценка компетенций.",
  intro: [
    "Цель интервью - проверить не только опыт ведения соцсетей, а профессиональное мышление: экспертный контент, аналитику, воронку, самостоятельность и культурный фит.",
    "Анкета уже дала первичный скоринг. На интервью не нужно дублировать все вопросы анкеты: уточняем спорные зоны, проверяем факты и смотрим, как кандидат рассуждает в рабочих ситуациях."
  ],
  structure: [
    { title: "Вводная и рамка", timing: "5-7 минут", description: "Коротко объяснить формат, роль и что интервью строится на рабочих ситуациях." },
    { title: "Опыт и факты", timing: "10-15 минут", description: "Проверить портфолио, личный вклад, площадки, метрики, реальные результаты." },
    { title: "Проективные вопросы", timing: "15-20 минут", description: "Понять установки кандидата: ответственность, обратная связь, аналитика, развитие." },
    { title: "Практические кейсы", timing: "15-20 минут", description: "Проверить мышление воронкой, работу с экспертным контентом и способность предлагать решения." },
    { title: "Вопросы кандидата и завершение", timing: "5 минут", description: "Ответить на вопросы, обозначить следующий шаг и срок обратной связи." }
  ],
  principles: interviewPrinciples,
  projectiveBlocks: [
    {
      id: "role",
      title: "Роль и мотивация",
      questions: [
        { id: "role_1", text: "Почему, на ваш взгляд, люди выбирают работу SMM-менеджера в экспертных или образовательных проектах?", goal: "Мотивация и понимание роли" },
        { id: "role_2", text: "Почему одни SMM-специалисты быстро выгорают, а другие долго остаются эффективными?", goal: "Осознанность, устойчивость, ожидания" },
        { id: "role_3", text: "Что обычно отличает сильного SMM-менеджера от человека, который просто публикует готовые посты?", goal: "Понимание широты роли" }
      ]
    },
    {
      id: "responsibility",
      title: "Ответственность, сроки и качество",
      questions: [
        { id: "resp_1", text: "Почему в командах часто срываются сроки публикаций и контент-планов?", goal: "Причины проблем и зрелость взгляда" },
        { id: "resp_2", text: "Как обычно ведет себя ответственный SMM, если понимает, что публикация или запуск под риском?", goal: "Проактивность и работа с рисками" },
        { id: "resp_3", text: "В каких случаях можно выпустить материал неидеальным, а в каких лучше остановить публикацию?", goal: "Баланс скорость/качество" }
      ]
    },
    {
      id: "analytics",
      title: "Аналитика и воронка",
      questions: [
        { id: "analytics_1", text: "Почему бывает так, что охваты растут, а заявок нет?", goal: "Воронка, CTA, качество аудитории" },
        { id: "analytics_2", text: "Почему некоторые SMM-специалисты избегают регулярной аналитики?", goal: "Отношение к цифрам" },
        { id: "analytics_3", text: "Когда SMM должен спорить с утвержденным контент-планом и предлагать изменения?", goal: "Самостоятельность и аргументация" }
      ]
    },
    {
      id: "expertContent",
      title: "Экспертный контент и коммуникация",
      questions: [
        { id: "expert_1", text: "Почему эксперты часто задерживают материалы, правки или согласования?", goal: "Понимание работы с экспертами" },
        { id: "expert_2", text: "Как SMM может получать от эксперта качественный материал без конфликта и давления?", goal: "Коммуникация и координация" },
        { id: "expert_3", text: "Как сохранить голос эксперта, но адаптировать материал под соцсети?", goal: "Контент-мышление" }
      ]
    },
    {
      id: "growth",
      title: "Рост, тренды и развитие",
      questions: [
        { id: "growth_1", text: "Почему команды часто не внедряют новые форматы, даже когда видят, что старые работают хуже?", goal: "Инициативность и тестирование" },
        { id: "growth_2", text: "Как отличить полезный тренд от шумной моды, которая не подходит проекту?", goal: "Критичность и бизнес-логика" }
      ]
    },
    {
      id: "culture",
      title: "Культура и обратная связь",
      questions: [
        { id: "culture_1", text: "Почему люди иногда защищают свой контент вместо того, чтобы спокойно улучшить его по обратной связи?", goal: "Зрелость и работа с критикой" },
        { id: "culture_2", text: "Какая обратная связь помогает SMM расти, а какая разрушает работу?", goal: "Коммуникационный стиль" }
      ]
    }
  ],
  cases: [
    {
      id: "expertText",
      title: "Экспертный текст нужно превратить в контент",
      situation: "Эксперт дал длинный текст на тему '5 ошибок компаний при построении маркетинговой воронки'. Нужно быстро превратить его в контент на несколько площадок.",
      questions: ["Какие 3-5 единиц контента вы сделаете?", "Какая логика охват/вовлечение/лид будет в плане?", "Какие CTA и метрики заложите?"],
      evaluates: "Работа с экспертным материалом, воронка, форматное мышление, конкретика."
    },
    {
      id: "reachNoLeads",
      title: "Охваты растут, заявок нет",
      situation: "За месяц охваты выросли, но заявок и регистраций почти нет. Руководитель спрашивает, что делать.",
      questions: ["Какие данные проверите первыми?", "Какие гипотезы предложите?", "Что измените в контенте, профиле, ссылках и CTA?"],
      evaluates: "Аналитика, диагностика, понимание пользовательского пути."
    },
    {
      id: "approvalRisk",
      title: "Согласования срывают публикации",
      situation: "Эксперт и руководитель задерживают правки, публикации выходят поздно, команда начинает обвинять SMM.",
      questions: ["Как выстроите процесс согласований?", "Что зафиксируете заранее?", "Как предупредите повторение ситуации?"],
      evaluates: "Коммуникация, ответственность, управление рисками без формальной власти."
    },
    {
      id: "weakContentPlan",
      title: "Контент-план не дает результата",
      situation: "Контент выходит регулярно, но вовлеченность и заявки падают. План уже утвержден на месяц.",
      questions: ["Как докажете проблему?", "Как предложите изменения без конфликта?", "Какие тесты запустите на 2 недели?"],
      evaluates: "Проактивность, аргументация данными, готовность отвечать за результат."
    }
  ],
  scorecard: [
    { id: "expertContent", title: "Работа с экспертным контентом", description: "Умеет извлекать смыслы, адаптировать под площадки и сохранять голос эксперта.", sources: "Проективный блок про эксперта, кейс экспертного текста" },
    { id: "funnelAnalytics", title: "Аналитика и мышление воронкой", description: "Связывает охваты, вовлечение, CTA, путь пользователя, заявки и качество лидов.", sources: "Блок аналитики, кейс 'охваты растут, заявок нет'" },
    { id: "responsibility", title: "Ответственность и дедлайны", description: "Заранее поднимает риски, не скрывает проблемы, предлагает решения.", sources: "Блок ответственности, кейс согласований" },
    { id: "toolsDesign", title: "Инструменты, дизайн и самостоятельность", description: "Может без лишней зависимости от дизайнера подготовить базовую визуальную и операционную часть.", sources: "Анкета, уточняющие вопросы по портфолио" },
    { id: "communication", title: "Коммуникация с экспертом и командой", description: "Четко ставит задачи, согласует ожидания, держит рабочие границы.", sources: "Блок экспертного контента, кейс согласований" },
    { id: "growth", title: "Рост, тренды и гипотезы", description: "Предлагает тесты, отслеживает референсы, не действует только по привычке.", sources: "Блок роста, кейс слабого контент-плана" },
    { id: "feedback", title: "Культура и обратная связь", description: "Спокойно принимает правки, умеет улучшать работу без защиты эго.", sources: "Блок культуры, общая динамика интервью" },
    { id: "businessOrientation", title: "Ориентация на бизнес-результат", description: "Понимает, что SMM должен помогать воронке, а не только выпускать контент.", sources: "Все кейсы, ответы про метрики и заявки" }
  ],
  decisionFields: interviewDecisionFields
};

const projectManagerInterview = {
  title: "Интервью менеджера проектов",
  subtitle: "Сценарий для роли проджекта онлайн-школы: запуски, воронки, GetCourse, дедлайны, команда и аналитика.",
  duration: "45-60 минут",
  sourceNote: "Интегрирована методология структурированного интервью по Светлане Ивановой: проективные вопросы, кейсы, оценка 1-5 по компетенциям и фиксация фактов.",
  intro: [
    "Цель интервью - проверить способность кандидата управлять запуском, воронкой, командой и рисками в онлайн-школе.",
    "Анкета показывает первичный fit. Интервью должно проверить реальные управленческие паттерны: как кандидат думает, координирует людей, работает с цифрами и действует в аврале."
  ],
  structure: [
    { title: "Вводная", timing: "5-7 минут", description: "Формат интервью, ожидания от роли, короткая рамка по онлайн-школе и запускам." },
    { title: "Опыт и факты", timing: "10-15 минут", description: "Проекты, личная зона ответственности, инструменты, воронки, отчеты." },
    { title: "Проективные вопросы", timing: "20-25 минут", description: "Мотивация, ответственность, команда, трафик/воронки, аналитика, стресс." },
    { title: "Кейсы", timing: "15-20 минут", description: "Вебинар, автоворонка, конфликт команды, разбор проваленного запуска." },
    { title: "Итоги", timing: "5 минут", description: "Вопросы кандидата, ожидания, следующий шаг." }
  ],
  principles: interviewPrinciples,
  projectiveBlocks: [
    {
      id: "motivation",
      title: "Мотивация и роль проджекта",
      questions: [
        { id: "pm_1", text: "Почему люди выбирают работу проджект-менеджером в онлайн-школе?", goal: "Мотивация и понимание роли" },
        { id: "pm_2", text: "Почему проджекты в онлайн-школах быстро выгорают?", goal: "Риски, ожидания, стресс" },
        { id: "pm_3", text: "Что удерживает сильного проджекта в одной школе надолго?", goal: "Ценности и условия эффективности" }
      ]
    },
    {
      id: "deadlines",
      title: "Ответственность и дедлайны",
      questions: [
        { id: "pm_4", text: "Почему команды часто срывают сроки запусков и вебинаров?", goal: "Диагностика причин хаоса" },
        { id: "pm_5", text: "Чем ответственный проджект отличается от формального координатора?", goal: "Ответственность за результат" },
        { id: "pm_6", text: "Когда ради дедлайна допустимо пожертвовать качеством, а когда нельзя?", goal: "Приоритеты и риск-менеджмент" }
      ]
    },
    {
      id: "team",
      title: "Команда и конфликты",
      questions: [
        { id: "pm_7", text: "Почему возникают конфликты между маркетингом, техспециалистом и экспертом?", goal: "Понимание ролей и интересов" },
        { id: "pm_8", text: "Когда проджект становится бутылочным горлышком, а когда решает хаос?", goal: "Самоорганизация и делегирование" },
        { id: "pm_9", text: "Что должен делать проджект, если эксперт не готовит материалы вовремя?", goal: "Работа с экспертом" }
      ]
    },
    {
      id: "funnels",
      title: "Трафик, воронки и GetCourse",
      questions: [
        { id: "pm_10", text: "Почему при нормальном трафике запуск может не дать выручку?", goal: "Воронка и диагностика" },
        { id: "pm_11", text: "Чего чаще всего не хватает проджектам для управления автоворонками?", goal: "Понимание автоматизации" },
        { id: "pm_12", text: "Почему команды не любят изменения в воронке в последний момент?", goal: "Оценка последствий изменений" }
      ]
    },
    {
      id: "data",
      title: "Аналитика и данные",
      questions: [
        { id: "pm_13", text: "Почему проджекты иногда не любят аналитику?", goal: "Отношение к цифрам" },
        { id: "pm_14", text: "В каких ситуациях проджект обязан опираться на данные, а не на мнение?", goal: "Данные против ощущений" },
        { id: "pm_15", text: "Почему команды повторяют ошибки прошлых запусков?", goal: "Ретроспективы и обучение" }
      ]
    },
    {
      id: "stress",
      title: "Стресс и горячие запуски",
      questions: [
        { id: "pm_16", text: "Что делать, если за неделю до запуска меняют оффер, креативы и вебинар?", goal: "Приоритизация в аврале" },
        { id: "pm_17", text: "Когда проджект имеет право сказать руководителю 'нет'?", goal: "Границы и ответственность" },
        { id: "pm_18", text: "Почему одни проджекты в стрессе микроменеджерят, а другие исчезают?", goal: "Поведение под давлением" }
      ]
    }
  ],
  cases: [
    {
      id: "webinarRisk",
      title: "Вебинар через 2 дня, подготовка разваливается",
      situation: "Презентация не готова, на лендинге нет оффера, письма не собраны, эксперт занят.",
      questions: ["Что проверите в первые 30 минут?", "Как расставите приоритеты?", "Кому и как поставите задачи?", "Что сообщите руководителю?"],
      evaluates: "Управление запуском, дедлайны, коммуникация, работа с экспертом."
    },
    {
      id: "leakyFunnel",
      title: "Дырявая автоворонка GetCourse",
      situation: "Лид-магнит, 3 письма и продающее письмо. Трафик стабильный, CPL нормальный, после второго письма резкое падение, кликов мало, продаж нет.",
      questions: ["Какие метрики посмотрите?", "Какие гипотезы дадите?", "Что поменяете первым?", "Как оформите отчет руководителю?"],
      evaluates: "Аналитика, системное мышление, управление воронкой."
    },
    {
      id: "teamConflict",
      title: "Конфликт команды на запуске",
      situation: "Маркетолог хочет больше офферов и бонусов, техспециалист не успевает собрать и протестировать, эксперт отказывается сокращать программу, собственник требует максимум выручки.",
      questions: ["Как разведете интересы?", "Как примете решение?", "Какие риски зафиксируете?", "Что согласуете письменно?"],
      evaluates: "Коммуникация, лидерство без власти, управление конфликтом."
    },
    {
      id: "failedLaunch",
      title: "Разбор проваленного запуска",
      situation: "Выручка низкая, CPL нормальный, посещаемость нормальная, но просмотр оффера падает, конверсия вебинар-платеж низкая. Команда обвиняет трафик.",
      questions: ["Как проведете ретроспективу?", "Какие данные соберете?", "Какие выводы можно и нельзя делать?", "Что измените в следующем запуске?"],
      evaluates: "Аналитика, ответственность, системное мышление, культура разбора ошибок."
    }
  ],
  scorecard: [
    { id: "launchManagement", title: "Управление запуском и воронками", description: "Планирует, видит структуру запуска, понимает связку трафик - воронка - вебинар - LTV.", sources: "Проективные вопросы про запуски, кейсы вебинара и автоворонки" },
    { id: "systemsThinking", title: "Системное мышление", description: "Диагностирует проблемы, выделяет приоритеты, не теряется в сложных задачах.", sources: "Кейсы автоворонки и проваленного запуска" },
    { id: "responsibility", title: "Ответственность и дедлайны", description: "Заранее поднимает риски, не скрывает проблемы, умеет договариваться по срокам.", sources: "Блок дедлайнов, кейсы вебинара и конфликта" },
    { id: "communication", title: "Коммуникация и координация", description: "Четко ставит задачи, согласует ожидания, договаривается с разными ролями.", sources: "Блок команды, кейсы вебинара и конфликта" },
    { id: "expertWork", title: "Работа с экспертом/спикером", description: "Выстраивает границы, поддерживает эксперта и добивается результата.", sources: "Кейс вебинара, вопросы про эксперта" },
    { id: "analytics", title: "Аналитика и ориентация на данные", description: "Смотрит в цифры, формирует гипотезы, не прячется за ощущениями.", sources: "Блок аналитики, кейсы автоворонки и провала" },
    { id: "stress", title: "Стрессоустойчивость", description: "Сохраняет эффективность в авралах и изменениях, не уходит в хаос.", sources: "Блок горячего запуска" },
    { id: "clientFocus", title: "Клиентоориентированность", description: "Понимает влияние решений на учеников/клиентов, балансирует интересы.", sources: "Кейсы качества, запуска и оффера" },
    { id: "leadership", title: "Лидерство без власти", description: "Ведет команду без формального ресурса, влияет аргументами и структурой.", sources: "Кейсы конфликта и вебинара" },
    { id: "cultureFit", title: "Культурный фит", description: "Совпадает по ценностям с командой школы: честность, ответственность, развитие.", sources: "Все интервью, проективные вопросы" }
  ],
  decisionFields: interviewDecisionFields
};

const defaultConfig = {
  version: 12,
  vacancyCode: "smm",
  publicTitle: "SMM-менеджер",
  adminTitle: "SMM",
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
  },
  interview: smmInterview,
  testAssignment: {
    enabled: true,
    threshold: 80,
    enabledStatuses: ["green"],
    title: "Практическое задание для SMM-менеджера",
    profileUrl: "https://www.instagram.com/mednikova.promanagement/",
    submitFormat: "Google Документ с открытым доступом по ссылке",
    instruction: [
      "Посмотрите Instagram-профиль Екатерины Медниковой: https://www.instagram.com/mednikova.promanagement/.",
      "Коротко опишите первое впечатление: что понятно сразу, а что вызывает вопросы.",
      "Найдите 3 сильные стороны профиля с точки зрения SMM.",
      "Найдите 3 зоны роста: упаковка, контент, визуал, сторис, закрепы, CTA, путь к заявке.",
      "Предложите 5 конкретных гипотез улучшения на ближайшие 2 недели.",
      "Предложите 3-5 контент-единиц: пост, Reels, stories, Telegram-адаптация или другой формат.",
      "Укажите, какие метрики вы бы отслеживали, чтобы понять, что гипотезы сработали."
    ],
    evaluationCriteria: [
      { id: "diagnostics", title: "Диагностика профиля", max: 20, description: "Видит сильные и слабые стороны, не ограничивается вкусовыми комментариями." },
      { id: "funnelThinking", title: "Мышление воронкой", max: 20, description: "Связывает контент, CTA, путь пользователя и заявку." },
      { id: "specificity", title: "Конкретика рекомендаций", max: 20, description: "Дает применимые гипотезы, а не общие советы." },
      { id: "contentThinking", title: "Контент-мышление", max: 15, description: "Предлагает разные форматы и адаптацию под площадки." },
      { id: "metrics", title: "Метрики и аналитика", max: 15, description: "Понимает, как измерять результат." },
      { id: "communication", title: "Структура и ясность", max: 10, description: "Документ легко читать, выводы оформлены понятно и профессионально." }
    ]
  },
  ui: {
    welcomeLabel: "SMM-менеджер",
    welcomeTitle: "Привет! Давайте познакомимся",
    welcomeLead: "Мы рады, что вы заинтересовались вакансией SMM-менеджера. Ответьте на несколько вопросов, чтобы мы быстрее поняли ваш опыт, подход к работе и соответствие роли.",
    welcomeSublead: "Анкета займет около 7-10 минут. Большинство вопросов с выбором ответа, а открытых вопросов всего два.",
    facts: ["24 вопроса", "7-10 минут", "по делу"],
    sashaIntro: "Я Саша. Помогу вам пройти анкету и ответить на наши вопросы.",
    guideAlt: "Помощник анкеты SMM",
    testLead: "Спасибо за ответы. По итогам анкеты видно, что ваш опыт может быть близок к нашей роли, поэтому предлагаем следующий небольшой шаг - показать себя в деле.",
    testSublead: "Это не большое тестовое на полдня, а короткое практическое задание, чтобы мы увидели ваш подход к SMM-мышлению, аналитике и гипотезам.",
    testSpeech: "Класс! Анкета выглядит сильной. Давайте посмотрим, как вы думаете на практике.",
    declineLead: "Спасибо за ответы. Мы сохранили анкету и передадим ее менеджеру по персоналу.",
    declineSpeech: "Анкета сохранена. Если опыт подойдет под текущую задачу, команда свяжется с вами."
  }
};

const projectManagerConfig = {
  version: 5,
  vacancyCode: "project-manager",
  publicTitle: "Менеджер проектов",
  adminTitle: "Проджект",
  title: "Анкета менеджера проектов",
  intro: "7-10 минут. Цель - быстро понять опыт в управлении задачами, сроками, подрядчиками, запусками и воронками.",
  defaults: {
    vacancyMin: 90000,
    vacancyMax: 160000
  },
  labels: {
    projectExperience: {
      lt6: "Менее 6 месяцев",
      "6_12": "6-12 месяцев",
      "1_2": "1-2 года",
      more2: "Более 2 лет"
    },
    domains: {
      onlineEducation: "Онлайн-школы / EdTech",
      launches: "Маркетинговые запуски",
      marketing: "Маркетинговый отдел",
      automation: "Автоматизация / разработка / ИТ",
      events: "Онлайн- или офлайн-мероприятия",
      admin: "Административная координация",
      other: "Другая сфера"
    },
    onlineEducationExperience: {
      school: "Да, работал(а) в онлайн-школе",
      contractor: "Да, работал(а) с образовательными проектами как подрядчик",
      launches: "Нет, но был опыт маркетинговых запусков",
      fastLearner: "Нет, но быстро разбираюсь",
      none: "Нет и пока слабо понимаю, как устроены онлайн-школы"
    },
    projectResponsibilities: {
      tasks: "Ведение задач и сроков",
      contractors: "Постановка задач подрядчикам",
      funnelCheck: "Проверка воронок, ссылок, форм, писем",
      webinars: "Подготовка вебинаров / автовебинаров",
      reports: "Сбор отчетов и показателей",
      sales: "Коммуникация с отделом продаж",
      legal: "Работа с договорами / юристом / площадками",
      assistant: "В основном личные поручения руководителя"
    },
    projectTools: {
      docsSheets: "Google Docs / Google Sheets",
      taskManagers: "Trello / ClickUp / YouGile / Asana / Notion",
      getcourse: "GetCourse или похожая LMS",
      crm: "Bitrix24 или другая CRM",
      miroFigma: "Miro / Figma / Canva на уровне просмотра и комментариев",
      noTools: "Почти не работал(а) с такими инструментами"
    },
    sheetsLevel: {
      one: "1 - почти не работаю",
      two: "2 - могу заполнить готовую таблицу",
      three: "3 - уверенно веду таблицы, фильтры, простые формулы",
      four: "4 - могу собрать отчет и сделать выводы",
      five: "5 - хорошо работаю с формулами, сводными и аналитикой"
    },
    workFormat: labels.workFormat,
    availability: labels.availability,
    workValues: labels.workValues
  },
  questions: [
    { id: "fullName", title: "Как вас зовут?", type: "namePair", required: true },
    { id: "contacts", title: "Как с вами связаться?", type: "contactPair", required: true },
    { id: "portfolio", title: "Прикрепите ссылку на резюме, профиль или файл", type: "resumeAttachment", required: true, placeholder: "Ссылка на резюме или профиль" },
    { section: "Опыт", id: "projectExperience", title: "Какой у вас общий опыт проектной координации или управления проектами?", type: "radio", required: true },
    { id: "domains", title: "В каких сферах вы работали как менеджер проектов?", type: "checkbox", maxPick: 5, required: true },
    { id: "onlineEducationExperience", title: "Был ли опыт в онлайн-школах, EdTech, инфобизнесе или образовательных проектах?", type: "radio", required: true },
    { section: "Задачи роли", id: "projectResponsibilities", title: "С какими задачами вы реально работали?", type: "checkbox", maxPick: 7, required: true },
    { id: "projectTools", title: "С какими инструментами вы уверенно работаете?", type: "checkbox", maxPick: 6, required: true },
    { id: "sheetsLevel", title: "Насколько уверенно вы работаете с Google Sheets / Excel?", type: "radio", required: true },
    { section: "Практические ситуации", id: "projectCase", title: "Опишите один проект, где вы отвечали за сроки, задачи и координацию людей.", type: "textarea", max: 900, required: true },
    { id: "deadlineRiskCase", title: "Что вы делаете, если подрядчик срывает срок за день до запуска?", type: "textarea", max: 700, required: true },
    { id: "funnelCheck", title: "Как вы проверяете готовность воронки, вебинара или страницы перед запуском?", type: "textarea", max: 700, required: true },
    { section: "Ожидания", id: "workValues", title: "Что для вас ближе всего в работе?", type: "checkbox", maxPick: 3, required: true },
    { id: "workFormat", title: "Какой формат работы вам подходит?", type: "checkbox", required: true },
    { id: "income", title: "Какие у вас ожидания по доходу?", type: "text", required: true, placeholder: "Например: 120 000 руб." },
    { id: "availability", title: "Когда вы готовы выйти?", type: "radio", required: true },
    { section: "Финальная оценка", id: "questionnaireFeedbackRating", title: "Это был последний вопрос, вы справились 👍. Пожалуйста поделитесь насколько наши вопросы показались вам интересными и эффективными", type: "questionRating", required: true }
  ],
  scoring: {
    mode: "weightedFields",
    rawMax: 100,
    optionScores: {
      projectExperience: { lt6: 0, "6_12": 4, "1_2": 7, more2: 10 },
      domains: { onlineEducation: 5, launches: 4, marketing: 3, automation: 3, events: 2, admin: 1, other: 0 },
      onlineEducationExperience: { school: 10, contractor: 7, launches: 5, fastLearner: 2, none: 0 },
      projectResponsibilities: { tasks: 3, contractors: 3, funnelCheck: 3, webinars: 3, reports: 3, sales: 2, legal: 2, assistant: 0 },
      projectTools: { docsSheets: 2, taskManagers: 2, getcourse: 3, crm: 2, miroFigma: 1, noTools: 0 },
      sheetsLevel: { one: 0, two: 2, three: 6, four: 8, five: 10 },
      workValues: optionScores.workValues
    },
    caps: {
      domains: 10,
      projectResponsibilities: 15,
      projectTools: 10,
      workValues: 8
    },
    blocks: {
      portfolio: [{ field: "portfolio", type: "portfolio" }],
      experience: [
        { field: "projectExperience", type: "single" },
        { field: "domains", type: "sum", cap: 10 },
        { field: "onlineEducationExperience", type: "single" }
      ],
      responsibilities: [{ field: "projectResponsibilities", type: "sum", cap: 15 }],
      tools: [
        { field: "projectTools", type: "sum", cap: 10 },
        { field: "sheetsLevel", type: "single" }
      ],
      practicalCases: [
        { field: "projectCase", type: "text", keywords: ["срок", "задач", "ответствен", "статус", "результ", "риск", "команд", "подряд"], max: 10 },
        { field: "deadlineRiskCase", type: "text", keywords: ["предупреж", "вариант", "руковод", "подряд", "срок", "риск", "решен", "фикс"], max: 10 },
        { field: "funnelCheck", type: "text", keywords: ["ссыл", "форм", "письм", "страниц", "тест", "вебинар", "путь", "заяв"], max: 10 }
      ],
      culture: [{ field: "workValues", type: "sum", cap: 8 }]
    },
    thresholds: {
      green: 75,
      yellow: 55,
      orange: 40
    }
  },
  interview: projectManagerInterview,
  testAssignment: {
    enabled: true,
    threshold: 70,
    enabledStatuses: ["green", "yellow"],
    title: "Практическое задание для менеджера проектов",
    submitFormat: "Google Документ или Google Таблица с открытым доступом по ссылке",
    instruction: [
      "Представьте, что через 10 дней у онлайн-школы проходит открытый вебинар.",
      "Подготовьте план работ на 10 дней: задачи, ответственные, сроки, статусы и проверки.",
      "Составьте список рисков и действий по каждому риску.",
      "Сделайте чек-лист проверки перед запуском трафика и чек-лист за день до вебинара.",
      "Опишите, как передадите заявки и вводные в отдел продаж.",
      "Укажите, какие показатели соберете после вебинара и как будет выглядеть короткий отчет руководителю."
    ],
    evaluationCriteria: [
      { id: "plan", title: "Логика плана работ", max: 20, description: "Есть последовательность, сроки и приоритеты." },
      { id: "tasks", title: "Задачи и ответственные", max: 20, description: "Понятно, кто что делает и к какому сроку." },
      { id: "checks", title: "Проверка готовности", max: 20, description: "Проверены ссылки, формы, письма, вебинар и путь пользователя." },
      { id: "risks", title: "Работа с рисками", max: 15, description: "Риски видны заранее, есть варианты действий." },
      { id: "sales", title: "Передача в продажи", max: 10, description: "Есть понятная передача лидов и вводных." },
      { id: "report", title: "Отчетность", max: 10, description: "Есть цифры, выводы и следующий шаг." },
      { id: "clarity", title: "Ясность подачи", max: 5, description: "Документ легко читать и использовать." }
    ]
  },
  ui: {
    welcomeLabel: "Менеджер проектов",
    welcomeTitle: "Привет! Давайте познакомимся",
    welcomeLead: "Мы рады, что вы заинтересовались вакансией менеджера проектов. Ответьте на несколько вопросов, чтобы мы быстрее поняли ваш опыт в задачах, сроках, подрядчиках, запусках и воронках.",
    welcomeSublead: "Анкета займет около 7-10 минут. Большинство вопросов с выбором ответа, открытые вопросы нужны только для проверки практического мышления.",
    facts: ["17 вопросов", "7-10 минут", "по делу"],
    sashaIntro: "Я Саша. Помогу пройти анкету и спокойно разложить ваш проектный опыт.",
    guideAlt: "Помощник анкеты менеджера проектов",
    testLead: "Спасибо за ответы. По итогам анкеты видно, что ваш опыт может быть близок к роли менеджера проектов, поэтому предлагаем следующий шаг - практическое задание.",
    testSublead: "Задание короткое: нужно показать, как вы ведете запуск, сроки, риски, подрядчиков и отчетность.",
    testSpeech: "Хорошо! Теперь посмотрим, как вы управляете запуском на практике.",
    declineLead: "Спасибо за ответы. Мы сохранили анкету и передадим ее менеджеру по персоналу.",
    declineSpeech: "Анкета сохранена. Если опыт подойдет под текущую задачу, команда свяжется с вами."
  },
  guideCaptions: {
    fullName: "Начнем с простого: как к вам обращаться.",
    contacts: "Оставьте контакты, чтобы менеджер по персоналу мог быстро связаться с вами.",
    portfolio: "Резюме помогает увидеть ваш опыт без лишней переписки.",
    projectExperience: "Здесь важно понять общий уровень проектной самостоятельности.",
    domains: "Отметьте сферы, где вы реально вели задачи и людей.",
    onlineEducationExperience: "Опыт онлайн-школ полезен, но важнее понимание запусков и процессов.",
    projectResponsibilities: "Выберите то, что действительно было вашей зоной ответственности.",
    projectTools: "Инструменты показывают, насколько быстро вы войдете в рабочий процесс.",
    sheetsLevel: "Таблицы нужны для статусов, отчетов, лидов и контроля.",
    projectCase: "Покажите конкретный пример: цель, ограничения, ваши действия и результат.",
    deadlineRiskCase: "Проектная зрелость видна по тому, как человек работает со срывами сроков.",
    funnelCheck: "Здесь проверяем внимательность к деталям перед запуском.",
    workValues: "Сверяем рабочие принципы и то, как вам комфортно взаимодействовать с командой.",
    workFormat: "Уточняем формат, чтобы не тратить время на неподходящие условия.",
    income: "Фиксируем ожидания по доходу до интервью.",
    availability: "Понимаем, когда реально можно планировать выход."
  }
};

const smmVacancyConfig = { ...defaultConfig };
defaultConfig.vacancies = {
  smm: smmVacancyConfig,
  "project-manager": projectManagerConfig
};
defaultConfig.activeVacancyCode = "smm";

module.exports = { defaultConfig };
