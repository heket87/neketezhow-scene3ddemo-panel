import React from 'react';
import { Combobox, ComboboxOption, Field, Input, Switch } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { AxesHelper, CameraOptions } from 'types';
import { CollapsElement } from 'Editors/Collapsesible';
import { defaultValuesCamera } from 'defaultValuesCamera';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<CameraOptions[], Settings> {}

const createDefaultAxisHelper = (): AxesHelper => ({
  position: 'top-right',
  marginx: '0',
  marginy: '0',
  size: '60',
  points_size: '4',
});

const axisHelperPositions = [
  { label: 'top-left', value: 'top-left' },
  { label: 'top-right', value: 'top-right' },
  { label: 'top-center', value: 'top-center' },
  { label: 'bottom-right', value: 'bottom-right' },
  { label: 'bottom-left', value: 'bottom-left' },
  { label: 'bottom-center', value: 'bottom-center' },
  { label: 'center-right', value: 'center-right' },
  { label: 'center-left', value: 'center-left' },
  { label: 'center-center', value: 'center-center' },
];

const resetButtonPositions = [
  { label: 'Top-left', value: 'top-left' },
  { label: 'Top-right', value: 'top-right' },
  { label: 'Bottom-left', value: 'bottom-left' },
  { label: 'Bottom-right', value: 'bottom-right' },
];

const normalizeCamera = (camera?: Partial<CameraOptions>): CameraOptions => ({
  ...defaultValuesCamera,
  ...(camera ?? {}),
  id: 'perspective-camera',
  name: camera?.name || defaultValuesCamera.name,
  type: 'PerspectiveCamera',
});

const getComboboxValue = (option: ComboboxOption<string> | null | undefined, fallback: string) => {
  return option?.value != null ? String(option.value) : fallback;
};

