export function validateInputs({ total, upfront, installments, fee }) {
	/** @type {{ total?: string, upfront?: string, installments?: string, fee?: string }} */
	const errors = {};

	if (!(Number.isFinite(total) && total >= 0)) {
		errors.total = "Informe um número válido e não negativo.";
	}
	if (!(Number.isFinite(upfront) && upfront >= 0 && upfront <= total)) {
		errors.upfront = "Entrada deve ser ≤ total e não negativa.";
	}
	if (!(Number.isInteger(installments) && installments >= 1)) {
		errors.installments = "Número de parcelas deve ser um inteiro ≥ 1.";
	}
	if (!(Number.isFinite(fee) && fee >= 0 && fee < 100)) {
		errors.fee = "Taxa deve ser ≥ 0 e menor que 100.";
	}

	return { ok: Object.keys(errors).length === 0, errors };
}


