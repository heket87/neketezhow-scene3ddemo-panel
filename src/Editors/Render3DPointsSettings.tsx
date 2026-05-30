import { Field, Input } from "@grafana/ui";
import { CenterPosition3d, ElementOptions } from "types";
import { updateField } from "./BaseEditorFields";

import React from "react";
export default function Render3DPointsSettings({
    thiselement,
    value,
    onChange,
    zz,
    point
  }: {
    thiselement: ElementOptions;
    value: ElementOptions[];
    onChange: (val: ElementOptions[]) => void;
    zz: number;
    point: CenterPosition3d
  }) {
return (

    <>
    <Field label="X">
      <Input
        id="pointx"
        value={point.x || ""}
        placeholder="0"
        onChange={(e) => { 
          const newPoints = [...(thiselement.points3d || [])];
          newPoints[zz] = { ...newPoints[zz], x: e.currentTarget.value };
          updateField(value, thiselement, onChange, "points3d", newPoints);
        }}
      /> 
    </Field>
    
    <Field label="Y">
      <Input
        id="pointy"
        value={point.y || ""}
        placeholder="0"
        onChange={(e) => { 
          const newPoints = [...(thiselement.points3d || [])];
          newPoints[zz] = { ...newPoints[zz], y: e.currentTarget.value };
          updateField(value, thiselement, onChange, "points3d", newPoints);
        }}
      /> 
    </Field>

    <Field label="Z">
      <Input
        id="pointz"
        value={point.z || ""}
        placeholder="0"
        onChange={(e) => { 
          const newPoints = [...(thiselement.points3d || [])];
          newPoints[zz] = { ...newPoints[zz], z: e.currentTarget.value };
          updateField(value, thiselement, onChange, "points3d", newPoints);
        }}
      /> 
    </Field>
    </>
)}
