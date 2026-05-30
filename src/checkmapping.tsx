import { FieldConfigSource } from "@grafana/data";

function buildGrafanaRegex(pattern: unknown): RegExp {
  const str = String(pattern ?? "").trim();

  // Grafana UI часто хранит regexp как "/pattern/" или "/pattern/i"
  const match = str.match(/^\/(.+)\/([gimsuy]*)$/);
  if (match) {
    return new RegExp(match[1], match[2]);
  }

  return new RegExp(str);
}

function applyMappings(datavalue: any, mappings: any[] | undefined): { matched: boolean; value: any } {
  if (!Array.isArray(mappings)) {
    return { matched: false, value: datavalue };
  }

  for (const mapping of mappings) {
    if (!mapping?.type || !mapping?.options) {continue;}

    // regex mapping
    if (mapping.type === "regex") {
      const pattern = mapping.options.pattern;
      if (pattern && buildGrafanaRegex(pattern).test(String(datavalue ?? ""))) {
        return {
          matched: true,
          value: mapping.options.result?.text ?? datavalue,
        };
      }
    }

    // range mapping
    if (mapping.type === "range") {
      const num = Number(datavalue);
      if (!Number.isNaN(num)) {
        const from = mapping.options.from ?? Number.NEGATIVE_INFINITY;
        const to = mapping.options.to ?? Number.POSITIVE_INFINITY;

        if (num >= from && num <= to) {
          return {
            matched: true,
            value: mapping.options.result?.text ?? datavalue,
          };
        }
      }
    }

    // value mapping
    if (mapping.type === "value") {
      const options = mapping.options as Record<string, { text?: string }>;
      const key = String(datavalue);

      if (Object.prototype.hasOwnProperty.call(options, key)) {
        return {
          matched: true,
          value: options[key]?.text ?? datavalue,
        };
      }
    }

    // special mapping (на всякий случай)
    if (mapping.type === "special") {
      const match = mapping.options.match;

      const ok =
        (match === "null" && datavalue == null) ||
        (match === "nan" && Number.isNaN(datavalue)) ||
        (match === "empty" && (datavalue === "" || datavalue == null)) ||
        (match === "true" && (datavalue === true || datavalue === "true")) ||
        (match === "false" && (datavalue === false || datavalue === "false"));

      if (ok) {
        return {
          matched: true,
          value: mapping.options.result?.text ?? datavalue,
        };
      }
    }
  }

  return { matched: false, value: datavalue };
}

export default function checkmappingoverride(
  datavalue: any,
  fieldname: string,
  fieldconfig: FieldConfigSource<any>
) {
  const overrides = fieldconfig?.overrides ?? [];

  for (const override of overrides) {
    const matcher = override?.matcher;
    const properties = override?.properties ?? [];

    let matchesField = false;

    if (matcher?.id === "byName") {
      matchesField = String(matcher.options) === fieldname;
    } else if (matcher?.id === "byRegexp") {
      matchesField = buildGrafanaRegex(matcher.options).test(fieldname);
    }

    if (!matchesField) {continue;}

    const mappingsProp = properties.find((p) => p?.id === "mappings");
    const mapped = applyMappings(datavalue, mappingsProp?.value);

    if (mapped.matched) {
      return mapped.value;
    }
  }

  // fallback на defaults.mappings
  const fallback = applyMappings(datavalue, fieldconfig?.defaults?.mappings as any[]);
  return fallback.value;
}
