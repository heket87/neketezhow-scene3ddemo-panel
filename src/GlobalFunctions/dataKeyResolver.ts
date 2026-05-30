import { DataFrame, Field, FieldType, PanelData } from "@grafana/data";

export type ResolvedField = {
  frame: DataFrame;
  field: Field;
};

export function getFieldLabel(frame: DataFrame, field: Field): string {
  return (
    field.config?.displayNameFromDS ||
    field.state?.displayName ||
    field.name ||
    frame.name ||
    frame.refId ||
    "Unnamed field"
  );
}

export function getLastFieldValue(field: Field): unknown {
  const values: any = field.values;

  if (!values || values.length === 0) {
    return undefined;
  }

  return typeof values.get === "function"
    ? values.get(values.length - 1)
    : values[values.length - 1];
}

export function buildDatasourceValue(frame: DataFrame, field: Field): string {
  return [frame.refId ?? "", frame.name ?? "", field.name ?? ""].join("__");
}

function getNonTimeFields(frame: DataFrame): Field[] {
  return (frame.fields || []).filter((f) => f.type !== FieldType.time);
}

export function resolveFieldByDataKey(
  dataKey: string,
  data: PanelData
): ResolvedField | null {
  const target = String(dataKey ?? "").trim();
  if (!target) {
    return null;
  }

  const frames = data?.series ?? [];
  if (!frames.length) {
    return null;
  }

  // 1. Новый формат: refId__frameName__fieldName
  for (const frame of frames) {
    for (const field of getNonTimeFields(frame)) {
      if (buildDatasourceValue(frame, field) === target) {
        return { frame, field };
      }
    }
  }

  // 2. Legacy формат: refId:fieldName
  for (const frame of frames) {
    for (const field of getNonTimeFields(frame)) {
      if (frame.refId && `${frame.refId}:${field.name}` === target) {
        return { frame, field };
      }
    }
  }

  // 3. По display label / field.name
  for (const frame of frames) {
    for (const field of getNonTimeFields(frame)) {
      const label = getFieldLabel(frame, field);

      if (label === target || field.name === target) {
        return { frame, field };
      }
    }
  }

  // 4. Старый фолбэк по frame.refId / frame.name
  for (const frame of frames) {
    const fields = getNonTimeFields(frame);
    if (!fields.length) {
      continue;
    }

    if (frame.refId === target || frame.name === target) {
      return { frame, field: fields[0] };
    }
  }

  return null;
}
