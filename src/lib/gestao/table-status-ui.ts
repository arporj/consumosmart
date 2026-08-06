import type { TableStatus } from "./table-states";

// Classes Tailwind pro status de mesa (livre/ocupada/aguardando conta/reservada),
// compartilhadas entre o Painel e a tela de Mesas da Gestão pra não divergir.

export const STATUS_LABEL: Record<TableStatus, string> = {
  free: "Livre",
  occupied: "Ocupada",
  waiting: "Aguardando",
  reserved: "Reservada",
};

export const STATUS_DOT_CLASS: Record<TableStatus, string> = {
  free: "bg-status-free",
  occupied: "bg-status-occupied",
  waiting: "bg-status-waiting",
  reserved: "bg-status-reserved",
};

export const STATUS_BADGE_CLASS: Record<TableStatus, string> = {
  free: "bg-status-free/20 text-status-free",
  occupied: "bg-status-occupied/20 text-status-occupied",
  waiting: "bg-status-waiting/20 text-status-waiting",
  reserved: "bg-status-reserved/20 text-status-reserved",
};

export const STATUS_BORDER_CLASS: Record<TableStatus, string> = {
  free: "border-status-free/40",
  occupied: "border-status-occupied/40",
  waiting: "border-status-waiting/40",
  reserved: "border-status-reserved/40",
};
