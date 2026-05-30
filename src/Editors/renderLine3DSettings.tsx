import { Button, Combobox, ComboboxOption, Field, Input, Switch } from "@grafana/ui";
import React from "react";
import { CenterPosition3d, ElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";
import { updateField } from "./BaseEditorFields";
import Render3DPointsSettings from "./Render3DPointsSettings";
import Points3DButtons from "./Points3DButtons";

type LinePointMeta = {
  data?: string;
  usegradient?: boolean;
  gradientcolor?: any;
};

type Line3DLinkedElement = LinePointMeta & {
  elementId?: string;
};

function getElementKey(element: ElementOptions, index: number): string {
  const item = element as ElementOptions & {
    id?: string | number;
    uid?: string | number;
    elementid?: string | number;
    name?: string;
    label?: string;
  };

  return String(
    item.id ??
      item.uid ??
      item.elementid ??
      item.name ??
      item.label ??
      `${element.type}-${index}`
  );
}

function getElementLabel(element: ElementOptions, index: number): string {
  const item = element as ElementOptions & {
    id?: string | number;
    name?: string;
    label?: string;
    textsettings?: { text?: string };
  };

  return String(
    item.name ??
      item.label ??
      item.textsettings?.text ??
      item.id ??
      `${element.type} ${index + 1}`
  );
}

export default function RenderLine3DSettings({
  thiselement,
  datasources,
  value,
  onChange,
}: {
  thiselement: ElementOptions;
  datasources: ComboboxOption[];
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
}) {
  const radiusOptions = React.useMemo<ComboboxOption[]>(
    () => [...datasources, { label: "static", value: "static" }],
    [datasources]
  );

  const pointsManual = thiselement.line3d_set_points_manually ?? true;
  const linkedElements = (thiselement.line3d_connected_elements ?? []) as Line3DLinkedElement[];

  const elementOptions = React.useMemo<ComboboxOption[]>(
    () =>
      value
        .filter((item) => item !== thiselement)
        .map((item, index) => ({
          label: getElementLabel(item, index),
          value: getElementKey(item, index),
        })),
    [value, thiselement]
  );

  const setLinkedElements = React.useCallback(
    (newItems: Line3DLinkedElement[]) => {
      updateField(value, thiselement, onChange, "line3d_connected_elements", newItems);
    },
    [value, thiselement, onChange]
  );

  const renderPointMetaSettings = <T extends LinePointMeta>(
    items: T[],
    setItems: (next: T[]) => void,
    point: T,
    index: number
  ) => {
    return (
      <>
        <Field label="Data (threshold / gradient color for segment after this point)">
          <Combobox
            options={[{ label: "— none —", value: "" }, ...datasources]}
            value={point.data || ""}
            onChange={(opt) => {
              const newItems = [...items];
              newItems[index] = { ...newItems[index], data: opt?.value ?? "" };
              setItems(newItems);
            }}
          />
        </Field>

        {point.data && (
          <Field label="Use gradient color">
            <Switch
              value={point.usegradient ?? false}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index] = { ...newItems[index], usegradient: e.currentTarget.checked };
                setItems(newItems);
              }}
            />
          </Field>
        )}

        {point.data && point.usegradient && (
          <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "8px" }}>
            Uses the panel-level gradient.
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <CollapsElement label="Line3D settings">
        <Field label="Tube radius query">
          <Combobox
            value={thiselement.line3d_radius_query || "0.1"}
            placeholder="0.1"
            options={radiusOptions}
            onChange={(e) => updateField(value, thiselement, onChange, "line3d_radius_query", e.value)}
          />
        </Field>

        {thiselement.line3d_radius_query === "static" && (
          <Field label="Tube radius">
            <Input
              value={thiselement.line3d_radius || "0.1"}
              placeholder="0.1"
              type="number"
              onChange={(e) => updateField(value, thiselement, onChange, "line3d_radius", e.currentTarget.value)}
            />
          </Field>
        )}

        <Field label="Tubular segments (along path)">
          <Input
            value={thiselement.line3d_tube_segments || "64"}
            placeholder="64"
            type="number"
            onChange={(e) =>
              updateField(value, thiselement, onChange, "line3d_tube_segments", e.currentTarget.value)
            }
          />
        </Field>

        <Field label="Radial segments (around tube)">
          <Input
            value={thiselement.line3d_radial_segments || "8"}
            placeholder="8"
            type="number"
            onChange={(e) =>
              updateField(value, thiselement, onChange, "line3d_radial_segments", e.currentTarget.value)
            }
          />
        </Field>

        <Field label="Smooth curve (CatmullRom)">
          <Switch
            value={thiselement.line3d_smooth ?? false}
            onChange={(e) => updateField(value, thiselement, onChange, "line3d_smooth", e.currentTarget.checked)}
          />
        </Field>

        <Field label="Closed loop">
          <Switch
            value={thiselement.line3d_closed ?? false}
            onChange={(e) => updateField(value, thiselement, onChange, "line3d_closed", e.currentTarget.checked)}
          />
        </Field>

        <Field label="Set points manually">
          <Switch
            value={pointsManual}
            onChange={(e) =>
              updateField(value, thiselement, onChange, "line3d_set_points_manually", e.currentTarget.checked)
            }
          />
        </Field>
      </CollapsElement>

      {pointsManual ? (
        <CollapsElement label="Point coordinates">
          {(thiselement.points3d || []).map((point: CenterPosition3d, zz) => {
            const currentPoints = (thiselement.points3d || []) as Array<CenterPosition3d & LinePointMeta>;

            return (
              <Field label={"Point " + (zz + 1)} key={zz}>
                <>
                  <Render3DPointsSettings
                    thiselement={thiselement}
                    value={value}
                    onChange={onChange}
                    zz={zz}
                    point={point}
                  />

                  {renderPointMetaSettings(
                    currentPoints,
                    (next) => updateField(value, thiselement, onChange, "points3d", next),
                    currentPoints[zz],
                    zz
                  )}

                  <Points3DButtons thiselement={thiselement} zz={zz} value={value} onChange={onChange} />
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
              const newPoints = [...(thiselement.points3d || []), { x: "0", y: "0", z: "0" }];
              updateField(value, thiselement, onChange, "points3d", newPoints);
            }}
          />
        </CollapsElement>
      ) : (
        <CollapsElement label="Connected elements">
          {linkedElements.map((linkedElement, zz) => {
            return (
              <Field label={"Element " + (zz + 1)} key={zz}>
                <>
                  <Field label="Element to connect">
                    <Combobox
                      options={elementOptions}
                      value={linkedElement.elementId || ""}
                      onChange={(opt) => {
                        const newItems = [...linkedElements];
                        newItems[zz] = { ...newItems[zz], elementId: String(opt?.value ?? "") };
                        setLinkedElements(newItems);
                      }}
                    />
                  </Field>

                  {renderPointMetaSettings(linkedElements, setLinkedElements, linkedElement, zz)}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={zz === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (zz === 0) {
                          return;
                        }
                        const newItems = [...linkedElements];
                        [newItems[zz - 1], newItems[zz]] = [newItems[zz], newItems[zz - 1]];
                        setLinkedElements(newItems);
                      }}
                    >
                      Up
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={zz === linkedElements.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (zz === linkedElements.length - 1) {
                          return;
                        }
                        const newItems = [...linkedElements];
                        [newItems[zz + 1], newItems[zz]] = [newItems[zz], newItems[zz + 1]];
                        setLinkedElements(newItems);
                      }}
                    >
                      Down
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkedElements(linkedElements.filter((_, index) => index !== zz));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </>
              </Field>
            );
          })}

          <Button
            aria-label="Add element"
            title="Add element"
            icon="plus"
            variant="primary"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              setLinkedElements([...linkedElements, { elementId: "" }]);
            }}
          />

          {linkedElements.length > 0 && linkedElements.length < 2 && (
            <div style={{ marginTop: 8 }}>Select at least 2 elements to build a line.</div>
          )}
        </CollapsElement>
      )}
    </>
  );
}
