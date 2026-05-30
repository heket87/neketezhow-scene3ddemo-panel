import {
  Button,
  Combobox,
  ComboboxOption,
  Field,
  Input,
  Switch,
} from "@grafana/ui";
import React from "react";
import {
  CenterPosition3d,
  ElementOptions,
} from "types";

import { defaultValuesElement } from "defaultValuesElement";

import RenderVisibilitySettings from "./renderVisibilitySettings";
import RenderColorSettings from "./renderColorSettings";
import RenderPositionSettings from "./renderPositionSettings";
import RenderTextElementSettings from "./renderTextElementSettings";
import RenderSizeSettings from "./renderSizeSettings";
import RenderRotationSettings from "./renderRotationSettings";

import RenderCustomElementSettings from "./renderCustomElementSettings";
import RenderBorderSettings from "./renderBorderSettings";
import RenderLinkSettings from "./renderLinkSettings";
import RenderTextWindowSettings from "./renderTextWindowSettings";
import RenderModelSettings from "./renderModelSettings";

import RenderLine3DSettings from "./renderLine3DSettings";
import Render3DPointsSettings from "./Render3DPointsSettings";
import { CollapsElement } from "./Collapsesible";
import Points3DButtons from "./Points3DButtons";


export function deepUpdateElement(
  list: ElementOptions[],
  targetId: string,
  updater: (el: ElementOptions) => ElementOptions
): ElementOptions[] {
  return list.map((item) => {
    if (item.id === targetId) {
      const updated = updater(item);

      return updated;
    }


    return item;
  });
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function setDeepValue(
  obj: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  const keys = path.split(".");
  const result = { ...obj };

  let current: Record<string, any> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const prev = current[key];

    current[key] = isPlainObject(prev) ? { ...prev } : {};
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source as T;
  }

  const result: Record<string, any> = { ...(target as Record<string, any>) };

  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, any>)[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result as T;
}

function normalizeUpdates(
  target: ElementOptions,
  fieldOrUpdates: keyof ElementOptions | string | Partial<ElementOptions>,
  fieldValue?: any
): Partial<ElementOptions> {
  if (typeof fieldOrUpdates === "string") {
    if (fieldOrUpdates.includes(".")) {
      return setDeepValue({}, fieldOrUpdates, fieldValue) as Partial<ElementOptions>;
    }

    return { [fieldOrUpdates]: fieldValue } as Partial<ElementOptions>;
  }

  let result: Record<string, any> = {};

  for (const [key, val] of Object.entries(fieldOrUpdates)) {
    if (key.includes(".")) {
      result = setDeepValue(result, key, val);
    } else if (isPlainObject(val) && isPlainObject((target as any)[key])) {
      result[key] = deepMerge((target as any)[key], val);
    } else {
      result[key] = val;
    }
  }

  return result as Partial<ElementOptions>;
}

export const updateField = (
  value: ElementOptions[],
  target: ElementOptions,
  onChange: (val: ElementOptions[]) => void,
  fieldOrUpdates: keyof ElementOptions | string | Partial<ElementOptions>,
  fieldValue?: any
) => {
  let updates = normalizeUpdates(target, fieldOrUpdates, fieldValue);



  const updatedValue = deepUpdateElement(value, target.id, (el) =>
    deepMerge(el, updates)
  );

  onChange(updatedValue);
};

