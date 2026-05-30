import { ColorPicker, ComboboxOption, Field, Input } from "@grafana/ui";
import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";

import { updateField } from "./BaseEditorFields";

export default function RenderBorderSettings({
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
    <CollapsElement label="Border settings">
      <Field label="Element border color">
        <ColorPicker
          color={String(thiselement.bordersforelementcolor || "")}
          onChange={(color) => 
            updateField(value, thiselement, onChange, "bordersforelementcolor", color)
          }
        />
      </Field>
      
      <Field label="Element border thickness" description="Enter element border thickness">
        <Input
          id="bordersforelementwidth"
          value={thiselement.bordersforelementwidth || ""}
          placeholder="10"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateField(value, thiselement, onChange, "bordersforelementwidth", e.currentTarget.value);
          }}
        />
      </Field>
    </CollapsElement>
  );
}
