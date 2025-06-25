export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function updateTotal(expenses, displayEl) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  displayEl.textContent = total.toFixed(2);
}
