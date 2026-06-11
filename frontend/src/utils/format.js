// Consistent currency formatting across the app (Indian Rupee, locale-aware)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Returns { from, to } ISO date strings (to is exclusive) for a given preset
export function getDateRange(preset, customFrom, customTo) {
  const now = new Date();
  const startOfMonth = (y, m) => new Date(y, m, 1);

  if (preset === 'thisMonth') {
    const from = startOfMonth(now.getFullYear(), now.getMonth());
    const to = startOfMonth(now.getFullYear(), now.getMonth() + 1);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  if (preset === 'lastMonth') {
    const from = startOfMonth(now.getFullYear(), now.getMonth() - 1);
    const to = startOfMonth(now.getFullYear(), now.getMonth());
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  if (preset === 'custom') {
    return { from: customFrom || undefined, to: customTo || undefined };
  }

  // 'all'
  return { from: undefined, to: undefined };
}
