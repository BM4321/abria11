import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { defaultForm, normalizeForm, type FormDef, type FormId } from "@/lib/forms/schema";

export const FORMS_TAG = "forms";

async function load(id: FormId): Promise<FormDef> {
  try {
    const row = await prisma.formDefinition.findUnique({ where: { formId: id } });
    return row ? normalizeForm(id, row.fields) : defaultForm(id);
  } catch (err) {
    // Database unreachable (e.g. at build time): the built-in form still works.
    console.error(`[ABRIA] Could not load form ${id}; using defaults.`, err instanceof Error ? err.message : err);
    return defaultForm(id);
  }
}

// Cached across requests; publishing a form calls revalidateTag(FORMS_TAG).
export const getForm = unstable_cache(load, ["abria-form"], { tags: [FORMS_TAG], revalidate: 300 });
