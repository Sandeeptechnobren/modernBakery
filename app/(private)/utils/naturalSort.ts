export const naturalSort = (
  array: { [key: string]: string }[],
  order: "asc" | "desc",
  column: string
) => {
  return [...array].sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    // ✅ Handle strings
    if (typeof valueA === "string" && typeof valueB === "string") {
      const comparison = valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" });
      return order === "asc" ? comparison : -comparison;
    }

    // ✅ Handle numbers
    if (typeof valueA === "number" && typeof valueB === "number") {
      const comparison = valueA - valueB;
      return order === "asc" ? comparison : -comparison;
    }

    // ✅ Handle mixed types (string vs number)
    if (typeof valueA === "string" && typeof valueB === "number") {
      const comparison = valueA.localeCompare(String(valueB), undefined, { numeric: true, sensitivity: "base" });
      return order === "asc" ? comparison : -comparison;
    }
    if (typeof valueA === "number" && typeof valueB === "string") {
      const comparison = String(valueA).localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" });
      return order === "asc" ? comparison : -comparison;
    }

    // Default case (if values are undefined or incompatible)
    return 0;
  });
};