export default function BaseEditorFields({
  value,
  optionstypes,
  datasources,
  thiselement,
  onChange,
  checkboxshape,
}: {
  value: ElementOptions[];
  thiselement: ElementOptions;
  optionstypes: ComboboxOption[];
  datasources: ComboboxOption[];
  onChange: (val: ElementOptions[]) => void;
  checkboxshape?: boolean;
}) {
  const handleTypeChange = (option: ComboboxOption<string>) => {
    const type = option.value;
    const updates: Partial<ElementOptions> = { type };

    if (type === "Custom Element" && !thiselement.points?.length) {
      updates.points = defaultValuesElement.points;
    }



    updateField(value, thiselement, onChange, updates);
  };

  return (
    <>
      <Field label="Element name">
        <Input
          value={thiselement.name || ""}
          onChange={(e) =>
            updateField(value, thiselement, onChange, "name", e.currentTarget.value)
          }
        />
      </Field>

      {!checkboxshape && (
        <Field label="Element type" description="Select element type">
          <Combobox
            value={thiselement.type}
            options={optionstypes}
            onChange={handleTypeChange}
          />
        </Field>
      )}



    
        <RenderVisibilitySettings
          type={"element"}
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />


      {thiselement.type === "Flow" && (
        <>
          <CollapsElement label="Point coordinates">
            {(thiselement.points3d || []).map((point: CenterPosition3d, zz) => {
              return (
                <Field label={"Point " + (zz + 1)} key={zz}>
                  <>
                    <Render3DPointsSettings
                      thiselement={thiselement}
                      value={value}
                      onChange={onChange}
                      zz={zz}
                      point={point}
                    />
                    <Points3DButtons
                      thiselement={thiselement}
                      zz={zz}
                      value={value}
                      onChange={onChange}
                    />
                  </>
                </Field>
              );
            })}
            <Button
              aria-label="Add point"
              title="Add point"
              icon="plus"
              variant="primary"
              size="md"
              onClick={(e) => {
                e.stopPropagation();
                const newPoints = [
                  ...(thiselement.points3d || []),
                  { x: "0", y: "0", z: "0" },
                ];
                updateField(value, thiselement, onChange, "points3d", newPoints);
              }}
            />
          </CollapsElement>
          <Field label="Closed loop">
            <Switch
              value={thiselement.line3d_closed ?? false}
              onChange={(e) =>
                updateField(
                  value,
                  thiselement,
                  onChange,
                  "line3d_closed",
                  e.currentTarget.checked
                )
              }
            />
          </Field>
        </>
      )}

          {!String(thiselement?.type).includes("load") && (
            <Field
              label={"Element transparency"}
              description={"Enter object transparency from 0-1"}
            >
              <Input
                value={thiselement.opacity}
                onChange={(e) =>
                  updateField(
                    value,
                    thiselement,
                    onChange,
                    "opacity",
                    e.currentTarget.value
                  )
                }
                label="Element transparency"
              />
            </Field>
          )}

          <RenderColorSettings
            thiselement={thiselement}
            datasources={datasources}
            value={value}
            onChange={onChange}
          />
 

      <RenderPositionSettings
        thiselement={thiselement}
        value={value}
        onChange={onChange}
      />

      {(thiselement.type === "text3d" || thiselement.type === "text2d") && (
        <RenderTextElementSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      {thiselement.type !== "text2d" &&
        thiselement.type !== "Line3D" &&
        <RenderSizeSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />}

      {thiselement.type !== "Line3D" && (
        <RenderRotationSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      {thiselement.type === "Custom Element" && (
        <RenderCustomElementSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      {thiselement.type === "Line3D" && (
        <RenderLine3DSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      {(thiselement.type === "plane" ||
        thiselement.type === "Custom Element" ||
        thiselement.type === "text3d" ||
        thiselement.type === "Line3D") && (
        <Field label="Render on both sides">
          <Switch
            defaultChecked={thiselement.double_side ?? false}
            onChange={(e) =>
              updateField(
                value,
                thiselement,
                onChange,
                "double_side",
                e.currentTarget.checked
              )
            }
            label="Render on both sides"
          />
        </Field>
      )}

      {!thiselement.type?.includes("load") && (
        <Field label="Add object borders" description="Add object borders">
          <Switch
            defaultChecked={thiselement.bordersforelement ?? false}
            onChange={(e) =>
              updateField(
                value,
                thiselement,
                onChange,
                "bordersforelement",
                e.currentTarget.checked
              )
            }
            label="Add object borders"
          />
        </Field>
      )}

      {thiselement.bordersforelement && (
        <RenderBorderSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      <Field label="Make object clickable" description="Make TWO clicks on object">
        <Switch
          defaultChecked={thiselement.make_clikable ?? false}
          onChange={(e) =>
            updateField(
              value,
              thiselement,
              onChange,
              "make_clikable",
              e.currentTarget.checked
            )
          }
          label="Make object clickable"
        />
      </Field>

      {thiselement.make_clikable && (
        <RenderLinkSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      <Field label="Add text window" description="Add text window">
        <Switch
          defaultChecked={thiselement.addText ?? false}
          onChange={(e) =>
            updateField(
              value,
              thiselement,
              onChange,
              "addText",
              e.currentTarget.checked
            )
          }
          label="Add text window"
        />
      </Field>

      <Field label="Add auxiliary information" description="Add auxiliary information">
        <Switch
          defaultChecked={thiselement.helpwindow ?? false}
          onChange={(e) =>
            updateField(
              value,
              thiselement,
              onChange,
              "helpwindow",
              e.currentTarget.checked
            )
          }
          label="Add auxiliary information"
        />
      </Field>

      {thiselement.addText && (
        <RenderTextWindowSettings
          type={"element"}
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      {thiselement.type?.includes("load") && (
        <RenderModelSettings
          thiselement={thiselement}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}
    </>
  );
}
