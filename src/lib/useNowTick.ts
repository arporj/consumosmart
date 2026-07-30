"use client";

import { useEffect, useState } from "react";

/**
 * Retorna a hora atual, atualizada a cada `intervalMs`. Começa nula e só
 * preenche depois de montar no client, pra não gerar mismatch de hidratação
 * entre a hora do servidor e a do navegador.
 */
export function useNowTick(intervalMs: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o relógio do sistema ao montar
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
