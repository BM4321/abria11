import { notFound, redirect } from "next/navigation";
import { requireRole, deniedPath } from "@/lib/auth";
import { isFormId } from "@/lib/forms/schema";
import { getForm } from "@/lib/forms/store";
import FormBuilder from "@/components/forms/FormBuilder";

export const dynamic = "force-dynamic";

export default async function FormBuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) {
    redirect(access.reason === "FORBIDDEN" ? "/operations/dashboard" : deniedPath(access.reason));
  }
  const { formId } = await params;
  if (!isFormId(formId)) notFound();
  return <FormBuilder def={await getForm(formId)} />;
}
