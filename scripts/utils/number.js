export function formatBRL(n) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);
}

export function parseLocaleNumber(value) {
  const raw = value == null ? "" : String(value).trim();
  if (raw === "") return NaN;
  return Number.parseFloat(raw.replace(",", "."));
}

export function parseLocaleNumberOrZero(value) {
  const n = parseLocaleNumber(value);
  return Number.isFinite(n) ? n : 0;
}

export function toInt(value) {
  const raw = value == null ? "" : String(value).trim();
  if (raw === "") return NaN;
  return Number.parseInt(raw, 10);
}

export function parseAndFormatBrl(value) {
  return formatBRL(parseLocaleNumberOrZero(value));
}
