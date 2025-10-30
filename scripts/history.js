import {
  getAllCalculationsDesc,
  addCalculation,
  deleteById,
  clearAll,
} from "./db.js";
import { parseAndFormatBrl } from "./utils/number.js";
import { calculatorIcon, trashIcon } from "./utils/icons.js";

const listEl = document.getElementById("history-list");
const clearBtn = document.getElementById("history-clear");

export async function renderHistory() {
  let items = [];
  try {
    items = (await getAllCalculationsDesc()) || [];
  } catch {
    items = [];
  }

  if (!listEl) return;
  listEl.textContent = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "text-sm text-slate-500 px-3 py-2";
    empty.textContent = "Sem histórico ainda.";
    listEl.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();

  for (const item of items) {
    const { inputs = {}, result } = item;
    const totalValue = Number(inputs.totalValue) || 0;
    const upfrontPayment = Number(inputs.upfrontPayment) || 0;
    const installments = Number(inputs.installments) || 0;
    const totalFinanced = Number(result) || 0;

    const initialValue = parseAndFormatBrl(totalValue);
    const upfrontValue = parseAndFormatBrl(upfrontPayment);
    const installmentUnit =
      installments > 0 ? parseAndFormatBrl(totalFinanced / installments) : "—";

    const feePercent =
      typeof inputs.feePercent === "string" && inputs.feePercent.length > 0
        ? `${inputs.feePercent.replace(".", ",")}%`
        : "";

    const totalWithUpfront = parseAndFormatBrl(totalFinanced + upfrontPayment);

    const li = document.createElement("li");
    li.dataset.id = item.id;
    li.classList.add(
      "relative",
      "flex",
      "gap-3",
      "rounded-lg",
      "border",
      "border-slate-200",
      "bg-white",
      "px-3",
      "py-2",
      "sm:flex-row",
      "sm:items-start",
      "sm:justify-between"
    );

    const content = document.createElement("div");
    content.className = "flex flex-col gap-1 text-sm text-slate-700 sm:flex-1";

    const createLabeledRow = (label, value) => {
      if (!value) return null;
      const row = document.createElement("div");
      const strong = document.createElement("span");
      strong.className = "font-medium";
      strong.textContent = `${label}: `;
      row.appendChild(strong);
      row.append(
        value instanceof Node ? value : document.createTextNode(value)
      );
      return row;
    };

    const parcelas = document.createElement("div");
    const strongParcelas = document.createElement("span");
    strongParcelas.className = "font-medium";
    strongParcelas.textContent = "Parcelas: ";
    parcelas.appendChild(strongParcelas);
    parcelas.append(
      document.createTextNode(
        installments > 0 ? `${installments}x ${installmentUnit}` : "—"
      )
    );

    const rows = [
      createLabeledRow("Valor inicial", initialValue),
      createLabeledRow("Entrada", upfrontValue),
      parcelas,
      createLabeledRow("Taxa", feePercent),
      createLabeledRow("Total", totalWithUpfront),
    ].filter(Boolean);

    rows.forEach((r) => content.appendChild(r));

    const buttons = document.createElement("div");
    buttons.classList.add(
      "absolute",
      "top-2",
      "right-2",
      "flex",
      "items-start",
      "sm:items-center",
      "gap-1",
      "shrink-0"
    );

    const useButton = document.createElement("button");
    useButton.type = "button";
    useButton.classList.add(
      "text-slate-700",
      "hover:text-slate-900",
      "underline",
      "p-2",
      "hover:bg-slate-100",
      "rounded-lg"
    );
    useButton.innerHTML = calculatorIcon;
    useButton.addEventListener("click", () => {
      populateCalculator(item.inputs);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add(
      "text-red-600",
      "hover:text-red-700",
      "p-2",
      "hover:bg-red-100",
      "rounded-lg"
    );
    deleteButton.innerHTML = trashIcon;
    deleteButton.addEventListener("click", async () => {
      await deleteById(item.id);
      await renderHistory();
    });

    buttons.append(useButton, deleteButton);
    li.append(content, buttons);
    frag.appendChild(li);
  }

  listEl.appendChild(frag);
}

if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    await clearAll();
    await renderHistory();
  });
}

export async function recordCalculation(inputs, result) {
  await addCalculation({ inputs, result });
  await renderHistory();
}

function populateCalculator(inputs) {
  if (!inputs || typeof inputs !== "object") return;
  for (const [name, value] of Object.entries(inputs)) {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.value = value;
  }
}

window.addEventListener("DOMContentLoaded", renderHistory);
