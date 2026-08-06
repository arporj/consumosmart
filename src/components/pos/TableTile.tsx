import Link from "next/link";
import type { TableStatus } from "@/lib/domain/table-status";
import { formatCentsBRL } from "@/lib/domain/format";

const STATUS_BORDER: Record<TableStatus, string> = {
  free: "border-l-status-free",
  occupied: "border-l-status-occupied",
  waiting: "border-l-status-waiting",
  reserved: "border-l-status-reserved",
};

const STATUS_DOT: Record<TableStatus, string> = {
  free: "bg-status-free",
  occupied: "bg-status-occupied",
  waiting: "bg-status-waiting",
  reserved: "bg-status-reserved",
};

const STATUS_BADGE: Record<TableStatus, string> = {
  free: "bg-status-free/20 text-status-free",
  occupied: "bg-status-occupied/20 text-status-occupied",
  waiting: "bg-status-waiting/20 text-status-waiting",
  reserved: "bg-status-reserved/20 text-status-reserved",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  free: "Livre",
  occupied: "Ocupada",
  waiting: "Aguard. conta",
  reserved: "Reservada",
};

const ACTION_LABEL: Record<TableStatus, string> = {
  free: "Abrir mesa",
  occupied: "Ver comanda",
  waiting: "Receber",
  reserved: "Check-in",
};

export function TableTile({
  tableId,
  label,
  status,
  seats,
  guestCount,
  totalCents,
  elapsed,
  reservationNote,
  onOpen,
}: {
  tableId: string;
  label: string;
  status: TableStatus;
  seats: number;
  guestCount?: number;
  totalCents?: number;
  elapsed?: string;
  reservationNote?: string | null;
  onOpen?: () => void;
}) {
  const needsModal = status === "free" || status === "reserved";

  const inner = (
    <div
      className={`flex h-full min-h-[128px] flex-col gap-2 rounded-xl border border-l-4 border-outline-variant/40 bg-surface-container-high p-3 text-left shadow-sm transition-transform hover:-translate-y-0.5 ${STATUS_BORDER[status]}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-mono text-xl font-extrabold">{label}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap uppercase tracking-wide ${STATUS_BADGE[status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex-1">
        {status === "free" && (
          <p className="text-xs text-on-surface-variant">
            {seats} lugar{seats === 1 ? "" : "es"}
          </p>
        )}
        {status === "reserved" && (
          <p className="text-xs text-on-surface-variant">{reservationNote || "Reserva"}</p>
        )}
        {(status === "occupied" || status === "waiting") && (
          <div className="flex flex-col gap-0.5">
            {typeof totalCents === "number" && totalCents > 0 && (
              <span className="font-display text-lg font-black tabular-nums">
                {formatCentsBRL(totalCents)}
              </span>
            )}
            <span className="text-[11px] text-on-surface-variant">
              {guestCount} pessoa{guestCount === 1 ? "" : "s"}
              {elapsed ? ` · ${elapsed}` : ""}
            </span>
          </div>
        )}
      </div>

      <span
        className={`mt-auto rounded-full py-1.5 text-center text-xs font-bold ${
          needsModal
            ? "border border-dashed border-outline-variant text-on-surface-variant"
            : "bg-primary text-on-primary"
        }`}
      >
        {ACTION_LABEL[status]}
      </span>
    </div>
  );

  if (needsModal) {
    return (
      <button type="button" onClick={onOpen} className="block w-full">
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/mesas/${tableId}`} className="block">
      {inner}
    </Link>
  );
}
