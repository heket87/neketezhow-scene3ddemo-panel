import { Button, ComboboxOption, Field, Input, Switch } from "@grafana/ui";
import React from "react";
import { CenterPosition, ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";

import { updateField } from "./BaseEditorFields";

export default function RenderCustomElementSettings({
  thiselement,
  datasources,
  value,
  onChange,
  imageparse
}: {
  thiselement: ElementOptions;
  datasources: ComboboxOption[];
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
  imageparse?: boolean;
}) {
  // Handler for bevel properties


  return (
    <>
      {!imageparse && <CollapsElement label="Extrusion settings" key="extrude-settings">
        <Field label="Extrude along X axis" description="">
          <Switch
            id="extrudex"
            
            defaultChecked={thiselement.extrudex ?? false}
            onChange={(e) => 
              updateField(value, thiselement, onChange, "extrudex", e.currentTarget.checked)
            }
          />
        </Field>
              
        <Field label="Extrude along Y axis" description="">
          <Switch
            id="extrudey"
            defaultChecked={thiselement.extrudey ?? false}
            onChange={(e) => 
              updateField(value, thiselement, onChange, "extrudey", e.currentTarget.checked)
            }
          />
        </Field>
        
        <Field label="Extrude along Z axis" description="">
          <Switch
            id="extrudez"
            defaultChecked={thiselement.extrudez ?? false}
            onChange={(e) => 
              updateField(value, thiselement, onChange, "extrudez", e.currentTarget.checked)
            }
          />
        </Field>
      </CollapsElement>}
                 
      { !imageparse && <CollapsElement label="Point coordinates">
        {(thiselement.points || []).map((point: CenterPosition, zz) => {
          return (
            <Field label={"Point " + (zz + 1)} key={zz}>
              <>
                <Field label="X coordinate">
                  <Input
                    id="pointx"
                    value={point.x || ""}
                    placeholder="0"
                    onChange={(e) => { 
                      const newPoints = [...(thiselement.points || [])];
                      newPoints[zz] = { ...newPoints[zz], x: e.currentTarget.value };
                      updateField(value, thiselement, onChange, "points", newPoints);
                    }}
                  /> 
                </Field>
                
                <Field label="Y coordinate">
                  <Input
                    id="pointy"
                    value={point.y || ""}
                    placeholder="0"
                    onChange={(e) => { 
                      const newPoints = [...(thiselement.points || [])];
                      newPoints[zz] = { ...newPoints[zz], y: e.currentTarget.value };
                      updateField(value, thiselement, onChange, "points", newPoints);
                    }}
                  /> 
                </Field>
                
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <Button
                    aria-label="Move up"
                    title="Move up"
                    icon="arrow-up"
                    variant="secondary"
                    size="md"
                    disabled={zz === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPoints = [...(thiselement.points || [])];
                      [newPoints[zz - 1], newPoints[zz]] = [newPoints[zz], newPoints[zz - 1]];
                      updateField(value, thiselement, onChange, "points", newPoints);
                    }}
                  />
                  
                  <Button
                    aria-label="Move down"
                    title="Move down"
                    icon="arrow-down"
                    variant="secondary"
                    size="md"
                    disabled={zz === (thiselement.points?.length || 0) - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPoints = [...(thiselement.points || [])];
                      [newPoints[zz], newPoints[zz + 1]] = [newPoints[zz + 1], newPoints[zz]];
                      updateField(value, thiselement, onChange, "points", newPoints);
                    }}
                  />
                  
                  <Button
                    aria-label="Delete point"
                    title="Delete point"
                    icon="trash-alt"
                    variant="destructive"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPoints = (thiselement.points || []).filter((_, index) => index !== zz);
                      updateField(value, thiselement, onChange, "points", newPoints);
                    }}
                  />
                </div>
              </>
            </Field>
          );
        })}
        
        <Button
          aria-label="Add point"
          title="Add point"
          icon="plus"
          variant="primary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            const newPoints = [...(thiselement.points || []), { x: "0", y: "0" }];
            updateField(value, thiselement, onChange, "points", newPoints);
          }}
        />
      </CollapsElement>}
      
      <Field label="Bevel Enabled" description="Bevel Enabled">
        <Switch 
          defaultChecked={thiselement.bevel?.bevelEnabled ?? false}
          onChange={(e) => {
            updateField(value, thiselement, onChange, "bevel.bevelEnabled", e.currentTarget.value);
           
          }}
          label="Bevel Enabled"
        />
      </Field>
      
      <CollapsElement label="Settings bevel" key="bevel-settings">
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
      </CollapsElement>
    </>
  );
}
