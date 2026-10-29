// Public form definitions: what each form asks, in what order, and with which
// rules. Shared by the admin form builder, the public forms (rendering and
// instant validation) and the API routes (authoritative validation), so a form
// edited in the builder is enforced the same way everywhere.
//
// Built-in ("core") fields map to database columns the operations workflow
// relies on: they can be relabelled, reordered and made optional/hidden, but
// not deleted or retyped, and the ones the system needs stay required.
// Fields added in the builder are stored with each submission ("extra").

export const FORM_IDS = ["quote", "truck", "contact"] as const;
export type FormId = (typeof FORM_IDS)[number];

export const FIELD_TYPES = [
  { id: "text", label: "Text", icon: "ph-text-aa" },
  { id: "textarea", label: "Long text", icon: "ph-text-align-left" },
  { id: "email", label: "Email", icon: "ph-at" },
  { id: "tel", label: "Phone", icon: "ph-phone" },
  { id: "number", label: "Number", icon: "ph-hash" },
  { id: "date", label: "Date", icon: "ph-calendar-blank" },
  { id: "select", label: "Dropdown", icon: "ph-caret-circle-down" },
  { id: "radio", label: "Choice buttons", icon: "ph-radio-button" },
  { id: "multiselect", label: "Multiple choice", icon: "ph-list-checks" },
  { id: "checkbox", label: "Checkbox", icon: "ph-check-square" },
  { id: "section", label: "Section heading", icon: "ph-text-h" },
] as const;
export type FieldType = (typeof FIELD_TYPES)[number]["id"];
export const OPTION_TYPES: FieldType[] = ["select", "radio", "multiselect"];

export type FormField = {
  key: string;
  type: FieldType;
  label: string;
  labelSw?: string;
  placeholder?: string;
  placeholderSw?: string;
  help?: string;
  helpSw?: string;
  options?: string[];
  required: boolean;
  enabled: boolean;
  width: "half" | "full";
  core?: boolean;
  /** Not editable: autofill hint for built-in fields. */
  auto?: string;
  /** Not editable: date must be today or later / on or after another field. */
  future?: boolean;
  after?: string;
};

export type FormDef = { id: FormId; name: string; fields: FormField[] };

export type SubmissionValue = string | string[];
export type SubmissionValues = Record<string, SubmissionValue>;

// --- Built-in field rules --------------------------------------------------

type CoreRule = {
  type: FieldType;
  /** The workflow can't run without it: always shown and required. */
  locked?: boolean;
  /** Maximum answer length (text) . */
  max?: number;
  /** Whole numbers only (integer database column). */
  int?: boolean;
};

export const CORE: Record<FormId, Record<string, CoreRule>> = {
  quote: {
    contactPerson: { type: "text", locked: true, max: 120 },
    companyName: { type: "text", max: 160 },
    phone: { type: "tel", locked: true, max: 32 },
    email: { type: "email", max: 254 },
    pickupLocation: { type: "text", locked: true, max: 200 },
    deliveryLocation: { type: "text", locked: true, max: 200 },
    cargoType: { type: "select", locked: true, max: 80 },
    transportType: { type: "select", max: 40 },
    cargoDescription: { type: "text", max: 2000 },
    weight: { type: "number" },
    numberOfPackages: { type: "number", int: true },
    dimensions: { type: "text", max: 120 },
    cargoValue: { type: "number" },
    transportDate: { type: "date" },
    requiredDeliveryDate: { type: "date" },
    specialHandling: { type: "text", max: 500 },
    additionalInstructions: { type: "textarea", max: 2000 },
  },
  truck: {
    contactPerson: { type: "text", locked: true, max: 120 },
    companyName: { type: "text", max: 160 },
    phone: { type: "tel", locked: true, max: 32 },
    email: { type: "email", max: 254 },
    truckType: { type: "select", locked: true, max: 80 },
    registrationNumber: { type: "text", locked: true, max: 20 },
    truckCapacity: { type: "text", max: 80 },
    makeModel: { type: "text", max: 120 },
    currentLocation: { type: "text", max: 200 },
    routesCovered: { type: "text", max: 1000 },
  },
  contact: {
    topic: { type: "radio", max: 80 },
    name: { type: "text", locked: true, max: 120 },
    company: { type: "text", max: 160 },
    phone: { type: "tel", locked: true, max: 32 },
    email: { type: "email", max: 254 },
    message: { type: "textarea", locked: true, max: 5000 },
  },
};

