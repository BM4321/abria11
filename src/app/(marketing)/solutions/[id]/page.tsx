import { notFound } from "next/navigation";
import SolutionDetail from "@/components/SolutionDetail";
import { sol, solutions } from "@/lib/site";
import { getSlotImage } from "@/lib/media";

export const revalidate = 300;

export function generateStaticParams() {
  return solutions.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = sol(id);
  return {
    title: s ? `${s.name} | ABRIA Logistics` : "Solutions | ABRIA Logistics",
    description: s?.line,
    alternates: { canonical: `/solutions/${id}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!sol(id)) notFound();
  return <SolutionDetail id={id} image={await getSlotImage(`solution.${id}`)} />;
}
