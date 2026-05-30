import { Field, Switch, ColorPicker, Combobox, ComboboxOption } from "@grafana/ui";
import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";

import { updateField } from "./BaseEditorFields";

export default function RenderColorSettings({
  thiselement,
  datasources,
  value,
  onChange
}: {
  thiselement: ElementOptions;
  datasources: ComboboxOption[];
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
}) {
  return (
    <CollapsElement label="Color settings" key="color-settings">
      <Field label="Use query for element color" description="Use query for color">
        <Switch 
          
          defaultChecked={thiselement.enablecolorquery ?? false}
          onChange={(e) => 
            updateField(value, thiselement, onChange, "enablecolorquery", e.currentTarget.checked)
          }
          label='Use query for element color'
        />
      </Field>
      
      {thiselement.enablecolorquery && (
        <Field label="Data for element color" description="Select data for element color">
          <Combobox
            onChange={(e: ComboboxOption<string>) => {
              updateField(value, thiselement, onChange, "colorquery", e.value);
            }}
            value={thiselement.colorquery}
            options={datasources}
          />
        </Field>
      )}
      
      <Field label="Use gradient for element color" description="Use gradient for color">
        <Switch 
          defaultChecked={thiselement.usegradient ?? false}
          onChange={(e) => 
            updateField(value, thiselement, onChange, "usegradient", e.currentTarget.checked)
          }
          label='Use gradient for element color'
        />
      </Field>
      {!thiselement.enablecolorquery && (
        <Field label="Element color">
          <ColorPicker
            color={String(thiselement.color || "")}
            onChange={(color) => {
              updateField(value, thiselement, onChange, "color", color);
            }}
          />
        </Field>
      )}
      
      {thiselement.type === "grid" && (
        <Field label="Center lines color">
          <ColorPicker
            color={String(thiselement.center_grid_color || "")}
            onChange={(color) => {
              updateField(value, thiselement, onChange, "center_grid_color", color);
            }}
          />
        </Field>
      )} 
    </CollapsElement>
  );
}
