const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("explicit no-vacancies choice clears access and follows individual choices", () => {
  const source = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  const context = vm.createContext({
    state: {
      staffForm: { role: "hiring_manager", vacancyAccess: [], email: "", displayName: "", password: "" },
      vacancies: { smm: { title: "SMM" } }, adminUsers: []
    },
    el: (tag, attrs = {}, children = []) => ({ tag, attrs, children }),
    icon: () => "", iconEl: () => ({}), render() {}, createStaffUser() {}
  });
  vm.runInContext(source.slice(source.indexOf("function toggleStaffVacancy("), source.indexOf("async function createStaffUser(")), context);
  vm.runInContext(source.slice(source.indexOf("function staffManagementView("), source.indexOf("function auditLogView(")), context);
  const flatten = node => [node, ...(node?.children || []).flatMap(child => typeof child === "object" ? flatten(child) : [])];
  const choice = text => flatten(context.staffManagementView()).find(node => node.tag === "label" && node.children.some(child => child?.tag === "strong" && child.children.includes(text))).children[0];
  assert.equal(choice("Пока нет вакансий").attrs.checked, "checked");
  choice("SMM").attrs.onchange({ target: { checked: true } });
  assert.equal(choice("Пока нет вакансий").attrs.checked, null);
  assert.equal(choice("SMM").attrs.checked, "checked");
  choice("Пока нет вакансий").attrs.onchange({ target: { checked: true } });
  assert.equal(context.state.staffForm.vacancyAccess.length, 0);
  assert.equal(choice("SMM").attrs.checked, null);
  assert.equal(choice("Пока нет вакансий").attrs.checked, "checked");
  context.state.vacancies = {};
  assert.equal(choice("Пока нет вакансий").attrs.checked, "checked");
});
