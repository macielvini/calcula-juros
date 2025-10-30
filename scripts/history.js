import {
  getAllCalculationsDesc,
  addCalculation,
  deleteById,
  clearAll,
} from "./db.js";
import {
  formatBRL,
  parseLocaleNumberOrZero,
  parseAndFormatBrl,
} from "./utils/number.js";

const listEl = document.getElementById("history-list");
const clearBtn = document.getElementById("history-clear");

export async function renderHistory() {
  const items = await getAllCalculationsDesc();
  if (!listEl) return;
  listEl.innerHTML = items
    .map((item) => {
      const { inputs, result } = item;
      const initialValue = parseAndFormatBrl(inputs.totalValue);
      const upfrontValue = parseAndFormatBrl(inputs.upfrontPayment);
      const numberOfInstallments = `${inputs.installments}x`;
      const installmentValue = parseAndFormatBrl(
        (Number(result) || 1) / (Number(inputs.installments) || 1)
      );
      const fee = `${inputs.feePercent.replace(".", ",")}%`;
      const buttons = `
					<div class="absolute top-2 right-2 flex items-start sm:items-center gap-1 shrink-0">
						<button class="use text-slate-700 hover:text-slate-900 underline p-2 hover:bg-slate-100 rounded-lg" type="button">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator-icon lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
						</button>
						<button class="delete text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg" type="button">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
						</button>
					</div>
			`;

      return `
						<li data-id="${
              item.id
            }" class="relative flex gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-start sm:justify-between">
							<div class="flex flex-col gap-1 text-sm text-slate-700 sm:flex-1">
								${
                  initialValue
                    ? `<div><span class="font-medium">Valor inicial:</span> ${initialValue}</div>`
                    : ""
                }
								<div><span class="font-medium">Entrada:</span> ${upfrontValue}</div>
								${
                  numberOfInstallments
                    ? `
								<div>
									${
                    numberOfInstallments
                      ? `<div><span class="font-medium">Parcelas:</span> ${numberOfInstallments} ${installmentValue}</div>`
                      : ""
                  }
								</div>`
                    : ""
                }
									${fee ? `<div><span class="font-medium">Taxa:</span> ${fee}</div>` : ""}
								${
                  result
                    ? `<div><span class="font-medium">Total:</span> ${parseAndFormatBrl(
                        Number(result) + Number(inputs.upfrontPayment)
                      )}
                      </div>`
                    : ""
                }
							</div>
							${buttons}
						</li>`;
    })
    .join("");
}

if (listEl) {
  listEl.addEventListener("click", async (e) => {
    const target = e.target;
    const li = target && target.closest ? target.closest("li[data-id]") : null;
    if (!li) return;
    const id = Number(li.dataset.id);
    if (target.classList.contains("use")) {
      const items = await getAllCalculationsDesc();
      const found = items.find((x) => x.id === id);
      if (found) populateCalculator(found.inputs);
    } else if (target.classList.contains("delete")) {
      await deleteById(id);
      await renderHistory();
    }
  });
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