export const CameraEditor = ({ value, onChange }: Props) => {
  const camera = normalizeCamera(value?.[0]);
  const axisHelperValue = camera.AxesHelper ?? createDefaultAxisHelper();

  const updateCamera = (updates: Partial<CameraOptions>) => {
    onChange([{ ...camera, ...updates, type: 'PerspectiveCamera', id: 'perspective-camera' }]);
  };

  const updateAxisHelper = (updates: Partial<AxesHelper>) => {
    updateCamera({
      AxesHelper: {
        ...axisHelperValue,
        ...updates,
      },
    });
  };

  return (
    <CollapsElement label="Perspective camera">
      <Field label="Camera name">
        <Input
          value={camera.name}
          onChange={(e) => updateCamera({ name: e.currentTarget.value })}
          placeholder="Camera name"
        />
      </Field>

      <Field label="Camera type" description="Demo version supports only one PerspectiveCamera">
        <Input value="PerspectiveCamera" readOnly />
      </Field>

      <Field label="Enable mouse camera controls" description="Enable orbit / pan / zoom">
        <Switch
          value={camera.enablecontrols ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ enablecontrols: e.currentTarget.checked })}
        />
      </Field>

      <CollapsElement label="Camera coordinates">
        <Field label="Camera X coordinate">
          <Input value={camera.cameraposx} onChange={(e) => updateCamera({ cameraposx: e.currentTarget.value })} />
        </Field>
        <Field label="Camera Y coordinate">
          <Input value={camera.cameraposy} onChange={(e) => updateCamera({ cameraposy: e.currentTarget.value })} />
        </Field>
        <Field label="Camera Z coordinate">
          <Input value={camera.cameraposz} onChange={(e) => updateCamera({ cameraposz: e.currentTarget.value })} />
        </Field>
      </CollapsElement>

      <CollapsElement label="Target coordinates">
        <Field label="Target X coordinate">
          <Input value={camera.look_at_x} onChange={(e) => updateCamera({ look_at_x: e.currentTarget.value })} />
        </Field>
        <Field label="Target Y coordinate">
          <Input value={camera.look_at_y} onChange={(e) => updateCamera({ look_at_y: e.currentTarget.value })} />
        </Field>
        <Field label="Target Z coordinate">
          <Input value={camera.look_at_z} onChange={(e) => updateCamera({ look_at_z: e.currentTarget.value })} />
        </Field>
      </CollapsElement>

      <CollapsElement label="Perspective settings">
        <Field label="Camera aspect">
          <Input value={camera.aspect} onChange={(e) => updateCamera({ aspect: e.currentTarget.value })} placeholder="1.77" />
        </Field>
        <Field label="Camera FOV">
          <Input value={camera.fov} onChange={(e) => updateCamera({ fov: e.currentTarget.value })} placeholder="60" />
        </Field>
        <Field label="Camera rendering distance">
          <Input value={camera.cameradistance} onChange={(e) => updateCamera({ cameradistance: e.currentTarget.value })} placeholder="100" />
        </Field>
        <Field label="Camera near distance">
          <Input value={camera.cameranear} onChange={(e) => updateCamera({ cameranear: e.currentTarget.value })} placeholder="0.1" />
        </Field>
      </CollapsElement>

      <Field label="Show camera axis helper">
        <Switch
          value={camera.add_axis_helper ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateCamera({
              add_axis_helper: e.currentTarget.checked,
              AxesHelper: camera.AxesHelper ?? createDefaultAxisHelper(),
            })
          }
        />
      </Field>

      {camera.add_axis_helper && (
        <CollapsElement label="Axis helper settings">
          <Field label="Axis helper position">
            <Combobox
              value={String(axisHelperValue.position ?? 'top-right')}
              options={axisHelperPositions}
              onChange={(e: ComboboxOption<string> | null) =>
                updateAxisHelper({ position: getComboboxValue(e, String(axisHelperValue.position ?? 'top-right')) })
              }
            />
          </Field>
          <Field label="Axis helper size">
            <Input value={axisHelperValue.size ?? ''} onChange={(e) => updateAxisHelper({ size: e.currentTarget.value })} placeholder="60" />
          </Field>
          <Field label="Axis helper points size">
            <Input value={axisHelperValue.points_size ?? ''} onChange={(e) => updateAxisHelper({ points_size: e.currentTarget.value })} placeholder="4" />
          </Field>
          <Field label="Axis helper margin x">
            <Input value={axisHelperValue.marginx ?? ''} onChange={(e) => updateAxisHelper({ marginx: e.currentTarget.value })} placeholder="0" />
          </Field>
          <Field label="Axis helper margin y">
            <Input value={axisHelperValue.marginy ?? ''} onChange={(e) => updateAxisHelper({ marginy: e.currentTarget.value })} placeholder="0" />
          </Field>
        </CollapsElement>
      )}

      <Field label="Show camera reset button">
        <Switch
          value={camera.showresetcamerabutton ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateCamera({
              showresetcamerabutton: e.currentTarget.checked,
              camera_reset_button_position: camera.camera_reset_button_position ?? 'bottom-right',
              camera_reset_button_size: camera.camera_reset_button_size ?? '36',
            })
          }
        />
      </Field>

      {camera.showresetcamerabutton && (
        <CollapsElement label="Camera reset button settings">
          <Field label="Camera reset button position">
            <Combobox
              value={camera.camera_reset_button_position ?? 'bottom-right'}
              options={resetButtonPositions}
              onChange={(e: ComboboxOption<string> | null) =>
                updateCamera({
                  camera_reset_button_position: getComboboxValue(e, camera.camera_reset_button_position ?? 'bottom-right') as
                    | 'top-left'
                    | 'top-right'
                    | 'bottom-left'
                    | 'bottom-right',
                })
              }
            />
          </Field>
          <Field label="Camera reset button size">
            <Input value={camera.camera_reset_button_size ?? ''} onChange={(e) => updateCamera({ camera_reset_button_size: e.currentTarget.value })} placeholder="36" />
          </Field>
        </CollapsElement>
      )}
    </CollapsElement>
  );
};
