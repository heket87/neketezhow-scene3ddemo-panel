import { Button } from "@grafana/ui";
import React from "react";
import { updateField } from "./BaseEditorFields";
import { ElementOptions } from "types";

export default function Points3DButtons ({thiselement,zz,value,onChange}:
    {thiselement: ElementOptions,zz: number,value: ElementOptions[], onChange: (val: ElementOptions[]) => void}
){
    return (
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
            const newPoints = [...(thiselement.points3d || [])];
            [newPoints[zz - 1], newPoints[zz]] = [newPoints[zz], newPoints[zz - 1]];
            updateField(value, thiselement, onChange, "points3d", newPoints);
          }}
        />
        
        <Button
          aria-label="Move down"
          title="Move down"
          icon="arrow-down"
          variant="secondary"
          size="md"
          disabled={zz === (thiselement.points3d?.length || 0) - 1}
          onClick={(e) => {
            e.stopPropagation();
            const newPoints = [...(thiselement.points3d || [])];
            [newPoints[zz], newPoints[zz + 1]] = [newPoints[zz + 1], newPoints[zz]];
            updateField(value, thiselement, onChange, "points3d", newPoints);
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
            const newPoints = (thiselement.points3d || []).filter((_, index) => index !== zz);
            updateField(value, thiselement, onChange, "points3d", newPoints);
          }}
        />
      </div>
    )
}
