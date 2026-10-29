import { test } from "node:test";
import assert from "node:assert/strict";
import { CORE, defaultForm, definitionProblems, extraValues, normalizeForm, validateSubmission } from "../forms/schema";

const TODAY = "2026-10-07";

test("legacy stored values (list of names, JSON string) fall back to the built-in form", () => {
  for (const raw of [["contactPerson", "phone"], JSON.stringify(["a", "b"]), "not json", null, []]) {
    assert.deepEqual(normalizeForm("quote", raw), defaultForm("quote"));
  }
});

test("built-in fields keep their type and lock; locked ones stay shown and required", () => {
  const def = defaultForm("quote");
  const tampered = def.fields.map((f) =>
    f.key === "phone" ? { ...f, type: "checkbox", required: false, enabled: false } : f
  );
  const phone = normalizeForm("quote", tampered).fields.find((f) => f.key === "phone")!;
  assert.equal(phone.type, "tel");
  assert.equal(phone.required, true);
  assert.equal(phone.enabled, true);
});

test("deleted built-in fields come back (hidden unless the workflow needs them)", () => {
  const def = defaultForm("quote");
  const without = def.fields.filter((f) => f.key !== "weight" && f.key !== "pickupLocation");
  const n = normalizeForm("quote", without);
  assert.equal(n.fields.find((f) => f.key === "weight")?.enabled, false);
  assert.equal(n.fields.find((f) => f.key === "pickupLocation")?.enabled, true);
});

test("unsafe or duplicate keys and unknown types are dropped", () => {
  const def = defaultForm("contact");
  const n = normalizeForm("contact", [
    ...def.fields,
    { key: "__proto__", type: "text", label: "x" },
    { key: "c1", type: "script", label: "x" },
    { key: "name", type: "text", label: "dup" },
    { key: "cColour", type: "select", label: "Colour", options: ["Red", "Red", " ", "Blue"] },
  ]);
  assert.ok(!n.fields.some((f) => f.key === "__proto__" || f.key === "c1"));
  assert.equal(n.fields.filter((f) => f.key === "name").length, 1);
  assert.deepEqual(n.fields.find((f) => f.key === "cColour")?.options, ["Red", "Blue"]);
});

test("hidden fields are ignored, optional made required is enforced", () => {
  const def = defaultForm("quote");
  def.fields = def.fields.map((f) =>
    f.key === "companyName" ? { ...f, required: true } : f.key === "transportDate" ? { ...f, enabled: false } : f
  );
  const base = { contactPerson: "A", phone: "+255700000000", pickupLocation: "Dar", deliveryLocation: "Arusha", cargoType: "Other", transportType: "Road" };
  const r1 = validateSubmission(def, base, "en", TODAY);
  assert.ok(r1.errors.companyName, "now required");
  assert.ok(!r1.errors.transportDate, "hidden → not required");
  const r2 = validateSubmission(def, { ...base, companyName: "Co", transportDate: "2020-01-01" }, "en", TODAY);
  assert.deepEqual(r2.errors, {});
  assert.equal(r2.values.transportDate, undefined, "hidden field's value is dropped");
});

test("types, options, integers, dates and order are validated", () => {
  const def = defaultForm("quote");
  const r = validateSubmission(def, {
    contactPerson: "A", phone: "abc", email: "x@", pickupLocation: "Dar", deliveryLocation: "Mwanza",
    cargoType: "Gold bars", transportType: "Road", weight: "-1", numberOfPackages: "2.5",
    transportDate: "2026-10-20", requiredDeliveryDate: "2026-10-19",
  }, "sw", TODAY);
  assert.deepEqual(Object.keys(r.errors).sort(), ["cargoType", "email", "numberOfPackages", "phone", "requiredDeliveryDate", "weight"].sort());
  assert.match(r.errors.phone, /Weka namba ya simu/);
  const past = validateSubmission(def, { transportDate: "2026-10-01" }, "en", TODAY);
  assert.match(past.errors.transportDate, /today or a later date/);
});

test("added fields: validated by type and returned as extra answers", () => {
  const def = defaultForm("truck");
  def.fields.push(
    { key: "cFleet", type: "number", label: "Number of vehicles", required: true, enabled: true, width: "half" },
    { key: "cDocs", type: "multiselect", label: "Documents", required: false, enabled: true, width: "full", options: ["Insurance", "Licence"] },
    { key: "cTerms", type: "checkbox", label: "I agree", required: true, enabled: true, width: "full" }
  );
  const base = { contactPerson: "B", phone: "+255711000000", truckType: "Tipper", registrationNumber: "T 1 A" };
  const bad = validateSubmission(def, { ...base, cDocs: ["Passport"] }, "en", TODAY);
  assert.ok(bad.errors.cFleet && bad.errors.cDocs && bad.errors.cTerms);
  const ok = validateSubmission(def, { ...base, cFleet: "3", cDocs: ["Licence"], cTerms: "true", additionalInfo: "Night driving" }, "en", TODAY);
  assert.deepEqual(ok.errors, {});
  assert.deepEqual(extraValues(def, ok.values), { additionalInfo: "Night driving", cFleet: "3", cDocs: ["Licence"], cTerms: "Yes" });
});

test("publishing checks catch empty labels, missing options and duplicate shown labels", () => {
  const def = defaultForm("contact");
  def.fields.push(
    { key: "cA", type: "select", label: "Name", required: false, enabled: true, width: "half", options: [] },
    { key: "cB", type: "text", label: " ", required: false, enabled: true, width: "half" }
  );
  const p = definitionProblems(def).join(" | ");
  assert.match(p, /needs a label/);
  assert.match(p, /needs at least one option/);
  assert.match(p, /both labelled/);
});

test("every locked built-in field is required in the default forms", () => {
  for (const id of ["quote", "truck", "contact"] as const) {
    for (const f of defaultForm(id).fields) if (CORE[id][f.key]?.locked) assert.ok(f.required && f.enabled, `${id}.${f.key}`);
  }
});
