import React from 'react';

import { Combobox,  } from '@grafana/ui';




interface SelectProps {
    onChange: (value: string) => void;
    value: string;
  }
export const SelectEditor = ({  value, onChange }: SelectProps) => {
    const options =   [
        {value: 'percentage', label: 'percentage' },
        {value: 'basic', label: 'basic' },
        {value: 'soft', label: 'soft' },
        {value: 'variance', label: 'variance' },
       
        
       ]
  return (
    <Combobox
      value={value}
      onChange={e => onChange(e.value)}
      options={options}
    />
  );
};
