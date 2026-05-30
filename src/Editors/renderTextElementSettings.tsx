import { ComboboxOption, Field,  Input, TextArea, Switch   } from "@grafana/ui";
import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";
import { updateField } from "./BaseEditorFields";

 export default function RenderTextElementSettings({thiselement,datasources,value, onChange}: {thiselement: ElementOptions,datasources: ComboboxOption[], value: ElementOptions[],  onChange: (val: ElementOptions[]) => void }){
   
    
    return (
      <CollapsElement label="Text settings" key="text-settings">
     { thiselement.type ==="text3d" && <Field label={"JSON font URL"} description="Enter JSON font URL">
                 <Input
                     id={'seifurl'}
                     value={thiselement.font}
                     placeholder="https://"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                 updateField(value, thiselement, onChange, "font", e.currentTarget.value)

                }
                   />
                 </Field>}
                 { thiselement.type ==="text2d" && <Field label={"Font"} description="Enter font">
                 <Input
                     id={'serif'}
                     value={thiselement.font}
                     placeholder="Arial"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                 updateField(value, thiselement, onChange, "font", e.currentTarget.value)

                }
                   />
                 </Field>}
                 { thiselement.type ==="text2d" && <Field label={"Alignment"} description="Enter text alignment">
                 <Input
                     id={'Align'}
                     value={thiselement.font_aligh}
                     placeholder="center"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                 updateField(value, thiselement, onChange, "font_aligh", e.currentTarget.value)

                }
                   />
                 </Field>}
                 <Field label={"Element text"} description="Enter text, surround query field with {}, Variables are written as $variablename; Query is written as refid:fieldname">
                 
                 <TextArea
                     id={'text'}
                     value={thiselement?.textsettings?.text}
                     placeholder="https://"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                 updateField(value, thiselement, onChange, "textsettings.text", e.currentTarget.value)

                }
                   />
     
                 </Field>
                <Field label={"Smoothing"} >
                <Input value={thiselement.smooth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "smooth", e.currentTarget.value)
    
                    }
                />
              </Field>
                             <Field label={"Enter line height with px"} >
                               <Input value={thiselement.lineHeight} 
                                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "lineHeight", e.currentTarget.value)
    
                    }
                               ></Input>
     
                             </Field>
                             <Field label={"Enter letter spacing with px"} >
                               <Input value={thiselement.letterSpacing} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "letterSpacing", e.currentTarget.value)
    
                    }
                               />
                               
                             </Field>
     
                             {thiselement.type === 'text2d'  && <Field label={ "Window size"} description="Enter window size with px">
                 <Input
                     id={'widthoftext'}
                     value={thiselement.text_of_element_width}
                     placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "text_of_element_width", e.currentTarget.value)
    
                    }
                   />
                 </Field>}
                                       {thiselement.type === "text2d" &&    <Field label="Size" description="Enter text size with px">
                               <Input
                                   id={'fontsize'}
                                   value={thiselement.fontsize}
                                   placeholder="10"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateField(value, thiselement, onChange, "fontsize", e.currentTarget.value)
    
                    }
                                 />
                               </Field>}
                               <Field label="Bevel Enabled" description="Bevel Enabled">
        <Switch 
          defaultChecked={thiselement.bevel?.bevelEnabled ?? false}
          onChange={(e) => {
            updateField(value, thiselement, onChange, "bevel.bevelEnabled", e.currentTarget.checked);
           
          }}
          label="Bevel Enabled"
        />
      </Field>
                             { thiselement.type === "text3d" && thiselement.bevel?.bevelEnabled && <CollapsElement label="Settings bevel" key="bevel-settings">
       
        <Field label="steps" description="steps">
          <Input
            id="steps"
            value={thiselement.bevel?.steps || ""}
            placeholder="1"
            onChange={(e) => 
              updateField(value, thiselement, onChange, "bevel.steps", e.currentTarget.value)
             
            }
          />
        </Field>
        
        {thiselement.bevel?.bevelEnabled && (
          <>
            <Field label="Bevel Thickness" description="Bevel Thickness">
              <Input
                id="Bevel Thickness"
                value={thiselement.bevel?.bevelThickness || ""}
                placeholder="1"
                onChange={(e) => 
                  updateField(value, thiselement, onChange, "bevel.bevelThickness", e.currentTarget.value)
                }
              />
            </Field>
            
            <Field label="Bevel Size" description="Bevel Size">
              <Input
                id="bevelsize"
                value={thiselement.bevel?.bevelSize || ""}
                placeholder="1"
                onChange={(e) => 
                   updateField(value, thiselement, onChange, "bevel.bevelSize", e.currentTarget.value)
                }
              />
            </Field>
            
            <Field label="bevelOffset" description="bevelOffset">
              <Input
                id="bevelOffset"
                value={thiselement.bevel?.beveloffset || ""}
                placeholder="0"
                onChange={(e) => 
                   updateField(value, thiselement, onChange, "bevel.beveloffset", e.currentTarget.value)
                }
              />
            </Field>
            
            <Field label="bevelsegments" description="bevelsegments">
              <Input
                id="bevelsegments"
                value={thiselement.bevel?.bevelSegments || ""}
                placeholder="1"
                onChange={(e) => 
                  updateField(value, thiselement, onChange, "bevel.bevelSegments", e.currentTarget.value)
                }
              />
            </Field>
          </>
        )}
      </CollapsElement>}
            
          </CollapsElement>
                 

    
    );
  };
