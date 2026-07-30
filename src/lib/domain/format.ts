export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Extrai só os dígitos de uma string digitada e devolve o valor em centavos. */
export function digitsToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10);
}
