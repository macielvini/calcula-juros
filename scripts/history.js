import {
	getAllCalculationsDesc,
	addCalculation,
	deleteById,
	clearAll,
} from "./db.js";
import { formatBRL, parseLocaleNumberOrZero } from "./utils/number.js";

const listEl = document.getElementById("history-list");
const clearBtn = document.getElementById("history-clear");

export async function renderHistory() {
	const items = await getAllCalculationsDesc();
	if (!listEl) return;
	listEl.innerHTML = items
		.map(
			(item) => `
		<li data-id="${item.id
				}" class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
			<span class="summary flex-1 text-sm text-slate-700 truncate">${summarize(
					item
				)}</span>
			<button class="use text-slate-700 hover:text-slate-900 underline p-2 hover:bg-slate-100 rounded-lg" type="button">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator-icon lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
			</button>
			<button class="delete text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg" type="button">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
			</button>
		</li>`
		)
		.join("");
}

/**
 * @typedef {Object} Calculation
 * @property {number} id
 * @property {Object} inputs
 * @property {string} inputs.totalValue
 * @property {string} inputs.upfrontPayment
 * @property {string} inputs.installments
 * @property {string} inputs.feePercent
 * @property {number} result
 * @property {number} [createdAt]
 * @param {Calculation} item
 */
function summarize(item) {
	const { inputs, result } = item;
	const parts = [];
	if (inputs) {
		const formattedInputs = [];
		if (inputs.totalValue)
			formattedInputs.push(formatBRL(parseLocaleNumberOrZero(inputs.totalValue)));
		// Always include upfront payment, defaulting to 0 when missing/empty
		formattedInputs.push(formatBRL(parseLocaleNumberOrZero(inputs.upfrontPayment)));
		if (inputs.installments) formattedInputs.push(`${inputs.installments}x`);
		if (inputs.feePercent)
			formattedInputs.push(`${inputs.feePercent.replace(".", ",")}%`);
		parts.push(formattedInputs.join(" • "));
	}
	if (typeof result !== "undefined") {
		parts.push(`= ${formatBRL(result)}`);
	}
	return parts.join(" ");
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
