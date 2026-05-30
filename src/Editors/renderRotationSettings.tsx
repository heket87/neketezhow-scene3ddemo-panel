import { ComboboxOption, Field,  Input,   } from "@grafana/ui";

import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";



import { updateField } from "./BaseEditorFields";
 export default function RenderRotationSettings({thiselement,datasources,value, onChange}: {thiselement: ElementOptions,datasources: ComboboxOption[], value: ElementOptions[],  onChange: (val: ElementOptions[]) => void }){
   
    
    return (
      <CollapsElement label="Rotation settings" key="rotation-settings">
     
                   <Field label="Rotation around X axis" description="rotation around X axis">
            <Input
                id={'rotationx'}
                value={thiselement.rotationx}
                placeholder="0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "rotationx", e.currentTarget.value)
    
                    }
              />
            </Field>
            <Field label="Rotation around Y axis" description="rotation around Y axis">
            <Input
                id={'roationy'}
                value={thiselement.rotationy}
                placeholder="0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "rotationy", e.currentTarget.value)
    
                    }
              />
            </Field>
            <Field label="Rotation around Z axis" description="rotation around Z axis">
            <Input
                id={'rotationz'}
                value={thiselement.rotationz}
                placeholder="0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "rotationz", e.currentTarget.value)
    
                    }
              />
            </Field>
          </CollapsElement>
                 

    
    );
  };
