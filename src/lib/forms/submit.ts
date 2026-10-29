import { NextResponse } from "next/server";
import { extraValues, inputFields, validateSubmission, type FormDef, type FormId, type SubmissionValues } from "@/lib/forms/schema";
import { getForm } from "@/lib/forms/store";

// Server-side check of a public form submission against the published form
// definition: hidden fields and unknown keys are dropped, required fields and
// types enforced. Returns the cleaned values, or a 400 response listing every
// problem by field.
export async function checkSubmission(
  formId: FormId,
  body: Record<string, unknown>
): Promise<{ ok: true; def: FormDef; values: SubmissionValues; extra: SubmissionValues | null } | { ok: false; response: NextResponse }> {
  const def = await getForm(formId);
  const { errors, values } = validateSubmission(def, body, "en");
  const keys = Object.keys(errors);
  if (keys.length) {
    const labels = new Map(inputFields(def).map((f) => [f.key, f.label]));
    const first = keys[0];
    return {
      ok: false,
      response: NextResponse.json(
        { error: `${labels.get(first) ?? first}: ${errors[first]}`, fields: errors },
        { status: 400 }
      ),
    };
  }
  return { ok: true, def, values, extra: extraValues(def, values) };
}

// Typed readers for built-in fields (absent when the field is hidden/empty).
export const text = (v: SubmissionValues, k: string): string | null => {
  const x = v[k];
  return typeof x === "string" && x ? x : Array.isArray(x) && x.length ? x.join(", ") : null;
};
export const number = (v: SubmissionValues, k: string): number | null => {
  const x = text(v, k);
  return x === null ? null : Number(x);
};
export const day = (v: SubmissionValues, k: string): Date | null => {
  const x = text(v, k);
  return x === null ? null : new Date(`${x}T00:00:00Z`);
};
