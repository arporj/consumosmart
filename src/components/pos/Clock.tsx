"use client";

import { useNowTick } from "@/lib/useNowTick";

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function Clock() {
  const now = useNowTick(1000);

  if (!now) {
    return (
      <div
        className="hidden flex-none rounded-lg border border-outline-variant bg-surface-container-high px-3.5 py-2 sm:block"
        aria-hidden
      />
    );
  }

  const dateStr = `${DIAS[now.getDay()]}, ${now.getDate()} ${MESES[now.getMonth()]}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className="flex-none rounded-lg border border-outline-variant bg-surface-container-high px-3.5 py-2 text-right">
      <div className="text-[9.5px] uppercase tracking-wide text-on-surface-variant">
        {dateStr}
      </div>
      <div className="font-mono text-base font-extrabold tabular-nums text-secondary">
        {timeStr}
      </div>
    </div>
  );
}
