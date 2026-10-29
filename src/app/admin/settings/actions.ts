"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { defaultSettings, isSettingKey, SETTINGS_TAG, SETTING_LABELS, validateSetting, type SettingKey } from "@/lib/settings";

export type SettingsState = {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
  saved?: boolean;
};

// Saves the settings submitted from one settings tab. Admin-only. Only keys
// in the settings registry are accepted, each value is validated, and nothing
// is written unless every field is valid.
export async function saveSettingsAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    return { error: "You do not have permission to change these settings." };
  }

  const values: { key: SettingKey; value: string }[] = [];
  const fieldErrors: Record<string, string> = {};
  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("setting__")) continue;
    const key = name.slice("setting__".length);
    if (!isSettingKey(key)) continue; // unknown keys are ignored, never stored
    const result = validateSetting(key, String(raw));
    if ("error" in result) fieldErrors[key] = result.error;
    else values.push({ key, value: result.value });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Some settings need fixing before they can be saved.", fieldErrors };
  }
  if (values.length === 0) return { error: null, saved: true };

  // Compare with the effective value (stored, else default) so untouched
  // fields that were never saved aren't logged as changed.
  const current = await prisma.setting.findMany({ where: { key: { in: values.map((v) => v.key) } } });
  const before = new Map<string, string>(Object.entries(defaultSettings()));
  for (const c of current) before.set(c.key, c.value);
  const changed = values.filter((v) => before.get(v.key) !== v.value);
  if (changed.length === 0) return { error: null, saved: true };

  const actor = await getCurrentOpsUser();
  await prisma.$transaction([
    ...changed.map((e) =>
      prisma.setting.upsert({
        where: { key: e.key },
        create: { key: e.key, value: e.value },
        update: { value: e.value },
      })
    ),
    prisma.auditLog.create({
      data: {
        userName: actor?.name ?? "ABRIA Staff",
        action: "Updated",
        resource: "Settings",
        description: `Changed ${changed.map((e) => SETTING_LABELS[e.key]).join(", ")}`,
      },
    }),
  ]);

  // Settings feed the public site, metadata, robots.txt, PDFs and emails.
  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/robots.txt"); // static route: refresh the indexing switch now
  return { error: null, saved: true };
}
