import { colors } from "./theme";

const TACTICS: Record<string, string> = {
  TA0010: "Exfiltration",
  TA0008: "Lateral Movement",
  TA0011: "Command and Control",
  TA0040: "Impact",
  TA0043: "Reconnaissance",
};

export const TACTIC_ORDER = [
  "TA0010",
  "TA0008",
  "TA0011",
  "TA0040",
  "TA0043",
];

export function tacticName(id: string | null | undefined): string {
  if (!id) return "—";
  return TACTICS[id] ?? id;
}

export function formatInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatRate(part: number, total: number): string {
  if (!total) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function formatClock(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

export function probabilityColor(value: number): string {
  if (value >= 0.9) return colors.alert;
  if (value >= 0.7) return colors.warn;
  return colors.muted;
}
