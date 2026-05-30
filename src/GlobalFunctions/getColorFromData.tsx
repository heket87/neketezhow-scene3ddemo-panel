import {
  FieldConfigSource,
  PanelData,
} from "@grafana/data";
import { GradientColor } from "../types";
import { interpolateGradientHsl } from "./interpolateGradientHsl";
import {
  getLastFieldValue,
  resolveFieldByDataKey,
} from "./dataKeyResolver";

export interface BgColorOptions {
  usegradient?: boolean;
  global_gradient?: GradientColor;
}

function getColorFromSteps(
  numVal: number,
  steps: Array<{ value: number | null; color: string }> = [],
  fallback: string
): string {
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    const thresholdValue = step?.value == null ? -Infinity : Number(step.value);

    if (numVal >= thresholdValue) {
      return step?.color || fallback;
    }
  }

  return fallback;
}

function getGradientColor(
  numVal: number,
  gradient?: GradientColor
): string | null {
  if (
    !gradient?.highvaluegradientcolor ||
    !gradient?.lowvaluegradientcolor
  ) {
    return null;
  }

  const color = interpolateGradientHsl(
    numVal,
    Number(gradient.lowvalueforgradient),
    Number(gradient.highvalueforgradient),
    gradient.lowvaluegradientcolor,
    gradient.highvaluegradientcolor
  );

  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

export function getColorFromData(
  dataKey: string,
  data: PanelData,
  fieldConfig: FieldConfigSource<any>,
  baseColor: string,
  gradientOpts?: BgColorOptions
): string {
  if (!dataKey) {
    return baseColor;
  }

  const resolved = resolveFieldByDataKey(dataKey, data);
  if (!resolved) {
    return baseColor;
  }

  const rawVal = getLastFieldValue(resolved.field);
  const numVal = Number(rawVal);

  if (Number.isNaN(numVal)) {
    return baseColor;
  }

  if (gradientOpts?.usegradient) {
    const color = getGradientColor(numVal, gradientOpts.global_gradient);
    if (color) {
      return color;
    }
  }

  const fieldSteps = resolved.field.config?.thresholds?.steps as
    | Array<{ value: number | null; color: string }>
    | undefined;

  if (fieldSteps?.length) {
    return getColorFromSteps(numVal, fieldSteps, baseColor);
  }

  const defaultSteps = fieldConfig.defaults?.thresholds?.steps as
    | Array<{ value: number | null; color: string }>
    | undefined;

  if (defaultSteps?.length) {
    return getColorFromSteps(numVal, defaultSteps, baseColor);
  }

  return baseColor;
}
