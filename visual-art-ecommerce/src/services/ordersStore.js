const KEY = "va_orders_v1";

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function uid() {
  // estilo #231
  return Math.floor(200 + Math.random() * 9000);
}

function nowISO() {
  return new Date().toISOString();
}

export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PROCESSING: "PROCESSING",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  TRASH: "TRASH",
};

export const ORDER_STATUS_LABEL = {
  PENDING_PAYMENT: "Pagamento pendente",
  PROCESSING: "Processando",
  ON_HOLD: "Aguardando",
  COMPLETED: "Concluído",
  FAILED: "Falhado",
  TRASH: "Lixo",
};

export function seedOrdersIfEmpty() {
  const existing = getAllOrders();
  if (existing.length) return existing;

  const seeded = [
    {
      id: uid(),
      customerName: "Ric Jon",
      customerEmail: "teste@hostnet.com.br",
      itemsCount: 1,
      shippingTo: "Ric Jon, Av. Paulista, Bela Vista, São Paulo, 01311-300",
      paymentMethod: "Transferência bancária direta",
      status: ORDER_STATUS.PENDING_PAYMENT,
      total: 20.0,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: uid(),
      customerName: "Marcos Amaral",
      customerEmail: "marcos@email.com",
      itemsCount: 3,
      shippingTo: "Marcos Amaral, Av. Paulista, São Paulo, 01311-300",
      paymentMethod: "PagSeguro",
      status: ORDER_STATUS.PROCESSING,
      total: 65.0,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: uid(),
      customerName: "Paulo Gustavo",
      customerEmail: "paulo@email.com",
      itemsCount: 2,
      shippingTo: "Paulo Gustavo, Av. Paulista, São Paulo, 01311-300",
      paymentMethod: "Pix",
      status: ORDER_STATUS.COMPLETED,
      total: 54.0,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];

  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

export function getAllOrders() {
  const raw = localStorage.getItem(KEY);
  const data = safeJsonParse(raw, []);
  return Array.isArray(data) ? data : [];
}

export function setAllOrders(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateOrder(id, patch) {
  const all = getAllOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return null;

  const updated = {
    ...all[idx],
    ...patch,
    updatedAt: nowISO(),
  };

  const next = [...all];
  next[idx] = updated;
  setAllOrders(next);
  return updated;
}

export function bulkUpdate(ids, patch) {
  const set = new Set(ids);
  const next = getAllOrders().map((o) =>
    set.has(o.id) ? { ...o, ...patch, updatedAt: nowISO() } : o
  );
  setAllOrders(next);
  return true;
}

export function deleteOrderHard(id) {
  const next = getAllOrders().filter((o) => o.id !== id);
  setAllOrders(next);
  return true;
}

export function clearOrders() {
  localStorage.removeItem(KEY);
}
