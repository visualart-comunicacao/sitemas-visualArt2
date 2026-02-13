const KEY = "visualart:campaigns";

export function loadCampaigns() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function saveCampaigns(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertCampaign(campaign) {
  const list = loadCampaigns();
  const idx = list.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) list[idx] = campaign;
  else list.push(campaign);
  saveCampaigns(list);
  return campaign;
}

export function deleteCampaign(id) {
  const list = loadCampaigns().filter((c) => c.id !== id);
  saveCampaigns(list);
}
