const { defaultConfig } = require("./defaultConfig");

const RAW_MAX = 178;

const optionScores = {
  experienceYears: {
    less1: 0,
    "1_2": 2,
    "2_3": 4,
    "3_5": 5,
    more5: 5
  },
  projectTypes: {
    b2b: 2,
    expert: 2,
    education: 2,
    consulting: 2,
    premium: 2,
    b2c: 1,
    personalBrand: 1,
    ecommerce: 1,
    lifestyle: 0,
    other: 0
  },
  socialNetworks: {
    instagram: 2,
    telegram: 2,
    linkedin: 2,
    facebook: 1,
    youtubeShorts: 1,
    tiktok: 1,
    vk: 1,
    other: 0
  },
  platformsCount: {
    one: 1,
    two: 3,
    three: 5,
    fourFive: 5,
    moreFive: 4
  },
  responsibilities: {
    publishing: 1,
    textAdaptation: 3,
    expertContent: 3,
    contentPlanning: 2,
    basicDesign: 3,
    stories: 2,
    reels: 2,
    autoposting: 2,
    analyticsReports: 3,
    growth: 3,
    leadgen: 4,
    competitors: 2,
    trendwatching: 2,
    contractors: 2
  },
  readiness: {
    adaptTexts: 3,
    basicDesign: 3,
    autoposting: 2,
    qualityCheck: 2,
    statistics: 3,
    growthHypotheses: 3,
    competitorsTrends: 3,
    aiTools: 2,
    onlyPublishing: 0
  },
  tools: {
    canva: 2,
    figma: 2,
    capcut: 2,
    autopostingServices: 3,
    sheets: 2,
    projectTools: 2,
    textAi: 2,
    visualAi: 1,
    socialAnalytics: 2,
    noTools: 0
  },
  soloDesign: {
    stories: 2,
    carousel: 3,
    cover: 2,
    banner: 2,
    resize: 2,
    videoCut: 2,
    nothing: 0
  },
  metrics: {
    reach: 1,
    er: 2,
    saves: 2,
    comments: 1,
    videoRetention: 2,
    clicks: 2,
    follows: 2,
    leads: 4,
    ctrUtm: 3,
    leadQuality: 3,
    noAnalytics: 0
  },
  noLeadsActions: {
    audienceQuality: 2,
    ctaOffer: 2,
    userPath: 2,
    funnelConversion: 2,
    wrongReachTopics: 2,
    funnelHypotheses: 2,
    morePosts: 0,
    notResponsible: 0,
    adsNoAnalysis: 0
  },
  trendFrequency: {
    weekly: 5,
    monthly: 4,
    taskBased: 2,
    rare: 1,
    never: 0
  },
  deadlineBehavior: {
    warnAndSolve: 5,
    askMove: 3,
    qualityDrop: 2,
    lateNotice: 0,
    waitManager: 0
  },
  weakPlanBehavior: {
    analyzeHypotheses: 5,
    tellAndWait: 2,
    keepExecuting: 1,
    changeAlone: 1,
    notMyZone: 0
  },
  feedbackBehavior: {
    improveCalmly: 5,
    okIfSpecific: 4,
    hardButWork: 2,
    defend: 1,
    dislike: 0
  },
  workValues: {
    openComms: 2,
    honesty: 2,
    responsibility: 3,
    testingNew: 2,
    development: 2,
    strongTeam: 1,
    freedom: 1,
    stableTasks: 0,
    creativityNoMetrics: 0,
    onlyClearTasks: 0
  }
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sumSelected(group, selected, max = Infinity) {
  const total = asArray(selected).reduce((sum, key) => sum + (group[key] || 0), 0);
  return Math.min(total, max);
}

function single(group, key) {
  return group[key] || 0;
}

function hasAnyText(text) {
  return typeof text === "string" && text.trim().length > 0;
}

function scorePortfolio(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const hasLink = /(https?:\/\/|www\.|t\.me|drive\.google|behance|notion|docs\.google|instagram|linkedin|telegram)/i.test(text);
  const hasProjectHint = /проект|case|кейс|портф|portfolio|instagram|telegram|канал|бренд|client|клиент/i.test(text);
  if (hasLink || hasProjectHint) return 5;
  return 3;
}

function scoreOpenContentCase(text) {
  const value = String(text || "").toLowerCase();
  let score = 0;
  if (/(пост|карусел|сторис|stories|reels|shorts|telegram|чек.?лист|опрос)/i.test(value)) score += 2;
  if (/(instagram|telegram|linkedin|площад|канал|адапт|формат)/i.test(value)) score += 2;
  if (/(охват|вовлеч|подпис|лид|заяв|ворон|прогрев)/i.test(value)) score += 2;
  if (/(cta|призыв|заяв|ссыл|подпис|регистрац|лид.?магнит|переход)/i.test(value)) score += 2;
  if (/(метрик|сохран|досмотр|er|ctr|utm|переход|конверс|заяв)/i.test(value)) score += 2;
  return Math.min(score, 10);
}

function scoreInnovation(text) {
  const value = String(text || "").toLowerCase();
  let score = 0;
  if (/(reels|shorts|ии|ai|chatgpt|нейро|автопост|utm|лид.?магнит|субтитр|ворон|серия|формат|инструмент)/i.test(value)) score += 2;
  if (/(внедр|сделал|сделала|запуст|добавил|добавила|использовал|использовала)/i.test(value)) score += 2;
  if (/(задач|проект|цель|лид|охват|переход|контент.?план|продаж|подпис)/i.test(value)) score += 2;
  if (/(вырос|рост|результ|вывод|оставил|оставили|сработал|сработала|метрик|месяц|недел)/i.test(value)) score += 2;
  return Math.min(score, 8);
}

function scoreTextByKeywords(text, keywords = [], max = 10) {
  const value = String(text || "").toLowerCase();
  if (!value.trim()) return 0;
  const matched = keywords.reduce((sum, keyword) => sum + (value.includes(String(keyword).toLowerCase()) ? 1 : 0), 0);
  const base = value.length > 120 ? 2 : 1;
  return Math.min(max, base + matched * 2);
}

function scoreRule(rule, answers, scores) {
  if (rule.type === "portfolio") return scorePortfolio(answers[rule.field]);
  if (rule.type === "single") return single(scores[rule.field] || {}, answers[rule.field]);
  if (rule.type === "sum") return sumSelected(scores[rule.field] || {}, answers[rule.field], rule.cap || Infinity);
  if (rule.type === "text") return scoreTextByKeywords(answers[rule.field], rule.keywords, rule.max || 10);
  return 0;
}

function scoreConfiguredBlocks(answers, config) {
  const scores = config.scoring?.optionScores || {};
  const blocksConfig = config.scoring?.blocks || {};
  return Object.fromEntries(Object.entries(blocksConfig).map(([block, rules]) => [
    block,
    rules.reduce((sum, rule) => sum + scoreRule(rule, answers, scores), 0)
  ]));
}

function pushFlag(flags, condition, title, severity = "red") {
  if (condition) flags.push({ title, severity });
}

function selectedIncludes(answers, field, key) {
  return asArray(answers[field]).includes(key);
}

function salaryStatus(incomeRaw, vacancyMin, vacancyMax) {
  const digits = String(incomeRaw || "").match(/\d[\d\s]{1,}/g);
  if (!digits || !vacancyMax) return "unknown";
  const nums = digits.map(item => Number(item.replace(/\s/g, ""))).filter(Boolean);
  const expected = Math.max(...nums);
  if (!expected) return "unknown";
  if (expected <= vacancyMax) return "green";
  if (expected <= vacancyMax * 1.2) return "yellow";
  return "red";
}

function recommendationByScore(score, flags, thresholds = {}) {
  const green = thresholds.green ?? 80;
  const yellow = thresholds.yellow ?? 65;
  const orange = thresholds.orange ?? 50;
  const hasHardRed = flags.some(flag => flag.severity === "red");
  if (hasHardRed && score < green) {
    return { code: "red", label: "Red", status: "отказ / сильный риск", action: "Не приглашать без ручной причины." };
  }
  if (score >= green) return { code: "green", label: "Green", status: "рекомендовано интервью", action: "Пригласить на первичное интервью." };
  if (score >= yellow) return { code: "yellow", label: "Yellow", status: "ручная проверка HR", action: "Проверить портфолио и 1-2 риска." };
  if (score >= orange) return { code: "orange", label: "Orange", status: "talent pool", action: "Оставить в резерве или звать при дефиците." };
  return { code: "red", label: "Red", status: "отказ", action: "Отказать на первом этапе." };
}

function makeStrengths(answers, score) {
  const strengths = [];
  if (score.blocks.experience >= 18) strengths.push("релевантный опыт по типам проектов и площадкам");
  if (selectedIncludes(answers, "responsibilities", "leadgen")) strengths.push("есть опыт лидогенерации");
  if (selectedIncludes(answers, "responsibilities", "analyticsReports") || selectedIncludes(answers, "metrics", "ctrUtm")) strengths.push("работает с аналитикой и отчетами");
  if (selectedIncludes(answers, "tools", "autopostingServices")) strengths.push("знает автопостинг");
  if (selectedIncludes(answers, "tools", "textAi")) strengths.push("использует AI-инструменты");
  if (score.blocks.culture >= 17) strengths.push("хорошие поведенческие признаки: ответственность и обратная связь");
  if (score.openScores.contentCase >= 8) strengths.push("мини-кейс показывает системное SMM-мышление");
  return strengths.length ? strengths : ["есть базовые признаки соответствия, требуется ручная проверка"];
}

function makeRisks(answers, flags, score) {
  const risks = flags.map(flag => flag.title);
  if (!selectedIncludes(answers, "projectTypes", "b2b") && !selectedIncludes(answers, "projectTypes", "premium")) {
    risks.push("не подтвержден опыт B2B или дорогих экспертных продуктов");
  }
  if (score.openScores.contentCase < 6) risks.push("мини-кейс слабый: проверить мышление на интервью");
  if (score.openScores.innovation < 4) risks.push("мало признаков внедрения новых форматов за последние месяцы");
  return [...new Set(risks)].slice(0, 8);
}

function makeConfiguredStrengths(answers, score, config) {
  const vacancy = config.publicTitle || "вакансии";
  const strengths = [];
  if ((score.blocks.experience || 0) >= 20) strengths.push(`релевантный опыт для роли "${vacancy}"`);
  if ((score.blocks.responsibilities || 0) >= 10) strengths.push("есть совпадение с ключевыми задачами роли");
  if ((score.blocks.tools || 0) >= 10) strengths.push("инструменты и таблицы выглядят рабочими");
  if ((score.blocks.practicalCases || 0) >= 18) strengths.push("практические ответы показывают системность");
  if ((score.blocks.culture || 0) >= 5) strengths.push("есть признаки ответственности и нормальной рабочей культуры");
  return strengths.length ? strengths : ["есть базовые признаки соответствия, требуется ручная проверка"];
}

function makeConfiguredRisks(answers, flags, score, config) {
  const risks = flags.map(flag => flag.title);
  if ((score.blocks.experience || 0) < 12) risks.push("мало подтвержденного релевантного опыта");
  if ((score.blocks.practicalCases || 0) < 14) risks.push("практические ответы слабые: проверить кейсы на интервью");
  if ((score.blocks.tools || 0) < 8) risks.push("может потребоваться быстрое обучение инструментам");
  if (config.vacancyCode === "project-manager" && asArray(answers.projectResponsibilities).includes("assistant")) {
    risks.push("есть риск, что кандидат воспринимает роль как личного помощника, а не менеджера проектов");
  }
  return [...new Set(risks)].slice(0, 8);
}

function scoreSubmission(payload, config = defaultConfig) {
  const answers = payload.answers || payload;
  if (!answers.fullName && (answers.firstName || answers.lastName)) {
    answers.fullName = [answers.firstName, answers.lastName].map(part => String(part || "").trim()).filter(Boolean).join(" ");
  }
  if (!answers.contacts && (answers.email || answers.phone)) {
    answers.contacts = [answers.email, answers.phone].map(part => String(part || "").trim()).filter(Boolean).join(", ");
  }
  const scores = config.scoring?.optionScores || optionScores;
  const caps = config.scoring?.caps || {};
  const rawMax = Number(config.scoring?.rawMax || RAW_MAX);
  const portfolioText = String(
    answers.portfolio ||
    answers.resumeFile?.url ||
    answers.resumeFile?.originalName ||
    ""
  ).trim();
  const candidate = {
    fullName: String(answers.fullName || "").trim(),
    contacts: String(answers.contacts || "").trim(),
    portfolio: portfolioText,
    resumeFile: answers.resumeFile || null,
    workFormat: asArray(answers.workFormat),
    income: String(answers.income || "").trim(),
    availability: String(answers.availability || "").trim()
  };

  const vacancyMin = Number(answers.vacancyMin || 0);
  const vacancyMax = Number(answers.vacancyMax || 0);
  const portfolio = scorePortfolio(candidate.portfolio);
  const openScores = {
    contentCase: scoreOpenContentCase(answers.contentCase),
    innovation: scoreInnovation(answers.innovation)
  };

  const blocks = config.scoring?.mode === "weightedFields"
    ? scoreConfiguredBlocks(answers, config)
    : {
      portfolio,
      experience:
        single(scores.experienceYears || {}, answers.experienceYears) +
        sumSelected(scores.projectTypes || {}, answers.projectTypes, caps.projectTypes || 8) +
        sumSelected(scores.socialNetworks || {}, answers.socialNetworks, caps.socialNetworks || 8) +
        single(scores.platformsCount || {}, answers.platformsCount),
      responsibilities:
        sumSelected(scores.responsibilities || {}, answers.responsibilities, caps.responsibilities || 20) +
        sumSelected(scores.readiness || {}, answers.readiness, caps.readiness || 18),
      contentCase: openScores.contentCase,
      tools:
        sumSelected(scores.tools || {}, answers.tools, caps.tools || 15) +
        sumSelected(scores.soloDesign || {}, answers.soloDesign, caps.soloDesign || 10),
      analytics:
        sumSelected(scores.metrics || {}, answers.metrics, caps.metrics || 18) +
        sumSelected(scores.noLeadsActions || {}, answers.noLeadsActions, caps.noLeadsActions || 10) +
        single(scores.trendFrequency || {}, answers.trendFrequency) +
        openScores.innovation,
      culture:
        single(scores.deadlineBehavior || {}, answers.deadlineBehavior) +
        single(scores.weakPlanBehavior || {}, answers.weakPlanBehavior) +
        single(scores.feedbackBehavior || {}, answers.feedbackBehavior) +
        sumSelected(scores.workValues || {}, answers.workValues, caps.workValues || 8)
    };

  const raw = Object.values(blocks).reduce((sum, value) => sum + value, 0);
  const total = Math.min(100, Math.round((raw / rawMax) * 100));
  const salary = salaryStatus(candidate.income, vacancyMin, vacancyMax);

  const flags = [];
  pushFlag(flags, answers.experienceYears === "less1", "опыт SMM менее 1 года");
  pushFlag(flags, answers.projectExperience === "lt6", "опыт проектной координации менее 6 месяцев");
  pushFlag(flags, portfolio === 0, "нет портфолио, ссылок или примеров проектов");
  if (config.vacancyCode !== "project-manager") {
    pushFlag(flags, !selectedIncludes(answers, "readiness", "basicDesign"), "не готов делать базовый дизайн/верстку");
    pushFlag(flags, !selectedIncludes(answers, "readiness", "statistics") || selectedIncludes(answers, "metrics", "noAnalytics"), "не подтверждена готовность работать с аналитикой");
    pushFlag(flags, !selectedIncludes(answers, "readiness", "adaptTexts"), "не готов адаптировать тексты под соцсети");
    pushFlag(flags, selectedIncludes(answers, "readiness", "onlyPublishing"), "выбран сценарий только публикации готовых материалов");
  }
  pushFlag(flags, selectedIncludes(answers, "projectTools", "noTools"), "не подтверждена работа с базовыми проектными инструментами");
  pushFlag(flags, answers.sheetsLevel === "one", "нет базовой работы с таблицами");
  pushFlag(flags, answers.trendFrequency === "never", "не отслеживает конкурентов и тренды");
  pushFlag(flags, answers.feedbackBehavior === "dislike", "плохо принимает прямую обратную связь");
  pushFlag(flags, salary === "red", "ожидания по доходу сильно выше вилки");
  pushFlag(flags, /(не хочу|не готов|не моя зона|не отвечаю).*(результ|лид|аналит|развит|заяв)/i.test(`${answers.contentCase} ${answers.innovation}`), "в открытом ответе есть отказ от ответственности за результат");

  const recommendation = recommendationByScore(total, flags, config.scoring?.thresholds);
  const score = { raw, rawMax, total, blocks, openScores, salary };
  const strengths = config.scoring?.mode === "weightedFields"
    ? makeConfiguredStrengths(answers, score, config)
    : makeStrengths(answers, score);
  const risks = config.scoring?.mode === "weightedFields"
    ? makeConfiguredRisks(answers, flags, score, config)
    : makeRisks(answers, flags, score);

  return {
    candidate,
    answers,
    score,
    recommendation,
    flags,
    strengths,
    risks,
    hrNote: recommendation.action
  };
}

function pct(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function topValues(submissions, field, limit = 6) {
  const counts = new Map();
  submissions.forEach(item => {
    asArray(item.answers?.[field]).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, count]) => ({ key, count }));
}

function distinctSessions(events, eventType, predicate = () => true) {
  const sessions = new Set();
  events
    .filter(item => item.eventType === eventType && predicate(item))
    .forEach(item => sessions.add(item.sessionId));
  return sessions.size;
}

function buildFunnel(submissions, events) {
  const completed = submissions.length;
  const visitors = Math.max(distinctSessions(events, "landing_view"), completed);
  const started = Math.max(distinctSessions(events, "start"), completed);
  const maxStep = Math.max(
    1,
    ...events
      .filter(item => item.eventType === "question_view")
      .map(item => Number(item.step) || 0)
  );
  const questionViews = Array.from({ length: maxStep }, (_, index) => ({
    step: index + 1,
    count: distinctSessions(events, "question_view", item => Number(item.step) === index + 1)
  }));
  const reachedLastQuestion = Math.max(questionViews[questionViews.length - 1]?.count || 0, completed);

  return {
    visitors,
    started,
    reachedLastQuestion,
    completed,
    visitToStart: pct(started, visitors),
    startToComplete: pct(completed, started),
    visitToComplete: pct(completed, visitors),
    questionViews
  };
}

function averageBlocks(submissions) {
  const totals = {};
  submissions.forEach(item => {
    Object.entries(item.score?.blocks || {}).forEach(([key, value]) => {
      totals[key] = totals[key] || { sum: 0, count: 0 };
      totals[key].sum += Number(value) || 0;
      totals[key].count += 1;
    });
  });
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [
    key,
    value.count ? Math.round(value.sum / value.count) : 0
  ]));
}

