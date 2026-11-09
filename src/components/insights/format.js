/*
 * Shared number formatting for the Insights charts.
 *
 * In its own file rather than beside the tooltip component because Vite's
 * fast refresh only works on a module that exports components and nothing
 * else — a helper exported from the same file as a component silently
 * breaks hot reloading for it.
 */

// 2_923_706_026 -> "$2.92B", 185_000_000 -> "$185M"
export const money = (value) => {
  if (!value) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`;
  return `$${value.toLocaleString("en-US")}`;
};
