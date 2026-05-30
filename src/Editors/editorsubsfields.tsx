import React from "react";
import { Button, ColorPicker, ComboboxOption, Field, Input, Switch } from "@grafana/ui";
import { ElementOptions, SubElementOptions } from "types";
import { updateField } from "./BaseEditorFields";
import RenderVisibilitySettings from "./renderVisibilitySettings";
import RenderTextWindowSettings from "./renderTextWindowSettings";
import RenderLinkSettings from "./renderLinkSettings";
import { CollapsElement } from "./Collapsesible";

function updateSubelement(
  value: ElementOptions[],
  thiselement: ElementOptions,
  subIndex: number,
  onChange: (val: ElementOptions[]) => void,
  patch: Partial<SubElementOptions>
) {
  const next = [...(thiselement.subelements || [])];
  next[subIndex] = { ...next[subIndex], ...patch } as SubElementOptions;
  updateField(value, thiselement, onChange, "subelements", next);
}

export default function SubElementFields({
  thiselement,
  sub,
  subIndex,
  datasources,
  value,
  onChange,
}: {
  thiselement: ElementOptions;
  sub: SubElementOptions;
  subIndex: number;
  datasources: Array<ComboboxOption<string>>;
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
}) {
  const setSub = React.useCallback(
    (patch: Partial<SubElementOptions>) => updateSubelement(value, thiselement, subIndex, onChange, patch),
    [value, thiselement, subIndex, onChange]
  );

  const title = sub.name || `Subelement ${subIndex + 1}`;

  return (
    <CollapsElement label={title}>
      <Field label="Subelement name">
        <Input value={sub.name || ""} onChange={(e) => setSub({ name: e.currentTarget.value })} />
      </Field>

      <Field label="Color">
        <ColorPicker color={String(sub.value || sub.color || "#ffffff")} onChange={(color) => setSub({ value: color, color })} />
      </Field>

      <Field label="Use color query">
        <Switch value={sub.enablecolorquery ?? false} onChange={(e) => setSub({ enablecolorquery: e.currentTarget.checked })} />
      </Field>

      {sub.enablecolorquery && (
        <Field label="Color query">
          <Input value={sub.value || sub.colorquery || ""} onChange={(e) => setSub({ value: e.currentTarget.value, colorquery: e.currentTarget.value })} />
        </Field>
      )}

      <Field label="Opacity">
        <Input value={sub.opacity ?? "1"} onChange={(e) => setSub({ opacity: e.currentTarget.value })} />
      </Field>

      <Field label="Double side">
        <Switch value={sub.double_side ?? false} onChange={(e) => setSub({ double_side: e.currentTarget.checked })} />
      </Field>

      <RenderVisibilitySettings
        type="subelement"
        thiselement={thiselement}
        subIndex={subIndex}
        datasources={datasources}
        value={value}
        onChange={onChange}
      />

      <Field label="Clickable">
        <Switch value={sub.clickable ?? false} onChange={(e) => setSub({ clickable: e.currentTarget.checked })} />
      </Field>

      {sub.clickable && (
        <RenderLinkSettings
          type="subelement"
          thiselement={thiselement}
          subIndex={subIndex}
          subelement={sub}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      <Field label="Add text window">
        <Switch value={sub.addText ?? false} onChange={(e) => setSub({ addText: e.currentTarget.checked })} />
      </Field>

      {sub.addText && (
        <RenderTextWindowSettings
          type="subelement"
          thiselement={thiselement}
          subIndex={subIndex}
          subelement={sub}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      )}

      <Field>
        <Button
          variant="destructive"
          icon="trash-alt"
          onClick={() => {
            const next = [...(thiselement.subelements || [])];
            next.splice(subIndex, 1);
            updateField(value, thiselement, onChange, "subelements", next);
          }}
        >
          Delete subelement
        </Button>
      </Field>
    </CollapsElement>
  );
}
