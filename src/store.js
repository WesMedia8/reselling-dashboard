const STORAGE_KEY = 'reselling-dashboard-data';

const defaultData = {
  items: [],
  nextId: 1,
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...defaultData };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addItem(data, item) {
  const newItem = {
    id: data.nextId,
    name: item.name || '',
    category: item.category || '',
    platform: item.platform || '',
    source: item.source || '',
    costPrice: parseFloat(item.costPrice) || 0,
    listPrice: parseFloat(item.listPrice) || 0,
    salePrice: parseFloat(item.salePrice) || 0,
    shippingCost: parseFloat(item.shippingCost) || 0,
    platformFees: parseFloat(item.platformFees) || 0,
    status: item.status || 'unlisted',
    notes: item.notes || '',
    location: item.location || '',
    dateAcquired: item.dateAcquired || new Date().toISOString().slice(0, 10),
    dateListed: item.dateListed || '',
    dateSold: item.dateSold || '',
    imageUrl: item.imageUrl || '',
  };
  return {
    ...data,
    items: [...data.items, newItem],
    nextId: data.nextId + 1,
  };
}

export function updateItem(data, id, updates) {
  return {
    ...data,
    items: data.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  };
}

export function deleteItem(data, id) {
  return {
    ...data,
    items: data.items.filter((item) => item.id !== id),
  };
}

export function getProfit(item) {
  if (item.status === 'sold' && item.salePrice > 0) {
    return item.salePrice - item.costPrice - item.shippingCost - item.platformFees;
  }
  return null;
}

export function getExpectedProfit(item) {
  if (item.listPrice > 0) {
    return item.listPrice - item.costPrice - item.shippingCost - item.platformFees;
  }
  return null;
}

export function getROI(item) {
  const profit = getProfit(item);
  if (profit !== null && item.costPrice > 0) {
    return (profit / item.costPrice) * 100;
  }
  return null;
}

export function getDaysToSell(item) {
  if (item.dateListed && item.dateSold) {
    const listed = new Date(item.dateListed);
    const sold = new Date(item.dateSold);
    return Math.round((sold - listed) / (1000 * 60 * 60 * 24));
  }
  return null;
}

export function getDaysListed(item) {
  if (item.dateListed && item.status !== 'sold') {
    const listed = new Date(item.dateListed);
    const now = new Date();
    return Math.round((now - listed) / (1000 * 60 * 60 * 24));
  }
  return null;
}

export const STATUSES = ['unlisted', 'listed', 'sold', 'shipped', 'returned'];

export function getUniqueValues(items, field) {
  const values = new Set();
  items.forEach((i) => { if (i[field]) values.add(i[field]); });
  return [...values].sort();
}
