export type Station = "cozinha" | "bar" | "sobremesas";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Area {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Table {
  id: string;
  areaId: string;
  label: string;
  seats: number;
  orderId: string | null;
  reservationNote: string | null;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  station: Station;
  isActive: boolean;
}

export type OrderType = "mesa" | "balcao";
export type OrderStatus = "open" | "awaiting_payment" | "closed" | "canceled";

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export type PaymentMethod = "pix" | "cartao" | "dinheiro" | "customizado";

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  amountCents: number;
  paidAt: string;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  guestCount: number;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
  discountCents: number;
  items: OrderItem[];
  payments: OrderPayment[];
  openedAt: string;
  closedAt?: string;
}
