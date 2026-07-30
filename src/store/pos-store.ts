import { create } from "zustand";
import {
  buildSeedOrders,
  sampleAreas,
  sampleCategories,
  sampleProducts,
  sampleTables,
} from "@/lib/domain/sample-data";
import type {
  Area,
  Category,
  Order,
  OrderType,
  PaymentMethod,
  Product,
  Table,
} from "@/lib/domain/types";

// Store client-side em memória — substitui o backend enquanto o schema (ver
// supabase/migrations/0001_init.sql) ainda não está ligado a um projeto Supabase real.
// Não é seguro para múltiplos usuários concorrentes em produção: é só o assento de dados
// para construir as telas; a troca por queries/Realtime do Supabase deve preservar essa
// mesma forma (areas/tables/categories/products/orders) para não precisar redesenhar as telas.

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyOrder(type: OrderType, id?: string): Order {
  return {
    id: id ?? newId("order"),
    type,
    status: "open",
    guestCount: 1,
    serviceChargeEnabled: true,
    serviceChargeRate: 0.1,
    discountCents: 0,
    items: [],
    payments: [],
    openedAt: new Date().toISOString(),
  };
}

// Id fixo (não gerado com Math.random()): este pedido é criado quando o módulo
// carrega, tanto no servidor (SSR do Client Component) quanto no client — um id
// aleatório aqui faria os dois lados divergirem e quebraria a hidratação em
// qualquer lugar que renderize esse id (ex. o link "Ir para fechamento").
const initialBalcaoOrder = createEmptyOrder("balcao", "order-balcao-inicial");

interface PosState {
  areas: Area[];
  tables: Table[];
  categories: Category[];
  products: Product[];
  orders: Record<string, Order>;
  balcaoOrderId: string;

  addCategory: (name: string) => void;
  addProduct: (input: {
    name: string;
    description: string;
    priceCents: number;
    categoryId: string;
    station: Product["station"];
  }) => void;
  removeProduct: (productId: string) => void;

  addArea: (name: string) => void;
  addTable: (areaId: string, label: string, seats: number) => void;
  reserveTable: (tableId: string, note: string) => void;

  /** Garante que a mesa tenha uma comanda aberta e devolve o id dela. */
  openTableOrder: (tableId: string) => string;
  transferTable: (fromTableId: string, toTableId: string) => void;
  mergeTables: (intoTableId: string, fromTableId: string) => void;

  incrementItem: (orderId: string, productId: string) => void;
  decrementItem: (orderId: string, productId: string) => void;
  setGuestCount: (orderId: string, n: number) => void;
  setDiscount: (orderId: string, cents: number) => void;
  toggleServiceCharge: (orderId: string) => void;
  requestBill: (orderId: string) => void;
  addPayment: (orderId: string, method: PaymentMethod, amountCents: number) => void;
  closeOrder: (orderId: string) => void;
  startNewBalcaoOrder: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  areas: sampleAreas,
  tables: sampleTables,
  categories: sampleCategories,
  products: sampleProducts,
  orders: { ...buildSeedOrders(), [initialBalcaoOrder.id]: initialBalcaoOrder },
  balcaoOrderId: initialBalcaoOrder.id,

  addCategory: (name) =>
    set((state) => ({
      categories: [
        ...state.categories,
        { id: newId("cat"), name, sortOrder: state.categories.length },
      ],
    })),

  addProduct: (input) =>
    set((state) => ({
      products: [...state.products, { id: newId("prod"), isActive: true, ...input }],
    })),

