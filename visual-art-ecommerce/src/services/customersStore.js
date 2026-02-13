const KEY = "va_customers_v1";

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function uid() {
  return `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function seedCustomersIfEmpty() {
  const existing = getAllCustomers();
  if (existing.length) return existing;

  const now = nowISO();
  const seeded = [
    {
      id: uid(),
      name: "Cliente Teste",
      email: "cliente@loja.com",
      phone: "(16) 99999-9999",
      active: true,
      createdAt: now,
      updatedAt: now,
      addresses: [
        {
          id: uid(),
          label: "Casa",
          street: "Av. Paulista",
          number: "1000",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          zip: "01311-300",
        },
      ],
    },
  ];

  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

export function getAllCustomers() {
  const raw = localStorage.getItem(KEY);
  const data = safeJsonParse(raw, []);
  return Array.isArray(data) ? data : [];
}

export function getCustomerByEmail(email) {
  const e = normalizeEmail(email);
  return getAllCustomers().find((c) => normalizeEmail(c.email) === e) || null;
}

export function createCustomer(payload) {
  const all = getAllCustomers();

  const email = normalizeEmail(payload.email);
  console.log({ payload })
  if (!email) throw new Error("E-mail é obrigatório.");

  if (all.some((c) => normalizeEmail(c.email) === email)) {
    throw new Error("Já existe cliente com esse e-mail.");
  }

  const now = nowISO();
  const item = {
    id: uid(),
    name: String(payload.name || "").trim(),
    email,
    phone: String(payload.phone || "").trim(),
    active: payload.active !== false,
    addresses: Array.isArray(payload.addresses) ? payload.addresses : [],
    createdAt: now,
    updatedAt: now,
  };

  const next = [item, ...all];
  localStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export function updateCustomer(id, patch) {
  const all = getAllCustomers();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return null;

  const nextEmail =
    patch.email != null ? normalizeEmail(patch.email) : normalizeEmail(all[idx].email);

  if (nextEmail !== normalizeEmail(all[idx].email)) {
    if (all.some((c) => normalizeEmail(c.email) === nextEmail)) {
      throw new Error("Já existe cliente com esse e-mail.");
    }
  }

  const now = nowISO();
  const updated = {
    ...all[idx],
    ...patch,
    name: patch.name != null ? String(patch.name).trim() : all[idx].name,
    email: nextEmail,
    phone: patch.phone != null ? String(patch.phone).trim() : all[idx].phone,
    active: patch.active != null ? !!patch.active : all[idx].active,
    addresses: patch.addresses != null ? patch.addresses : all[idx].addresses,
    updatedAt: now,
  };

  const next = [...all];
  next[idx] = updated;
  localStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export function deleteCustomer(id) {
  const next = getAllCustomers().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return true;
}

export function clearCustomers() {
  localStorage.removeItem(KEY);
}
