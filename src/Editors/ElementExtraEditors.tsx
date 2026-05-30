import React from 'react';
import { ComboboxOption } from '@grafana/ui';
import { ElementOptions, SubElementOptions } from 'types';
import { CollapsElement } from 'Editors/Collapsesible';
import SubElementFields from 'Editors/editorsubsfields';

type ElementExtraEditorsProps = {
  value: ElementOptions[];
  thiselement: ElementOptions;
  datasources: Array<ComboboxOption<string>>;
  onChange: (val: ElementOptions[]) => void;
};

export default function ElementExtraEditors({
  value,
  thiselement,
  datasources,
  onChange,
}: ElementExtraEditorsProps) {
  if (!thiselement.traverse) {
    return null;
  }

  return (
    <CollapsElement label="Subelements">
      {thiselement.subelements?.map((sub: SubElementOptions, j: number) => (
        <SubElementFields
          key={`sub-${thiselement.id}-${j}`}
          thiselement={thiselement}
          sub={sub}
          subIndex={j}
          datasources={datasources}
          value={value}
          onChange={onChange}
        />
      ))}
    </CollapsElement>
  );
}
