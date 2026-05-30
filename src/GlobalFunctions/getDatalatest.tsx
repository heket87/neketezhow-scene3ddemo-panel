import { PanelData } from "@grafana/data";
import {
  getLastFieldValue,
  resolveFieldByDataKey,
} from "./dataKeyResolver";

function toDisplayString(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function getDatalatest(dataKey: string, data: PanelData): string {
  const fallback = dataKey ?? "";

  if (!dataKey || !data?.series?.length) {
    return fallback;
  }

  const resolved = resolveFieldByDataKey(dataKey, data);
  if (!resolved) {
    return fallback;
  }

  const val = getLastFieldValue(resolved.field);
  return toDisplayString(val, fallback);
}