// --- Defaults (exactly the forms as they were hand-built) -------------------

const f = (p: Partial<FormField> & Pick<FormField, "key" | "type" | "label">): FormField => ({
  required: false,
  enabled: true,
  width: "half",
  ...p,
});
const sec = (key: string, label: string, labelSw: string): FormField =>
  f({ key, type: "section", label, labelSw, width: "full" });

const CARGO = ["General Cargo", "Refrigerated", "Hazardous", "Fragile", "Heavy Machinery", "Other"];
const TRANSPORT = ["Road", "Rail", "Sea", "Air"];
const TRUCKS = ["Flatbed", "Curtainsider", "Box Truck", "Refrigerated", "Container Truck", "Tipper", "Lowbed", "Pickup", "Other"];

const DEFAULTS: Record<FormId, FormDef> = {
  quote: {
    id: "quote",
    name: "Request a Quote",
    fields: [
      sec("s_details", "Your details", "Taarifa zako"),
      f({ key: "contactPerson", type: "text", label: "Contact person", labelSw: "Jina la mhusika", required: true, auto: "name", placeholder: "Full name", placeholderSw: "Jina kamili", core: true }),
      f({ key: "companyName", type: "text", label: "Company", labelSw: "Kampuni", auto: "organization", placeholder: "Optional", placeholderSw: "Si lazima", core: true }),
      f({ key: "phone", type: "tel", label: "Phone", labelSw: "Simu", required: true, auto: "tel", placeholder: "+255 7XX XXX XXX", core: true }),
      f({ key: "email", type: "email", label: "Email", labelSw: "Barua pepe", auto: "email", placeholder: "you@company.co.tz", core: true }),
      sec("s_shipment", "Shipment", "Mzigo"),
      f({ key: "pickupLocation", type: "text", label: "Pickup location", labelSw: "Mahali pa kuchukua", required: true, placeholder: "Town, area or address", placeholderSw: "Mji, eneo au anwani", core: true }),
      f({ key: "deliveryLocation", type: "text", label: "Delivery location", labelSw: "Mahali pa kufikisha", required: true, placeholder: "Town, area or address", placeholderSw: "Mji, eneo au anwani", core: true }),
      f({ key: "cargoType", type: "select", label: "Cargo type", labelSw: "Aina ya mzigo", required: true, placeholder: "Select cargo type", placeholderSw: "Chagua aina ya mzigo", options: CARGO, core: true }),
      f({ key: "transportType", type: "select", label: "Transport type", labelSw: "Njia ya usafiri", required: true, placeholder: "Select", placeholderSw: "Chagua", options: TRANSPORT, core: true }),
      f({ key: "cargoDescription", type: "text", label: "Cargo description", labelSw: "Maelezo ya mzigo", width: "full", placeholder: "e.g. 200 bags of cement on pallets", placeholderSw: "mf. mifuko 200 ya saruji kwenye paleti", core: true }),
      f({ key: "weight", type: "number", label: "Approximate weight (kg)", labelSw: "Uzito wa makadirio (kg)", placeholder: "0", core: true }),
      f({ key: "numberOfPackages", type: "number", label: "Number of items / packages", labelSw: "Idadi ya vifurushi", placeholder: "0", core: true }),
      f({ key: "dimensions", type: "text", label: "Dimensions", labelSw: "Vipimo", placeholder: "e.g. 2m × 1m × 1m", placeholderSw: "mf. 2m × 1m × 1m", core: true }),
      f({ key: "cargoValue", type: "number", label: "Cargo value (TZS)", labelSw: "Thamani ya mzigo (TZS)", placeholder: "0", core: true }),
      f({ key: "transportDate", type: "date", label: "Date of transport", labelSw: "Tarehe ya usafiri", required: true, future: true, core: true }),
      f({ key: "requiredDeliveryDate", type: "date", label: "Delivery deadline", labelSw: "Tarehe ya mwisho ya kufikisha", after: "transportDate", core: true }),
      sec("s_other", "Anything else", "Mengineyo"),
      f({ key: "specialHandling", type: "text", label: "Special handling", labelSw: "Utunzaji maalum", width: "full", placeholder: "e.g. keep upright, 2–8 °C, forklift needed at delivery", placeholderSw: "mf. isimame wima, 2–8 °C, forklift inahitajika", core: true }),
      f({ key: "additionalInstructions", type: "textarea", label: "Additional notes", labelSw: "Maelezo mengine", width: "full", placeholder: "Anything else we should know", placeholderSw: "Chochote kingine tunachopaswa kujua", core: true }),
    ],
  },
  truck: {
    id: "truck",
    name: "Register Your Truck",
    fields: [
      sec("s_about", "About you", "Kuhusu wewe"),
      f({ key: "contactPerson", type: "text", label: "Full name", labelSw: "Jina kamili", required: true, auto: "name", core: true }),
      f({ key: "companyName", type: "text", label: "Company name", labelSw: "Jina la kampuni", auto: "organization", placeholder: "Optional", placeholderSw: "Si lazima", core: true }),
      f({ key: "phone", type: "tel", label: "Phone", labelSw: "Simu", required: true, auto: "tel", placeholder: "+255 7XX XXX XXX", core: true }),
      f({ key: "email", type: "email", label: "Email", labelSw: "Barua pepe", auto: "email", core: true }),
      sec("s_truck", "Your truck", "Lori lako"),
      f({ key: "truckType", type: "select", label: "Truck type", labelSw: "Aina ya lori", required: true, placeholder: "Select truck type", placeholderSw: "Chagua aina ya lori", options: TRUCKS, core: true }),
      f({ key: "registrationNumber", type: "text", label: "Registration number", labelSw: "Namba ya usajili", required: true, placeholder: "e.g. T 123 ABC", placeholderSw: "mf. T 123 ABC", core: true }),
      f({ key: "truckCapacity", type: "text", label: "Capacity", labelSw: "Uwezo wa kubeba", placeholder: "e.g. 20 tonnes", placeholderSw: "mf. tani 20", core: true }),
      f({ key: "makeModel", type: "text", label: "Make / model", labelSw: "Aina / modeli", placeholder: "e.g. Isuzu FVR", placeholderSw: "mf. Isuzu FVR", core: true }),
      sec("s_operate", "Where you operate", "Unakofanya kazi"),
      f({ key: "currentLocation", type: "text", label: "Current location", labelSw: "Mahali ulipo sasa", placeholder: "Town or region", placeholderSw: "Mji au mkoa", core: true }),
      f({ key: "routesCovered", type: "text", label: "Routes / regions you operate", labelSw: "Njia / mikoa unayohudumia", placeholder: "e.g. Dar es Salaam – Mwanza", placeholderSw: "mf. Dar es Salaam – Mwanza", core: true }),
      // Was on the hand-built form but never saved; now stored with the registration.
      f({ key: "additionalInfo", type: "textarea", label: "Additional information", labelSw: "Taarifa za ziada", width: "full" }),
    ],
  },
  contact: {
    id: "contact",
    name: "Contact",
    fields: [
      f({ key: "topic", type: "radio", label: "What is it about?", labelSw: "Unahusu nini?", required: true, width: "full", options: ["Transport", "Carrier / truck", "Partnership", "Other"], core: true }),
      f({ key: "name", type: "text", label: "Name", labelSw: "Jina", required: true, auto: "name", core: true }),
      f({ key: "company", type: "text", label: "Company", labelSw: "Kampuni", auto: "organization", placeholder: "Optional", placeholderSw: "Si lazima", core: true }),
      f({ key: "phone", type: "tel", label: "Phone", labelSw: "Simu", required: true, auto: "tel", placeholder: "+255 7XX XXX XXX", core: true }),
      f({ key: "email", type: "email", label: "Email", labelSw: "Barua pepe", auto: "email", core: true }),
      f({ key: "message", type: "textarea", label: "Message", labelSw: "Ujumbe", required: true, width: "full", core: true }),
    ],
  },
};

