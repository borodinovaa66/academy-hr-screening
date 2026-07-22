(function attachVacancyState(globalObject) {
  const ACTIVE_STATUSES = new Set(["active", "open", "published"]);
  const DRAFT_STATUSES = new Set(["draft", "new", "pending", "review", "approved", "publication_ready"]);
  const CLOSED_STATUSES = new Set(["closed", "cancelled", "rejected"]);

  function normalizedStatus(value) {
    return String(value || "").trim().toLowerCase();
  }

  function timestamp(value) {
    const parsed = new Date(value || 0).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function newest(items = []) {
    return [...items].sort((first, second) => (
      timestamp(second.updatedAt || second.publishedAt || second.createdAt) -
      timestamp(first.updatedAt || first.publishedAt || first.createdAt)
    ))[0] || null;
  }

  function publicationState(publication) {
    if (!publication) return "";
    const status = normalizedStatus(publication.status);
    const metrics = publication.payload?.hhMetrics || {};
    if (metrics.archived === true || status === "archived") return "archive";
    if (metrics.closedForApplicants === true || CLOSED_STATUSES.has(status)) return "closed";
    if (ACTIVE_STATUSES.has(status)) return "recruiting";
    if (DRAFT_STATUSES.has(status)) return "draft";
    return "";
  }

  function openingState(opening, publications = []) {
    if (!opening) return "";
    const linkedPublication = publications.find(item => item.id === opening.hhPublicationId);
    const linkedState = publicationState(linkedPublication);
    if (linkedState === "archive" || linkedState === "closed") return linkedState;

    const status = normalizedStatus(opening.status);
    if (ACTIVE_STATUSES.has(status)) return "recruiting";
    if (CLOSED_STATUSES.has(status)) return "closed";
    if (DRAFT_STATUSES.has(status)) return "draft";
    return "draft";
  }

  function resolveVacancyState({ code, vacancy = {}, openings = [], publications = [], texts = [] } = {}) {
    const vacancyOpenings = openings.filter(item => item.vacancyCode === code);
    const vacancyPublications = publications.filter(item => item.vacancyCode === code);
    const vacancyTexts = texts.filter(item => item.vacancyCode === code);
    const latestOpening = newest(vacancyOpenings);
    const latestPublication = newest(vacancyPublications);
    const resolvedOpeningState = openingState(latestOpening, vacancyPublications);

    if (resolvedOpeningState) {
      return {
        code: resolvedOpeningState,
        opening: latestOpening,
        publication: latestOpening?.hhPublicationId
          ? vacancyPublications.find(item => item.id === latestOpening.hhPublicationId) || latestPublication
          : latestPublication
      };
    }

    const resolvedPublicationState = publicationState(latestPublication);
    if (resolvedPublicationState) {
      return { code: resolvedPublicationState, opening: null, publication: latestPublication };
    }

    if (vacancyTexts.length) {
      return { code: "draft", opening: null, publication: null };
    }
    if (vacancy.active === false) {
      return { code: "archive", opening: null, publication: null };
    }
    return { code: "ready", opening: null, publication: null };
  }

  function filterSubmissionsByVacancy(submissions = [], vacancyCode = "") {
    return submissions.filter(item => String(item?.vacancyCode || "") === String(vacancyCode || ""));
  }

  const api = { resolveVacancyState, filterSubmissionsByVacancy };
  globalObject.HrVacancyState = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
