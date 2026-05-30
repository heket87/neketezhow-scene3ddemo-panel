import { Combobox, ComboboxOption, Field,  Input, Switch,   } from "@grafana/ui";

import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";



import { updateField } from "./BaseEditorFields";
 export default function RenderSizeSettings({thiselement,datasources,value, onChange}: {thiselement: ElementOptions,datasources: ComboboxOption[], value: ElementOptions[],  onChange: (val: ElementOptions[]) => void }){
   
    
    return (
      <CollapsElement label="Size settings" key="size-settings">
        {thiselement.type !== 'text3d' && thiselement.type !== 'grid' && thiselement.type !== "text3d"  && <Field label={ "Use query for size X"} description="Use query for size X"> 
           <>
           <Switch 
         
         defaultChecked={thiselement.useelementsizeXquery ?? false}
         onChange={e => updateField(value, thiselement, onChange, "useelementsizeXquery", e.currentTarget.checked)}
         label='Use query for size X'
       />
           </>
          </Field>}
                {!thiselement.useelementsizeXquery && thiselement.type !== 'text3d' && thiselement.type !== 'grid' && thiselement.type !== "text3d"  && <Field label={ "Size X"} description="Enter X size">
            <Input
                id={'width'}
                value={thiselement.elementsizeX}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeX", e.currentTarget.value)
    
                    }
              />
            </Field>}
            {thiselement.useelementsizeXquery && thiselement.type !== 'text3d' && thiselement.type !== 'grid' && thiselement.type !== "text3d"  && <Field label={ "Select query for size X"} description="Select query for size X">
            <Combobox
                id={'width'}
                value={thiselement.elementsizeX}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "elementsizeX", e.value)
                     
                    }
              />
            </Field>}
            {thiselement.type === 'sphere'  && <Field label={ "Use query for radius"} description="Use query for radius">
            <Switch
                id={'radius'}
                value={thiselement.useelementsradiusquey}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "useelementsradiusquey", e.currentTarget.checked)
                     
                    }
              />
            </Field>}
            {!thiselement.useelementsradiusquey && thiselement.type === 'sphere'  && <Field label={ "Sphere radius"} description="Enter sphere radius">
            <Input
                id={'radius'}
                value={thiselement.radiuis}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "radiuis", e.currentTarget.value)
                     
                    }
              />
            </Field>}
            {thiselement.useelementsradiusquey && thiselement.type === 'sphere'  && <Field label={ "Query sphere radius"} description="Enter sphere radius query">
            <Combobox
                id={'width'}
                value={thiselement.radiuis}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "radiuis", e.value)
                     
                    }
              />
            </Field>}
            {thiselement.type === 'text3d'  && <Field label={ "Use query for font size"} description="Use query for for font size">
            <Switch
                id={'radius'}
                value={thiselement.useelementsizeXquery}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "useelementsizeXquery", e.currentTarget.checked)
                     
                    }
              />
            </Field>}
            {!thiselement.useelementsizeXquery && thiselement.type === 'text3d'  && <Field label={ "Font size"} description="Enter font size">
            <Input
                id={'fontsize'}
                value={thiselement.elementsizeX}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeX", e.currentTarget.value)
    
                    }
              />
            </Field>}
            {thiselement.useelementsizeXquery && thiselement.type === 'text3d'  && <Field label={ "Query font size"} description="Enter font size query">
            <Combobox
                id={'width'}
                value={thiselement.elementsizeX}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "elementsizeX", e.value)
                     
                    }
              />
            </Field>}
            {thiselement.type !== 'grid'  && <Field label={ "Use query for  size Y"} description="Use query for size Y">
            <Switch
                id={'sizeY'}
                value={thiselement.useelementsizeYquey}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "useelementsizeYquey", e.currentTarget.checked)
                     
                    }
              />
            </Field>}
            {thiselement.useelementsizeYquey && thiselement.type !== 'grid' && thiselement.type !=="text3d" && <Field label={ "Query for size Y "} description="Enter query for size Y">
            <Combobox
                id={'width'}
                value={thiselement.elementsizeY}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "elementsizeY", e.value)
                     
                    }
              />
            </Field>}           
            {!thiselement.useelementsizeYquey && thiselement.type !== 'grid'  && thiselement.type !=="text3d" && <Field label={"Size Y"} description="Enter Y size">
            <Input
                id={'length'}
                value={thiselement.elementsizeY}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeY", e.currentTarget.value)
    
                    }
              />
            </Field>}
            {thiselement.type ==="text3d"  && <Field label={ "Use query for  Text depth"} description="Use query for text depth">
            <Switch
                id={'sizeY'}
                value={thiselement.useelementsizeYquey}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "useelementsizeYquey", e.currentTarget.checked)
                     
                    }
              />
            </Field>}
            { !thiselement.useelementsizeYquey && thiselement.type ==="text3d" && <Field label={"Text depth"} description="Enter depth value">
            <Input
                id={'length'}
                value={thiselement.elementsizeY}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeY", e.currentTarget.value)
    
                    }
              />
            </Field>}
            { thiselement.useelementsizeYquey && thiselement.type ==="text3d" && <Field label={"Text depth query"} description="Enter depth query">
            <Combobox
                id={'width'}
                value={thiselement.elementsizeY}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "elementsizeY", e.value)
                     
                    }
              />
            </Field>}
            {thiselement.type === "grid" && <Field label={"Number of cells"} description="Enter length value">
            <Input
                id={'length'}
                value={thiselement.elementsizeY}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeY", e.currentTarget.value)
    
                    }
              />
            </Field>}
            {thiselement.type === "sphere" && <Field label={"Segments width"} description="Segments width">
            <Input
                id={'segementswidth'}
                value={thiselement.segmentswidth}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "segmentswidth", e.currentTarget.value)
    
                    }
              />
            </Field>}
            {thiselement.type === "sphere" && <Field label={"Segments height"} description="Segments height">
            <Input
                id={'segmentsheight'}
                value={thiselement.segmentsheight}
                placeholder="1"
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "segmentsheight", e.currentTarget.value)
    
                    }
              />
            </Field>}
         

            {(thiselement.type !== "grid" && thiselement.type !== "text3d") && <Field label="Use query for size Z" description="Use query for size Z">
              <Switch
                id={'sizeZ'}
                value={thiselement.useelementsizeZquey}
                placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "useelementsizeZquey", e.currentTarget.checked)
                     
                    }
              />
            </Field>}
            
            {(!thiselement.useelementsizeZquey && thiselement.type !== "grid" && thiselement.type !== "text3d") && <Field label="Size Z" description="Enter Z size (depth)">
            <Input
                id={'height'}
                value={thiselement.elementsizeZ}
                placeholder="1"
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "elementsizeZ", e.currentTarget.value)
    
                    }
              />
            </Field>}
            { thiselement.useelementsizeZquey && thiselement.type !== "grid" && thiselement.type !== "text3d"  && <Field label={"Query for size Z "} description="Query for size Z ">
            <Combobox
                id={'height'}
                value={thiselement.elementsizeZ}
                placeholder="1"
                options={datasources}
                    onChange={e => 
                    updateField(value, thiselement, onChange, "elementsizeZ", e.value)
                     
                    }
              />
            </Field>}
            
          </CollapsElement>
                 

    
    );
  };
