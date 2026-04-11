/**
 * Utility to clean ingredient string
 * Example: "500g thịt bò" -> "thịt bò"
 */
export function cleanIngredient(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/^[\d/.,]+\s*(thìa|quả|miếng|g|kg|lít|tép|cây|lá|bìa|củ|bát|tai)\s+/, '')
    .replace(/^[\d/.,]+(\w+)?\s+/, '')
    .trim();
}
