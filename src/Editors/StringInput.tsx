import React from 'react';

import { Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<string, Settings> {}

export const StringInput = ({ item, value, onChange }: Props) => {
  return (
    <Input
      type="string"
      value={value}
      onChange={e => onChange(e.currentTarget.value)}
      placeholder={item.settings?.placeholder || ''}
    />
  );
};
