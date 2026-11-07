/**
 * Pure date calculation utilities safe for both client and server bundles.
 */

/**
 * Helper to compute consecutive dates if multi-day count is specified
 * e.g. start "2026-11-14" and count 2 -> ["2026-11-14", "2026-11-15"]
 */
export function getConsecutiveDates(startDate: string, countStr?: string | number | null): string[] {
  if (!startDate) return [];
  const dates = [startDate];
  if (!countStr) return dates;

  const count = typeof countStr === "number" ? countStr : parseInt(String(countStr).replace(/[^0-9]/g, ""), 10);
  if (isNaN(count) || count <= 1) return dates;

  const [y, m, d] = startDate.split("-").map(Number);
  if (!y || !m || !d) return dates;

  const current = new Date(y, m - 1, d);
  for (let i = 1; i < Math.min(count, 14); i++) {
    const next = new Date(current);
    next.setDate(current.getDate() + i);
    const yStr = next.getFullYear();
    const mStr = String(next.getMonth() + 1).padStart(2, "0");
    const dStr = String(next.getDate()).padStart(2, "0");
    dates.push(`${yStr}-${mStr}-${dStr}`);
  }

  return dates;
}
