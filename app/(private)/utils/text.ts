export function toTitleCase(str: string): string {
  if (!str) return str;
  const lowerStr = String(str).toLowerCase();
  return lowerStr
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

export function camelToTitleCase(camelCaseStr: string): string {
    if (!camelCaseStr) {
        return "";
    }
    let spacedStr = camelCaseStr.replace(/([A-Z])/g, ' $1');
    spacedStr = spacedStr.trim();
    return spacedStr
        .toLowerCase()
        .split(' ')
        .map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}