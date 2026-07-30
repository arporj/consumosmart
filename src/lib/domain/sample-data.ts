import type { Area, Category, Order, Product, Table } from "./types";

export const sampleAreas: Area[] = [
  { id: "area-salao", name: "Salão Principal", sortOrder: 0 },
  { id: "area-varanda", name: "Varanda", sortOrder: 1 },
  { id: "area-bar", name: "Bar", sortOrder: 2 },
];

export const sampleTables: Table[] = [
  { id: "table-07", areaId: "area-salao", label: "07", seats: 4, orderId: "order-seed-07", reservationNote: null },
  { id: "table-12", areaId: "area-salao", label: "12", seats: 3, orderId: "order-seed-12", reservationNote: null },
  { id: "table-02", areaId: "area-salao", label: "02", seats: 2, orderId: "order-seed-02", reservationNote: null },
  { id: "table-03", areaId: "area-salao", label: "03", seats: 2, orderId: null, reservationNote: null },
  { id: "table-09", areaId: "area-salao", label: "09", seats: 4, orderId: null, reservationNote: null },
  { id: "table-05", areaId: "area-salao", label: "05", seats: 2, orderId: null, reservationNote: null },
  { id: "table-andre", areaId: "area-salao", label: "André", seats: 2, orderId: null, reservationNote: "Reserva 20:30" },
  { id: "table-16", areaId: "area-varanda", label: "16", seats: 4, orderId: null, reservationNote: null },
  { id: "table-17", areaId: "area-varanda", label: "17", seats: 4, orderId: null, reservationNote: null },
  { id: "table-18", areaId: "area-varanda", label: "18", seats: 2, orderId: "order-seed-18", reservationNote: null },
  { id: "table-b1", areaId: "area-bar", label: "B1", seats: 2, orderId: null, reservationNote: null },
  { id: "table-b2", areaId: "area-bar", label: "B2", seats: 2, orderId: null, reservationNote: null },
];

function minutesAgoISO(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** Comandas de mesa já abertas, pra demonstrar o mapa com atividade real. */
export function buildSeedOrders(): Record<string, Order> {
  return {
    "order-seed-07": {
      id: "order-seed-07",
      type: "mesa",
      status: "open",
      guestCount: 4,
      serviceChargeEnabled: true,
      serviceChargeRate: 0.1,
      discountCents: 0,
      items: [
        { productId: "prod-picanha", quantity: 1, unitPriceCents: 8900 },
        { productId: "prod-chopp", quantity: 4, unitPriceCents: 1800 },
      ],
      payments: [],
      openedAt: minutesAgoISO(42),
    },
    "order-seed-12": {
      id: "order-seed-12",
      type: "mesa",
      status: "awaiting_payment",
      guestCount: 3,
      serviceChargeEnabled: true,
      serviceChargeRate: 0.1,
      discountCents: 0,
      items: [
        { productId: "prod-bruschetta", quantity: 2, unitPriceCents: 2800 },
        { productId: "prod-batata", quantity: 1, unitPriceCents: 3400 },
        { productId: "prod-camarao", quantity: 1, unitPriceCents: 7600 },
        { productId: "prod-caipirinha", quantity: 3, unitPriceCents: 2200 },
      ],
      payments: [],
      openedAt: minutesAgoISO(72),
    },
    "order-seed-02": {
      id: "order-seed-02",
      type: "mesa",
      status: "open",
      guestCount: 2,
      serviceChargeEnabled: true,
      serviceChargeRate: 0.1,
      discountCents: 0,
      items: [
        { productId: "prod-agua", quantity: 2, unitPriceCents: 800 },
        { productId: "prod-ceviche", quantity: 1, unitPriceCents: 5800 },
      ],
      payments: [],
      openedAt: minutesAgoISO(15),
    },
    "order-seed-18": {
      id: "order-seed-18",
      type: "mesa",
      status: "open",
      guestCount: 2,
      serviceChargeEnabled: true,
      serviceChargeRate: 0.1,
      discountCents: 0,
      items: [
        { productId: "prod-caipirinha", quantity: 2, unitPriceCents: 2200 },
        { productId: "prod-petitgateau", quantity: 1, unitPriceCents: 3200 },
      ],
      payments: [],
      openedAt: minutesAgoISO(20),
    },
  };
}

export const sampleCategories: Category[] = [
  { id: "cat-entradas", name: "Entradas", sortOrder: 0 },
  { id: "cat-pratos", name: "Pratos", sortOrder: 1 },
  { id: "cat-bebidas", name: "Bebidas", sortOrder: 2 },
  { id: "cat-sobremesas", name: "Sobremesas", sortOrder: 3 },
];

export const sampleProducts: Product[] = [
  {
    id: "prod-bruschetta",
    categoryId: "cat-entradas",
    name: "Bruschetta de Tomate",
    description: "Pão italiano tostado, tomate confit, manjericão fresco e azeite extravirgem.",
    priceCents: 2800,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-batata",
    categoryId: "cat-entradas",
    name: "Batata Rústica",
    description: "Batata assada com casca, alecrim e maionese de alho da casa.",
    priceCents: 3400,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-camarao",
    categoryId: "cat-entradas",
    name: "Camarão ao Alho e Óleo",
    description: "Camarão salteado na manteiga com alho, salsinha e pitada de pimenta.",
    priceCents: 7600,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-ceviche",
    categoryId: "cat-entradas",
    name: "Ceviche do Chef",
    description: "Peixe branco marinado no limão, cebola roxa, coentro e leite de tigre.",
    priceCents: 5800,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-picanha",
    categoryId: "cat-pratos",
    name: "Picanha na Chapa",
    description: "Picanha grelhada na chapa com arroz, farofa e vinagrete.",
    priceCents: 8900,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-risoto",
    categoryId: "cat-pratos",
    name: "Risoto de Funghi",
    description: "Arbóreo cremoso com mix de cogumelos e parmesão.",
    priceCents: 6400,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-salmao",
    categoryId: "cat-pratos",
    name: "Salmão Grelhado",
    description: "Salmão grelhado com legumes salteados e molho de maracujá.",
    priceCents: 7200,
    station: "cozinha",
    isActive: true,
  },
  {
    id: "prod-caipirinha",
    categoryId: "cat-bebidas",
    name: "Caipirinha de Limão",
    description: "Cachaça, limão, açúcar e gelo — feita na hora.",
    priceCents: 2200,
    station: "bar",
    isActive: true,
  },
  {
    id: "prod-chopp",
    categoryId: "cat-bebidas",
    name: "Chopp Artesanal 500ml",
    description: "Chopp artesanal da casa, servido bem gelado.",
    priceCents: 1800,
    station: "bar",
    isActive: true,
  },
  {
    id: "prod-agua",
    categoryId: "cat-bebidas",
    name: "Água com Gás",
    description: "500ml, gelada.",
    priceCents: 800,
    station: "bar",
    isActive: true,
  },
  {
    id: "prod-petitgateau",
    categoryId: "cat-sobremesas",
    name: "Petit Gâteau",
    description: "Bolo de chocolate com centro cremoso e sorvete de creme.",
    priceCents: 3200,
    station: "sobremesas",
    isActive: true,
  },
  {
    id: "prod-pudim",
    categoryId: "cat-sobremesas",
    name: "Pudim de Leite",
    description: "Receita da casa, calda de caramelo.",
    priceCents: 1800,
    station: "sobremesas",
    isActive: true,
  },
];