export function defaultForm(id: FormId): FormDef {
  return structuredClone(DEFAULTS[id]);
}

export function isFormId(id: string): id is FormId {
  return (FORM_IDS as readonly string[]).includes(id);
}

// --- Normalising stored / submitted definitions -----------------------------

const clean = (v: unknown, max: number): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, max);
  return s || undefined;
};

/**
 * Turns whatever is stored (or posted by the builder) into a safe definition:
 * unknown types dropped, built-in fields keep their type and lock, missing
 * built-in fields restored (hidden unless locked), keys made unique.
 * Anything that isn't a field array (e.g. the old list of field names) yields
 * the defaults.
 */
export function normalizeForm(id: FormId, raw: unknown): FormDef {
  const base = defaultForm(id);
  let list: unknown = raw;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      list = null;
    }
  }
  if (!Array.isArray(list) || list.length === 0 || typeof list[0] !== "object") return base;

  const core = CORE[id];
  const baseByKey = new Map(base.fields.map((x) => [x.key, x]));
  const seen = new Set<string>();
  const out: FormField[] = [];

  for (const item of list as Record<string, unknown>[]) {
    if (!item || typeof item !== "object") continue;
    const key = clean(item.key, 60);
    if (!key || !/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || seen.has(key)) continue;
    const rule = core[key];
    const def = baseByKey.get(key);
    const type = (rule?.type ?? def?.type ?? item.type) as FieldType;
    if (!FIELD_TYPES.some((t) => t.id === type)) continue;
    seen.add(key);

    const options = Array.isArray(item.options)
      ? [...new Set((item.options as unknown[]).map((o) => clean(o, 80)).filter((o): o is string => !!o))].slice(0, 50)
      : undefined;

    const field: FormField = {
      key,
      type,
      label: clean(item.label, 120) ?? def?.label ?? key,
      labelSw: clean(item.labelSw, 120),
      placeholder: clean(item.placeholder, 160),
      placeholderSw: clean(item.placeholderSw, 160),
      help: clean(item.help, 300),
      helpSw: clean(item.helpSw, 300),
      options: OPTION_TYPES.includes(type) ? (options && options.length ? options : def?.options ?? ["Option 1", "Option 2"]) : undefined,
      required: type === "section" ? false : rule?.locked ? true : item.required === true,
      enabled: rule?.locked ? true : item.enabled !== false,
      width: item.width === "full" || type === "section" || type === "textarea" ? "full" : "half",
      core: !!rule || undefined,
      auto: def?.auto,
      future: def?.future,
      after: def?.after,
    };
    out.push(field);
  }

  // Built-in fields can't be deleted: put back any that went missing.
  for (const d of base.fields) {
    if (core[d.key] && !seen.has(d.key)) out.push({ ...d, enabled: !!core[d.key].locked });
  }
  return { ...base, fields: out };
}

