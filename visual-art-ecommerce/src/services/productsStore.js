const KEY = "va_products_v1";

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function uid() {
  return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function seedProductsIfEmpty(initial = []) {
  const current = getAllProducts();
  if (current.length > 0) return current;
  const seeded = initial.length
    ? initial
    : [
        {
          id: uid(),
          title: "Banner Lona 440g",
          category: "BANNERS",
          categoryLabel: "Banners",
          desc: "Impressão digital de alta qualidade",
          priceFrom: 39.9,
          imageUrl: "",
          active: true,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: uid(),
          title: "Placa PVC",
          category: "PLACAS",
          categoryLabel: "Placas",
          desc: "Ideal para sinalização interna",
          priceFrom: 24.9,
          imageUrl: "",
          active: true,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

export function getAllProducts() {
  const raw = localStorage.getItem(KEY);
  const data = safeJsonParse(raw, []);
  return Array.isArray(data) ? data : [];
}

export function getProductById(id) {
  return getAllProducts().find((p) => p.id === id) || null;
}

export function createProduct(payload) {
  const now = new Date().toISOString();
  const item = {
    id: uid(),
    title: payload.title.trim(),
    category: payload.category,
    categoryLabel: payload.categoryLabel || payload.category,
    desc: payload.desc?.trim() || "",
    priceFrom: Number(payload.priceFrom || 0),
    imageUrl: payload.imageUrl?.trim() || "",
    active: !!payload.active,
    featured: !!payload.featured,
    createdAt: now,
    updatedAt: now,
  };

  const all = getAllProducts();
  const next = [item, ...all];
  localStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export function updateProduct(id, patch) {
  const all = getAllProducts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;

  const now = new Date().toISOString();
  const updated = {
    ...all[idx],
    ...patch,
    title: patch.title != null ? patch.title.trim() : all[idx].title,
    desc: patch.desc != null ? patch.desc.trim() : all[idx].desc,
    imageUrl: patch.imageUrl != null ? patch.imageUrl.trim() : all[idx].imageUrl,
    priceFrom: patch.priceFrom != null ? Number(patch.priceFrom || 0) : all[idx].priceFrom,
    active: patch.active != null ? !!patch.active : all[idx].active,
    featured: patch.featured != null ? !!patch.featured : all[idx].featured,
    updatedAt: now,
  };

  const next = [...all];
  next[idx] = updated;
  localStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export function deleteProduct(id) {
  const all = getAllProducts();
  const next = all.filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return true;
}

export function clearProducts() {
  localStorage.removeItem(KEY);
}

export function getActiveProducts() {
  return getAllProducts().filter((p) => p.active);
}