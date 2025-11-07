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
};

export function toInternationalNumber(
  value: string | number | null | undefined,
  options?: FormatNumberOptions
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

export default toInternationalNumber;
