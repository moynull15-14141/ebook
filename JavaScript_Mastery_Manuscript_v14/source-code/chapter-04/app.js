"use strict";
const items = [];
const form = document.querySelector("#form");
const summary = document.querySelector("#summary");
const list = document.querySelector("#items");
const error = document.querySelector("#error");
function render() {
  const result = window.CartAnalyzer.analyzeCart(items);
  summary.textContent = `Items: ${result.distinctItems} | Units: ${result.units} | Total: BDT ${result.total} | Highest line: ${result.highest?.name ?? "None"}`;
  list.replaceChildren();
  for (const row of result.rows) {
    const li = document.createElement("li");
    li.textContent = `${row.name}: ${row.quantity} × ${row.price} = BDT ${row.subtotal}`;
    list.append(li);
  }
}
form.addEventListener("submit", event => {
  event.preventDefault(); error.textContent = "";
  const item = { name: document.querySelector("#name").value.trim(), price: Number(document.querySelector("#price").value), quantity: Number(document.querySelector("#qty").value) };
  try { window.CartAnalyzer.analyzeCart([...items, item]); items.push(item); render(); form.reset(); document.querySelector("#qty").value = "1"; }
  catch (err) { error.textContent = err.message; }
});
document.querySelector("#clear").addEventListener("click", () => { items.length = 0; error.textContent = ""; render(); });
render();
