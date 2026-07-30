export type Plan = {
  id: string;
  code: string;
  name: string;
  price_cents: number;
  self_service_ordering: boolean;
  kds: boolean;
  reservations: boolean;
  nfce_enabled: boolean;
  nfce_monthly_limit: number | null;
  stock_advanced: boolean;
  financial_entries: boolean;
  suppliers: boolean;
  hr_commissions: boolean;
};

export const PLAN_COLUMNS =
  "id, code, name, price_cents, self_service_ordering, kds, reservations, nfce_enabled, nfce_monthly_limit, stock_advanced, financial_entries, suppliers, hr_commissions";

export const PLAN_TAGLINES: Record<string, string> = {
  starter: "O bar pequeno que só quer abandonar papel e caneta",
  essencial: "Automatize o atendimento e a cozinha, ganhe velocidade",
  pro: "Controle financeiro rigoroso, sem perder um centavo",
};

export function formatPlanPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function planFeatureList(plan: Plan): string[] {
  const items: string[] = ["PDV no caixa/balcão", "Abertura e fechamento de conta"];

  items.push(
    plan.self_service_ordering
      ? "Autoatendimento: cliente pede e acompanha pelo celular"
      : "Cardápio digital por QR Code (só visualização)",
  );
  if (plan.kds) items.push("Telas de produção (Cozinha e Bar)");
  if (plan.reservations) items.push("Reserva de mesa");
  if (plan.nfce_enabled) {
    items.push(
      plan.nfce_monthly_limit
        ? `Nota fiscal (com limite de ${plan.nfce_monthly_limit}/mês)`
        : "Nota fiscal ilimitada",
    );
  }
  if (plan.stock_advanced) items.push("Estoque avançado + ficha técnica");
  if (plan.financial_entries) items.push("DRE, contas a pagar/receber e fornecedores");
  if (plan.hr_commissions) items.push("Comissões da equipe (ponto, adiantamento, folha)");

  return items;
}
