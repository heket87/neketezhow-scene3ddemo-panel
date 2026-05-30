import { Field, Input, Button, Switch, ComboboxOption } from "@grafana/ui";
import React from "react";
import { Box3, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";
import { ElementOptions, SubElementOptions } from "types";
import { updateField } from "./BaseEditorFields";
import { CollapsElement } from "./Collapsesible";

async function loadGLTFModel(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

export default function RenderSettings({thiselement, datasources, value, onChange}: {thiselement: ElementOptions, datasources: ComboboxOption[], value: ElementOptions[], onChange: (val: ElementOptions[]) => void}) {
  const [elementsurl, setelementsurl] = React.useState(thiselement.elementurl);

  const handleApplyModel = async () => {
    try {
      const result = await loadGLTFModel(String(elementsurl));
      const scene = result.scene;
      if (scene) {
        const box = new Box3().setFromObject(scene);
        const size = box.getSize(new Vector3());
        updateField(value, thiselement, onChange, {
          type: "load gltf/glb",
          elementurl: elementsurl,
          elementsizeX: String(size.x),
          elementsizeY: String(size.y),
          elementsizeZ: String(size.z),
        });
      }
    } catch (error) {
      console.error("GLTF/GLB model loading failed:", error);
      updateField(value, thiselement, onChange, { elementurl: elementsurl });
    }
  };

  const handleTraverse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const traverseEnabled = e.currentTarget.checked;
    let subelements: SubElementOptions[] = [...(thiselement.subelements || [])];

    if (traverseEnabled && subelements.length === 0) {
      try {
        const result = await loadGLTFModel(String(thiselement.elementurl));
        const scene = result.scene;
        if (scene) {
          scene.traverse((child: any) => {
            if (child.material && child.isMesh) {
              subelements.push({
                name: child.name,
                color: "defaultcolor",
                value: "defaultcolor",
                opacity: child.material.opacity,
                return_to_base_color: false,
              });
            }
          });
        }
      } catch (error) {
        console.error("GLTF/GLB model traversal failed:", error);
      }
    }

    updateField(value, thiselement, onChange, {
      traverse: traverseEnabled,
      subelements,
    });
  };

  return (
    <CollapsElement label="Model settings">
      <Field label="Enter GLTF/GLB URL" description="Only .gltf and .glb models are supported in the demo version">
        <>
          <Input
            id="elementurl"
            value={elementsurl}
            placeholder="https://example.com/model.glb"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setelementsurl(e.currentTarget.value)}
          />
          <Button icon="save" onClick={handleApplyModel}>Apply</Button>
        </>
      </Field>

      <Field label="Enable centering">
        <Switch
          value={thiselement.enablecenter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(value, thiselement, onChange, { enablecenter: e.currentTarget.checked })}
        />
      </Field>

      <Field label="Decompose object" description="Create editable subelements from GLTF/GLB mesh names">
        <Switch defaultChecked={thiselement.traverse} onChange={handleTraverse} label="Decompose object" />
      </Field>

      {thiselement.traverse && (
        <Field label="Highlight elements on hover">
          <Switch
            defaultChecked={thiselement.hover}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(value, thiselement, onChange, { hover: e.currentTarget.checked })}
          />
        </Field>
      )}
    </CollapsElement>
  );
}
