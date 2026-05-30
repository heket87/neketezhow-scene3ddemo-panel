import { Field, Switch, Input, Combobox, ComboboxOption } from "@grafana/ui";
import React from "react";
import { ElementOptions, SubElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";
import { updateField } from "./BaseEditorFields";
import { setSubField } from "./setSubField";

export default function RenderVisibilitySettings({
  type,
  thiselement,
  datasources,
  value,
  onChange,
  subIndex,
  subelement,
}: {
  type: string;
  thiselement: ElementOptions;
  datasources: Array<ComboboxOption<string>>;
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
  subIndex?: number;
  subelement?: SubElementOptions;
}) {
  const options = [...datasources, { value: "static", label: "static" }];

  const isSubElement =
    type === "subelement" && subelement !== undefined && subIndex !== undefined;

  const visibility = isSubElement
    ? subelement?.visibility
    : thiselement.visibility;

  const setVisibilityField = (path: string, fieldValue: any) => {
    if (isSubElement && subelement !== undefined && subIndex !== undefined) {
      setSubField(
        fieldValue,
        thiselement,
        subelement,
        subIndex,
        value,
        onChange,
        path
      );
    } else {
      updateField(value, thiselement, onChange, path, fieldValue);
    }
  };

  return (
    <CollapsElement label="Visibility settings" key="visibility-settings">
      <Field label="Data for visibility">
        <Combobox
          options={options}
          value={visibility?.visible_query}
          onChange={(e) =>
            setVisibilityField("visibility.visible_query", e.value)
          }
        />
      </Field>

      {visibility?.visible_query !== "static" && (
        <>
          <Field label="Visibility condition mode">
            <Combobox
              options={[
                { label: "Numeric comparison", value: "threshold" },
                { label: "Regex", value: "regex" },
              ]}
              value={visibility?.visible_mode ?? "threshold"}
              onChange={(e) =>
                setVisibilityField("visibility.visible_mode", e.value)
              }
            />
          </Field>

          {(visibility?.visible_mode ?? "threshold") === "threshold" && (
            <>
              <Field label="Hide when value is">
                <Combobox
                  options={[
                    { label: "< (less than)", value: "<" },
                    { label: "<= (less or equal)", value: "<=" },
                    { label: "> (greater than)", value: ">" },
                    { label: ">= (greater or equal)", value: ">=" },
                    { label: "== (equal)", value: "==" },
                    { label: "!= (not equal)", value: "!=" },
                  ]}
                  value={visibility?.visible_threshold_op ?? "<"}
                  onChange={(e) =>
                    setVisibilityField(
                      "visibility.visible_threshold_op",
                      e.value
                    )
                  }
                />
              </Field>

              <Field label="Threshold value">
                <Input
                  type="number"
                  placeholder="0"
                  value={visibility?.visible_threshold_value ?? ""}
                  onChange={(e) =>
                    setVisibilityField(
                      "visibility.visible_threshold_value",
                      e.currentTarget.value
                    )
                  }
                />
              </Field>
            </>
          )}

          {visibility?.visible_mode === "regex" && (
            <Field label="Regex when object is not visible">
              <Input
                value={visibility?.visible_regex ?? ""}
                onChange={(e) =>
                  setVisibilityField(
                    "visibility.visible_regex",
                    e.currentTarget.value
                  )
                }
              />
            </Field>
          )}
        </>
      )}

      {visibility?.visible_query === "static" && (
        <Field label="Static element visibility">
          <Switch
            value={visibility?.visible}
            onChange={(e) =>
              setVisibilityField(
                "visibility.visible",
                e.currentTarget.checked
              )
            }
            label="Static element visibility"
          />
        </Field>
      )}
    </CollapsElement>
  );
}