// --- Validation (client and server) -----------------------------------------

const MSG = {
  required: ["This field is required.", "Sehemu hii inahitajika."],
  phone: ["Enter a phone number, e.g. +255 7XX XXX XXX.", "Weka namba ya simu, mfano +255 7XX XXX XXX."],
  email: ["Enter a valid email address.", "Weka barua pepe sahihi."],
  number: ["Enter a number greater than zero.", "Weka namba kubwa kuliko sifuri."],
  int: ["Enter a whole number.", "Weka namba kamili."],
  date: ["Enter a valid date.", "Weka tarehe sahihi."],
  past: ["Choose today or a later date.", "Chagua leo au tarehe ijayo."],
  order: ["Must be on or after the pickup date.", "Lazima iwe siku ya kuchukua mzigo au baadaye."],
  option: ["Choose one of the listed options.", "Chagua mojawapo ya chaguo zilizopo."],
  long: ["This answer is too long.", "Jibu hili ni refu mno."],
};

export const PHONE_RE = /^\+?[0-9][0-9\s()-]{6,18}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function fieldMax(id: FormId, field: FormField): number {
  return CORE[id][field.key]?.max ?? (field.type === "textarea" ? 2000 : 300);
}

/** Visible, answerable fields in display order. */
export function inputFields(def: FormDef): FormField[] {
  return def.fields.filter((x) => x.enabled && x.type !== "section");
}

