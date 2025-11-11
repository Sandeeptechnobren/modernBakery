export function toTitleCase(str: string): string {
  if (!str) return str;
  const lowerStr = String(str).toLowerCase();
  return lowerStr
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}