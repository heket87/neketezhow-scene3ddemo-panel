import { Combobox, Field, Input } from "@grafana/ui";
import React from "react";
import { ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";
import { updateField } from "./BaseEditorFields";
import {
  buildPositionReferenceOptions,
  resolveElementWorldPosition,
} from "GlobalFunctions/positionReferenceHelpers";


const positionModeOptions = [
  { label: "Manual coordinates", value: "manual" },
  { label: "Reference existing element / subelement", value: "reference" },
];

export default function RenderPositionSettings({
  thiselement,
  value,
  onChange,
}: {
  thiselement: ElementOptions;
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
}) {
  const referenceMode =
    thiselement.position_mode === "reference" ? "reference" : "manual";

  const referenceOptions = React.useMemo(
    () =>
      buildPositionReferenceOptions(
        value,
        thiselement.id ? String(thiselement.id) : undefined
      ),
    [value, thiselement.id]
  );

  const resolvedWorld = React.useMemo(
    () => resolveElementWorldPosition(thiselement, value),
    [thiselement, value]
  );

  const handleManualAxisChange = (
    axis: "x" | "y" | "z",
    rawValue: string
  ) => {
    const fieldMap = {
      x: "elementaxisx",
      y: "elementaxisy",
      z: "elementaxisz",
    } as const;

    updateField(value, thiselement, onChange, fieldMap[axis], rawValue);
  };

  const handleOffsetChange = (
    axis: "x" | "y" | "z",
    rawValue: string
  ) => {
    const fieldMap = {
      x: "position_offsetx",
      y: "position_offsety",
      z: "position_offsetz",
    } as const;

    updateField(value, thiselement, onChange, fieldMap[axis], rawValue);
  };

  const handleModeChange = (nextMode?: string) => {
    const safeMode = nextMode === "reference" ? "reference" : "manual";

    if (
      safeMode === "reference" &&
      !thiselement.position_reference_target_id &&
      referenceOptions.length > 0
    ) {
      updateField(value, thiselement, onChange, {
        position_mode: safeMode,
        position_reference_target_id: referenceOptions[0].value || "",
      });
      return;
    }

    updateField(value, thiselement, onChange, {
      position_mode: safeMode,
    });
  };

  return (
    <CollapsElement label="Position settings" key="position-settings">
      <Field
        label="Position mode"
        description="Manual coordinates or coordinates from existing element / subelement"
      >
        <Combobox
          value={referenceMode}
          options={positionModeOptions}
          onChange={(option) => handleModeChange(option?.value)}
        />
      </Field>

      {referenceMode === "reference" && (
        <>
          <Field
            label="Reference target"
            description="Choose existing element or model subelement"
          >
            <Combobox
              value={thiselement.position_reference_target_id || ""}
              options={referenceOptions}
              onChange={(option) =>
                updateField(
                  value,
                  thiselement,
                  onChange,
                  "position_reference_target_id",
                  option?.value || ""
                )
              }
            />
          </Field>

          <Field
            label="X offset"
            description="Offset relative to selected reference target"
          >
            <Input
              id="position-offset-x"
              value={thiselement.position_offsetx ?? "0"}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOffsetChange("x", e.currentTarget.value)
              }
            />
          </Field>

          <Field
            label="Y offset"
            description="Offset relative to selected reference target"
          >
            <Input
              id="position-offset-y"
              value={thiselement.position_offsety ?? "0"}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOffsetChange("y", e.currentTarget.value)
              }
            />
          </Field>

          <Field
            label="Z offset"
            description="Offset relative to selected reference target"
          >
            <Input
              id="position-offset-z"
              value={thiselement.position_offsetz ?? "0"}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOffsetChange("z", e.currentTarget.value)
              }
            />
          </Field>

          <Field
            label="Resolved world position"
            description="Preview of calculated coordinates"
          >
            <Input
              disabled
              value={`${resolvedWorld[0].toFixed(3)} ; ${resolvedWorld[1].toFixed(
                3
              )} ; ${resolvedWorld[2].toFixed(3)}`}
            />
          </Field>
        </>
      )}

      {referenceMode !== "reference" && (
        <>
          <Field
            label="X coordinate"
            description="Enter X value"
          >
            <Input
              id="positionx"
              value={thiselement.elementaxisx || ""}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleManualAxisChange("x", e.currentTarget.value)
              }
            />
          </Field>

          <Field
            label="Y coordinate"
            description="Enter Y value"
          >
            <Input
              id="positiony"
              value={thiselement.elementaxisy || ""}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleManualAxisChange("y", e.currentTarget.value)
              }
            />
          </Field>

          <Field
            label="Z coordinate"
            description="Enter Z value"
          >
            <Input
              id="positionz"
              value={thiselement.elementaxisz || ""}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleManualAxisChange("z", e.currentTarget.value)
              }
            />
          </Field>
        </>
      )}
    </CollapsElement>
  );
}
