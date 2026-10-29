import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJsonObject, tooManyRequests } from "@/lib/validate";
import { checkSubmission, text } from "@/lib/forms/submit";
import { notifyEvent } from "@/lib/notify-events";

// Contact-form messages. Previously these only reached Netlify Forms; they are
// now kept in the app (Admin > Forms > Submissions) and notify the team.
export async function POST(req: Request) {
  const body = await readJsonObject(req);
  if (!body) return badRequest("Invalid JSON body.");

  const checked = await checkSubmission("contact", body);
  if (!checked.ok) return checked.response;
  const v = checked.values;

  if (tooManyRequests(req, "contact", 10)) {
    return NextResponse.json({ error: "Too many messages. Please wait a few minutes and try again." }, { status: 429 });
  }

  const sub = await prisma.formSubmission.create({
    data: {
      formId: "contact",
      name: text(v, "name")!,
      email: text(v, "email")?.toLowerCase() ?? null,
      phone: text(v, "phone"),
      data: v,
    },
  });

  await notifyEvent("contact", {
    title: `New message from ${text(v, "name")}`,
    body: [text(v, "topic"), text(v, "message")?.slice(0, 200)].filter(Boolean).join(" · "),
    href: `/admin/forms/submissions/${sub.id}`,
  });

  return NextResponse.json({ id: sub.id }, { status: 201 });
}
