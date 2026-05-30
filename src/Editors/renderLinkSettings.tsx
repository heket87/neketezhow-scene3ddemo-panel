import { ComboboxOption, Field, Input, Switch } from "@grafana/ui";
import React from "react";
import { ElementOptions, SubElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";

import { updateField } from "./BaseEditorFields";
import { setSubField } from "./setSubField";

export default function RenderLinkSettings({
  type,
  thiselement,
  datasources,
  value,
  onChange,
  subIndex,
  subelement,
}: {
  type?: string;
  thiselement: ElementOptions;
  datasources: ComboboxOption[];
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
  subIndex?: number;
  subelement?: SubElementOptions;
}) {
  const isSubElement = type === "subelement" && subelement !== undefined && subIndex !== undefined;
  const linkTarget = isSubElement ? subelement : thiselement;
  const setLinkField = (field: keyof SubElementOptions | keyof ElementOptions, fieldValue: any) => {
    if (isSubElement) {
      setSubField(fieldValue, thiselement, subelement, subIndex, value, onChange, field);
      return;
    }

    updateField(value, thiselement, onChange, field as keyof ElementOptions, fieldValue);
  };

  return (
    <CollapsElement label="Link settings">
      <Field label="Enter link">
        <Input
          value={linkTarget.link || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setLinkField("link", e.currentTarget.value)
          }
        />
      </Field>
      
      <Field label="Open in current window" description="">
        <Switch
         defaultChecked={linkTarget.open_in_current ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setLinkField("open_in_current", e.currentTarget.checked);
          }}
        />
      </Field>
    </CollapsElement>    
  );
}
