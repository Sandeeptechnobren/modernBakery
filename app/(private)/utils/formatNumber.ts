/**
 * Convert a string or number to an internationalized number string.
 *
 * Examples:
 * toInternationalNumber(12345) -> "12,345"
 * toInternationalNumber("12345.67") -> "12,345.67"
 * toInternationalNumber(12345, { locale: 'de-DE' }) -> "12.345"
 */
export type FormatNumberOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  /**
   * If set, number will be rounded to this many decimal places before formatting.
   * Example: roundToPlaces: 0 will round 33123.22 -> 33123, and with minimumFractionDigits:2
   * the output becomes "33,123.00".
   */
  roundToPlaces?: number;
};

export function toInternationalNumber(
  value: string | number | null | undefined,
  options: FormatNumberOptions = { roundToPlaces: 0 }
): string {
  if (value === null || value === undefined || value === '') return '';

  const locale = options?.locale ?? 'en-US';

  // Normalize string values: remove all characters except digits, dot and minus
  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else {
    const cleaned = String(value).replace(/[^0-9.-]+/g, '');
    // If cleaned is just '-' or '.' or empty, return original string
    if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.' ) return String(value);
    num = Number(cleaned);
  }

  if (Number.isNaN(num)) return String(value);
  // If user requested rounding to specific places, apply it first. Otherwise keep high precision.
  if (typeof options?.roundToPlaces === 'number' && Number.isFinite(options.roundToPlaces)) {
    num = roundOff(num, Math.max(0, Math.floor(options.roundToPlaces)));
  } else {
    num = roundOff(num, 12);
  }
  // Debug logging removed (was useful during development)

  // By default, format with 2 fraction digits (fixed to 2 decimals)
  const minimumFractionDigits =
    typeof options?.minimumFractionDigits === 'number' ? options!.minimumFractionDigits : 2;
  const maximumFractionDigits =
    typeof options?.maximumFractionDigits === 'number' ? options!.maximumFractionDigits : 2;

  const formatter = new Intl.NumberFormat(locale, {
    style: options?.style ?? 'decimal',
    currency: options?.currency,
    minimumFractionDigits,
    maximumFractionDigits,
  } as Intl.NumberFormatOptions);

  return formatter.format(num);
}

function roundOff(value: number, decimals = 12): number {
  const d = Number.isFinite(decimals) ? Math.max(0, Math.floor(decimals)) : 0;
  if (!Number.isFinite(value) || d === 0) {
    return d === 0 && Number.isFinite(value) ? Math.round(value) : value;
  }
  const factor = Math.pow(10, d);
  return Math.round(value * factor) / factor;
}

export default toInternationalNumber;
