import { ComandaMesaClient } from "./ComandaMesaClient";

export default async function ComandaMesaPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  return <ComandaMesaClient tableId={tableId} />;
}
