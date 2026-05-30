




import {ElementOptions} from 'types';

import {  Button,  ComboboxOption,  Field,   } from '@grafana/ui';
import {  FieldType, StandardEditorProps } from '@grafana/data';
import React from 'react';
import { CollapsElement } from 'Editors/Collapsesible';












import BindButton from './BindButton';

import BaseEditorFields from './BaseEditorFields';
import { defaultValuesElement } from 'defaultValuesElement';
import EditorButtonsHead from './Editor_buttons_head';
import { generateUniqueId } from './generate_id';
import ElementExtraEditors from './ElementExtraEditors';
import { buildDatasourceValue, getFieldLabel } from 'GlobalFunctions/dataKeyResolver';
//import FlowsEditor from './FlowsEditor';





//import subelementsfields from 'editorsubsfields';

//import {  useGLTF } from '@react-three/drei';

    export const optionstypes = [{label: 'cube', value: 'cube'}, {label: 'plane', value: 'plane'}, {label: 'sphere', value: 'sphere'},
      {label: 'load gltf/glb', value: 'load gltf/glb'},
       {label: 'grid', value: 'grid'},
      {label: 'text3d', value: 'text3d'}, {label: 'text2d', value: 'text2d'},
      {label: 'Custom Element', value: 'Custom Element'}, {label: 'Line3D', value: 'Line3D'},
    ]
// {label: 'Flow', value: 'Flow'} flow experimental
interface Settings {
  placeholder: string;
}
interface EditorProps extends StandardEditorProps<ElementOptions[], Settings> {}
export const ElementsEditor: React.FC<EditorProps> = ({ value,  onChange, context }: {value: ElementOptions[], 
  onChange: any, context: any
}) => {


   
   


  const datasources: Array<ComboboxOption<string>> = [];

  

  if (context.data) {
    const seen = new Set<string>();
  
    for (const frame of context.data) {
      if (!frame) {continue;}
  
      for (const field of frame.fields) {
        if (field.type === FieldType.time) {continue;}
  
        const value = buildDatasourceValue(frame, field);
        const label = getFieldLabel(frame, field);
  
        if (!seen.has(value)) {
          seen.add(value);
          datasources.push({
            label,
            value,
          });
        }
      }
    }
  }

   


  
  
  

  
  
  
  
    

    return (
  
      <React.Fragment>
  
        
        {value.map((b: ElementOptions, i: number) => (
          
          <CollapsElement
            key={i}
            label={

            <EditorButtonsHead 
              globaloptions={value}
              element={b}
              onChange={onChange}
              // For root elements do not pass parentElement
            />
              
            }
            
          >
  
            
            
  
              <BindButton b={b} value={value} onChange={onChange}></BindButton>
            <BaseEditorFields datasources={datasources} optionstypes={optionstypes} value={value} thiselement={b} onChange={onChange} />
          
           

            




          



                       

            
          

                     







            <pre style={{whiteSpace:'pre-wrap', border:"0px solid Black"}}>

            </pre>
           
            <ElementExtraEditors
              value={value}
              thiselement={b}
              datasources={datasources}
              onChange={onChange}
            />
            <Field>
              <>
                <Button
                  icon="trash-alt"
                  variant="destructive"
                  onClick={() => onChange([...value.slice(0, i), ...value.slice(i + 1)])}
                >
                  Delete element
                </Button>

  
    
              </>
            </Field>
  
  
          
  
  
          </CollapsElement>
          
          
        ))}
      
  
        <Field>
          <Button
            variant="secondary"
            icon="plus"
            size="sm"
            onClick={() => {
              let newElement = {...defaultValuesElement}
              newElement.id = generateUniqueId("U2FsdGVkX18n4d9fnfqYO3VfsBk+Xw7Co68qvZcD/KzC3uvtCMpY9Hsx4Q3nxLDh5CTQFuAvDpmZc+yg3akk0g==")

              onChange([...value, newElement]);
            }}
          >
            Add element
          </Button>
  
        </Field>
  
      </React.Fragment>
    );
  };
