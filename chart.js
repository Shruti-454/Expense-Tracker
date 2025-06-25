let chart;

export function generateChart(expenses, ctx) {
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa']
      }]
    },
    options: {
      responsive: true
    }
  });
}