/**
 * Validates submitted values against a definition. Hidden fields and unknown
 * keys are ignored. Returns per-field messages (English or Swahili) and the
 * cleaned values for the fields that are shown.
 */
export function validateSubmission(
  def: FormDef,
  raw: Record<string, unknown>,
  lang: "en" | "sw" = "en",
  today = new Date().toISOString().slice(0, 10)
): { errors: Record<string, string>; values: SubmissionValues } {
  const i = lang === "sw" ? 1 : 0;
  const errors: Record<string, string> = {};
  const values: SubmissionValues = {};

  for (const fld of inputFields(def)) {
    const v = raw[fld.key];
    if (fld.type === "multiselect") {
      const arr = (Array.isArray(v) ? v : typeof v === "string" && v ? [v] : []).filter((x): x is string => typeof x === "string");
      if (fld.required && arr.length === 0) errors[fld.key] = MSG.required[i];
      else if (arr.some((x) => !(fld.options ?? []).includes(x))) errors[fld.key] = MSG.option[i];
      else if (arr.length) values[fld.key] = arr;
      continue;
    }
    if (fld.type === "checkbox") {
      const on = v === true || v === "true" || v === "on";
      if (fld.required && !on) errors[fld.key] = MSG.required[i];
      else if (on) values[fld.key] = "Yes";
      continue;
    }
    const s = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
    if (!s) {
      if (fld.required) errors[fld.key] = MSG.required[i];
      continue;
    }
    if (s.length > fieldMax(def.id, fld)) errors[fld.key] = MSG.long[i];
    else if (fld.type === "tel" && !PHONE_RE.test(s)) errors[fld.key] = MSG.phone[i];
    else if (fld.type === "email" && !EMAIL_RE.test(s)) errors[fld.key] = MSG.email[i];
    else if (fld.type === "number" && !(Number(s.replace(/,/g, "")) > 0 && Number(s.replace(/,/g, "")) <= 1e13)) errors[fld.key] = MSG.number[i];
    else if (fld.type === "number" && CORE[def.id][fld.key]?.int && !Number.isInteger(Number(s.replace(/,/g, "")))) errors[fld.key] = MSG.int[i];
    else if (fld.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(new Date(s).getTime()))) errors[fld.key] = MSG.date[i];
    else if (fld.type === "date" && fld.future && s < today) errors[fld.key] = MSG.past[i];
    else if ((fld.type === "select" || fld.type === "radio") && !(fld.options ?? []).includes(s)) errors[fld.key] = MSG.option[i];
    if (!errors[fld.key]) values[fld.key] = fld.type === "number" ? s.replace(/,/g, "") : s;
  }

  // Cross-field date order (e.g. delivery deadline after transport date).
  for (const fld of inputFields(def)) {
    const a = values[fld.key];
    const b = fld.after ? values[fld.after] : undefined;
    if (fld.after && typeof a === "string" && typeof b === "string" && a < b) errors[fld.key] = MSG.order[i];
  }
  return { errors, values };
}

/** Values of fields that are not built-in, for storing with the submission. */
export function extraValues(def: FormDef, values: SubmissionValues): SubmissionValues | null {
  const extra: SubmissionValues = {};
  for (const fld of inputFields(def)) if (!fld.core && values[fld.key] !== undefined) extra[fld.key] = values[fld.key];
  return Object.keys(extra).length ? extra : null;
}

/** Problems that stop a definition from being published (shown in the builder). */
export function definitionProblems(def: FormDef): string[] {
  const problems: string[] = [];
  const labels = new Set<string>();
  for (const fld of def.fields) {
    if (fld.type === "section") continue;
    if (!fld.label.trim()) problems.push("Every field needs a label.");
    if (OPTION_TYPES.includes(fld.type) && (fld.options?.length ?? 0) < 1) problems.push(`“${fld.label}” needs at least one option.`);
    const l = fld.label.trim().toLowerCase();
    if (fld.enabled && labels.has(l)) problems.push(`Two shown fields are both labelled “${fld.label}”.`);
    labels.add(l);
  }
  if (inputFields(def).length === 0) problems.push("Show at least one field.");
  return [...new Set(problems)];
}