function buildFlowAnalytics(submissions, events = []) {
  const total = submissions.length;
  const statusCounts = submissions.reduce((acc, item) => {
    const code = item.recommendation?.code || "unknown";
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});
  const avgScore = total ? Math.round(submissions.reduce((sum, item) => sum + item.score.total, 0) / total) : 0;
  const redFlagCount = submissions.reduce((sum, item) => sum + item.flags.length, 0);
  const greenShare = pct(statusCounts.green || 0, total);
  const analyticsGap = submissions.filter(item => asArray(item.answers?.metrics).includes("noAnalytics")).length;
  const funnel = buildFunnel(submissions, events);
  const avgFlags = total ? Math.round((redFlagCount / total) * 10) / 10 : 0;

  const recommendations = [];
  if (total === 0) {
    recommendations.push("Пока нет анкет. Сначала отправьте ссылку 5-10 кандидатам и соберите первичный поток.");
  }
  if (total > 0 && greenShare < 20) {
    recommendations.push("Доля сильных кандидатов низкая. Проверьте описание вакансии: вилку дохода, требования по аналитике, формат работы и ожидания по дизайну.");
  }
  if (pct(analyticsGap, total) > 30) {
    recommendations.push("Много кандидатов без аналитики. В вакансии стоит явно написать, что роль отвечает не только за постинг, но и за метрики, гипотезы и лиды.");
  }
  if (redFlagCount / Math.max(total, 1) > 2) {
    recommendations.push("Среднее число стоп-факторов высокое. Возможно, канал привлечения дает слишком широкий нерелевантный поток.");
  }
  if (!recommendations.length) {
    recommendations.push("Поток выглядит рабочим. Следующий шаг: сравнить портфолио Green/Yellow и уточнить интервью-гайд.");
  }

  return {
    total,
    avgScore,
    statusCounts,
    greenShare,
    yellowShare: pct(statusCounts.yellow || 0, total),
    redShare: pct(statusCounts.red || 0, total),
    orangeShare: pct(statusCounts.orange || 0, total),
    avgFlags,
    funnel,
    avgBlocks: averageBlocks(submissions),
    topProjectTypes: topValues(submissions, "projectTypes"),
    topTools: topValues(submissions, "tools"),
    topMetrics: topValues(submissions, "metrics"),
    summary: total
      ? `Получено анкет: ${total}. Средний балл: ${avgScore}/100. Green: ${statusCounts.green || 0}, Yellow: ${statusCounts.yellow || 0}, Orange: ${statusCounts.orange || 0}, Red: ${statusCounts.red || 0}.`
      : "Анкеты еще не заполнены.",
    recommendations,
    marketRisks: [
      greenShare < 20 && total >= 5 ? "Мало кандидатов уровня Green: может быть слабый канал найма или завышены требования." : null,
      analyticsGap > 0 ? "Часть кандидатов воспринимает SMM как постинг без аналитики." : null
    ].filter(Boolean)
  };
}

module.exports = { scoreSubmission, buildFlowAnalytics, optionScores };
