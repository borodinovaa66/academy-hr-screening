const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveVacancyState, filterSubmissionsByVacancy } = require("../public/vacancy-state.js");

test("готовый пакет без запуска не считается работающим подбором", () => {
  assert.equal(resolveVacancyState({ code: "project-manager" }).code, "ready");
});

test("активный запуск считается работающим подбором", () => {
  const result = resolveVacancyState({
    code: "smm",
    openings: [{ id: "opening-1", vacancyCode: "smm", status: "active" }]
  });
  assert.equal(result.code, "recruiting");
});

test("черновик, закрытый запуск и архив определяются отдельно", () => {
  assert.equal(resolveVacancyState({
    code: "draft-role",
    openings: [{ vacancyCode: "draft-role", status: "draft" }]
  }).code, "draft");
  assert.equal(resolveVacancyState({
    code: "closed-role",
    openings: [{ vacancyCode: "closed-role", status: "closed" }]
  }).code, "closed");
  assert.equal(resolveVacancyState({
    code: "archived-role",
    vacancy: { active: false }
  }).code, "archive");
});

test("архив HeadHunter имеет приоритет над устаревшим активным запуском", () => {
  const result = resolveVacancyState({
    code: "role",
    openings: [{ vacancyCode: "role", status: "active", hhPublicationId: "publication-1" }],
    publications: [{
      id: "publication-1",
      vacancyCode: "role",
      status: "published",
      payload: { hhMetrics: { archived: true } }
    }]
  });
  assert.equal(result.code, "archive");
});

test("анкеты одной вакансии не попадают в другую", () => {
  const submissions = [
    { id: "1", vacancyCode: "project-manager" },
    { id: "2", vacancyCode: "prodzhekt-marketolog-onlayn-shkola" },
    { id: "3", vacancyCode: "prodzhekt-marketolog-onlayn-shkola" }
  ];
  assert.deepEqual(
    filterSubmissionsByVacancy(submissions, "project-manager").map(item => item.id),
    ["1"]
  );
});
