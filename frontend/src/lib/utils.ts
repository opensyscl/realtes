import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================================
// Currency: módulo singleton que la app actualiza al login
// ===========================================================
let _currency = "CLP";
let _locale = "es-CL";

export function setAppCurrency(currency: string | undefined, locale: string | undefined) {
  if (currency) _currency = currency;
  if (locale) _locale = locale;
}

export function getAppCurrency(): { currency: string; locale: string } {
  return { currency: _currency, locale: _locale };
}

/**
 * Formatea un valor monetario con la moneda+locale configurados de la agencia.
 * Permite override puntual con el segundo argumento si necesitas otra moneda.
 */
export function formatCurrency(
  value: number,
  override?: { currency?: string; locale?: string },
) {
  const currency = override?.currency ?? _currency;
  const locale = override?.locale ?? _locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // CLP/COP/JPY no usan decimales; EUR/USD sí. Intl ya lo respeta por defecto
    // pero para el dashboard preferimos siempre 0 decimales (más limpio).
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale?: string) {
  return new Intl.NumberFormat(locale ?? _locale).format(value);
}

export const SUPPORTED_CURRENCIES = [
  { code: "CLP", label: "Peso chileno", symbol: "$", locale: "es-CL" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "es-ES" },
  { code: "USD", label: "Dólar estadounidense", symbol: "US$", locale: "en-US" },
  { code: "ARS", label: "Peso argentino", symbol: "$", locale: "es-AR" },
  { code: "MXN", label: "Peso mexicano", symbol: "$", locale: "es-MX" },
  { code: "COP", label: "Peso colombiano", symbol: "$", locale: "es-CO" },
  { code: "PEN", label: "Sol peruano", symbol: "S/", locale: "es-PE" },
  { code: "UYU", label: "Peso uruguayo", symbol: "$U", locale: "es-UY" },
  { code: "BRL", label: "Real brasileño", symbol: "R$", locale: "pt-BR" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];
