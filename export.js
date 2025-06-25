export function exportCSV(data) {
  const csv = data.map(e => `${e.date},${e.description},${e.amount},${e.category}`).join("\n");
  const blob = new Blob(["Date,Description,Amount,Category\n" + csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
}