  removeProduct: (productId) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== productId) })),

  addArea: (name) =>
    set((state) => ({
      areas: [...state.areas, { id: newId("area"), name, sortOrder: state.areas.length }],
    })),

  addTable: (areaId, label, seats) =>
    set((state) => ({
      tables: [
        ...state.tables,
        { id: newId("table"), areaId, label, seats, orderId: null, reservationNote: null },
      ],
    })),

  reserveTable: (tableId, note) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, reservationNote: note } : t)),
    })),

  openTableOrder: (tableId) => {
    let resultOrderId = "";
    set((state) => {
      const table = state.tables.find((t) => t.id === tableId);
      if (!table) return state;
      if (table.orderId && state.orders[table.orderId]) {
        resultOrderId = table.orderId;
        return state;
      }
      const order = createEmptyOrder("mesa");
      resultOrderId = order.id;
      return {
        orders: { ...state.orders, [order.id]: order },
        tables: state.tables.map((t) =>
          t.id === tableId ? { ...t, orderId: order.id, reservationNote: null } : t
        ),
      };
    });
    return resultOrderId;
  },

  transferTable: (fromTableId, toTableId) =>
    set((state) => {
      const fromTable = state.tables.find((t) => t.id === fromTableId);
      if (!fromTable?.orderId) return state;
      const orderId = fromTable.orderId;
      return {
        tables: state.tables.map((t) => {
          if (t.id === fromTableId) return { ...t, orderId: null };
          if (t.id === toTableId) return { ...t, orderId, reservationNote: null };
          return t;
        }),
      };
    }),

  mergeTables: (intoTableId, fromTableId) =>
    set((state) => {
      const intoTable = state.tables.find((t) => t.id === intoTableId);
      const fromTable = state.tables.find((t) => t.id === fromTableId);
      if (!intoTable?.orderId || !fromTable?.orderId) return state;
      const intoOrder = state.orders[intoTable.orderId];
      const fromOrder = state.orders[fromTable.orderId];
      if (!intoOrder || !fromOrder) return state;

      const items = intoOrder.items.slice();
      for (const item of fromOrder.items) {
        const idx = items.findIndex((i) => i.productId === item.productId);
        if (idx === -1) items.push({ ...item });
        else items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
      }

      const mergedOrder: Order = {
        ...intoOrder,
        items,
        guestCount: intoOrder.guestCount + fromOrder.guestCount,
      };
      const closedFromOrder: Order = {
        ...fromOrder,
        status: "canceled",
        closedAt: new Date().toISOString(),
      };

      return {
        orders: {
          ...state.orders,
          [intoOrder.id]: mergedOrder,
          [fromOrder.id]: closedFromOrder,
        },
        tables: state.tables.map((t) => (t.id === fromTableId ? { ...t, orderId: null } : t)),
      };
    }),

  incrementItem: (orderId, productId) =>
    set((state) => {
      const order = state.orders[orderId];
      const product = state.products.find((p) => p.id === productId);
      if (!order || !product) return state;
      const items = order.items.slice();
      const idx = items.findIndex((i) => i.productId === productId);
      if (idx === -1) {
        items.push({ productId, quantity: 1, unitPriceCents: product.priceCents });
      } else {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
      }
      return { orders: { ...state.orders, [orderId]: { ...order, items } } };
    }),

  decrementItem: (orderId, productId) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      const items = order.items
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      return { orders: { ...state.orders, [orderId]: { ...order, items } } };
    }),

  setGuestCount: (orderId, n) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        orders: { ...state.orders, [orderId]: { ...order, guestCount: Math.max(1, n) } },
      };
    }),

  setDiscount: (orderId, cents) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        orders: { ...state.orders, [orderId]: { ...order, discountCents: Math.max(0, cents) } },
      };
    }),

  toggleServiceCharge: (orderId) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        orders: {
          ...state.orders,
          [orderId]: { ...order, serviceChargeEnabled: !order.serviceChargeEnabled },
        },
      };
    }),

  requestBill: (orderId) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      return { orders: { ...state.orders, [orderId]: { ...order, status: "awaiting_payment" } } };
    }),

  addPayment: (orderId, method, amountCents) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            payments: [
              ...order.payments,
              { id: newId("pay"), method, amountCents, paidAt: new Date().toISOString() },
            ],
          },
        },
      };
    }),

  closeOrder: (orderId) =>
    set((state) => {
      const order = state.orders[orderId];
      if (!order) return state;
      const closedOrder: Order = {
        ...order,
        status: "closed",
        closedAt: new Date().toISOString(),
      };
      return {
        orders: { ...state.orders, [orderId]: closedOrder },
        tables: state.tables.map((t) => (t.orderId === orderId ? { ...t, orderId: null } : t)),
      };
    }),

  startNewBalcaoOrder: () =>
    set((state) => {
      const order = createEmptyOrder("balcao");
      return { balcaoOrderId: order.id, orders: { ...state.orders, [order.id]: order } };
    }),
}));

export function orderSubtotalCents(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

export function orderDiscountCents(order: Order): number {
  return Math.min(order.discountCents, orderSubtotalCents(order));
}

export function orderServiceCents(order: Order): number {
  if (!order.serviceChargeEnabled) return 0;
  const base = orderSubtotalCents(order) - orderDiscountCents(order);
  return Math.round(base * order.serviceChargeRate);
}

export function orderTotalCents(order: Order): number {
  return orderSubtotalCents(order) - orderDiscountCents(order) + orderServiceCents(order);
}

export function orderPaidCents(order: Order): number {
  return order.payments.reduce((sum, p) => sum + p.amountCents, 0);
}
