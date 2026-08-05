import { redirect } from "next/navigation";

export default async function GestaoIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/gestao/${slug}/mesas`);
}
