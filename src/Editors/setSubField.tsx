import { ElementOptions, SubElementOptions } from "types";
import { updateField } from "./BaseEditorFields";

type SubElementKey = keyof SubElementOptions | string;

const isPlainObject = (value: any): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const deepMerge = (target: any, source: any): any => {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source;
  }

  const result: Record<string, any> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    result[key] =
      isPlainObject(targetValue) && isPlainObject(sourceValue)
        ? deepMerge(targetValue, sourceValue)
        : sourceValue;
  }

  return result;
};

const setValueByPath = <T extends Record<string, any>>(source: T, path: string, value: any): T => {
  const keys = path.split(".");
  const result: any = Array.isArray(source) ? [...source] : { ...(source || {}) };

  let currentResult = result;
  let currentSource: any = source || {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLast = i === keys.length - 1;

    if (isLast) {
      currentResult[key] = value;
      continue;
    }

    const nextSource = currentSource?.[key];

    currentResult[key] = Array.isArray(nextSource)
      ? [...nextSource]
      : { ...(nextSource || {}) };

    currentResult = currentResult[key];
    currentSource = nextSource || {};
  }

  return result;
};

export const setSubField = (
  fieldValue: any,
  thiselement: ElementOptions,
  sub: SubElementOptions,
  subIndex: number,
  value: ElementOptions[],
  onChange: (value: ElementOptions[]) => void,
  fieldOrUpdates: SubElementKey | Partial<SubElementOptions>
) => {
  let updatedSub: SubElementOptions;

  if (typeof fieldOrUpdates === "string") {
    updatedSub = setValueByPath(sub as Record<string, any>, fieldOrUpdates, fieldValue) as SubElementOptions;
  } else {
    updatedSub = deepMerge(sub, fieldOrUpdates) as SubElementOptions;
  }

  const updatedSubs = [...(thiselement.subelements || [])];
  updatedSubs[subIndex] = updatedSub;

  updateField(value, thiselement, onChange, "subelements", updatedSubs);
};
