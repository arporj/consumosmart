import Link from "next/link";
import type { TableStatus } from "@/lib/domain/table-status";

const STATUS_BORDER: Record<TableStatus, string> = {
  free: "border-l-status-free",
  occupied: "border-l-status-occupied",
  waiting: "border-l-status-waiting",
  reserved: "border-l-status-reserved",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  free: "Livre",
  occupied: "Ocupada",
  waiting: "Aguard. conta",
  reserved: "Reservada",
};

export function TableTile({
  tableId,
  label,
  status,
  meta,
}: {
  tableId: string;
  label: string;
  status: TableStatus;
  meta: string;
}) {
  return (
    <Link
      href={`/mesas/${tableId}`}
      className={`flex flex-col rounded-xl border border-l-4 border-outline-variant bg-surface-container-high p-3 transition-transform hover:-translate-y-0.5 ${STATUS_BORDER[status]}`}
    >
      <div className="font-mono text-lg font-extrabold">{label}</div>
      <div className="mt-1 min-h-[14px] text-[10.5px] text-on-surface-variant">{meta}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        {STATUS_LABEL[status]}
      </div>
    </Link>
  );
}
