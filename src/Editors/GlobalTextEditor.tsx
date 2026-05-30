import React from 'react'
import { StandardEditorProps } from '@grafana/data'
import { ColorPicker, Field, Input, Switch } from '@grafana/ui'
import { GlobalTextSettings, Options } from 'types'
import { CollapsElement } from './Collapsesible'

type Props = StandardEditorProps<GlobalTextSettings, unknown, Options>

export const GlobalTextEditor: React.FC<Props> = ({ value, onChange }) => {
  const settings: GlobalTextSettings = value ?? {}

  const set = <K extends keyof GlobalTextSettings>(key: K, val: GlobalTextSettings[K]) => {
    onChange({ ...settings, [key]: val })
  }

  return (
    <CollapsElement label="Global text settings">
      <Field label="Font size (px)">
        <Input
          value={settings.textsize ?? ''}
          placeholder="14"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('textsize', e.currentTarget.value)}
        />
      </Field>

      <Field label="Text color">
        <ColorPicker
          color={settings.textcolor ?? '#ffffff'}
          onChange={(color) => set('textcolor', color)}
        />
      </Field>

      <Field label="Max window width (px)">
        <Input
          value={settings.textmaxwidth ?? ''}
          placeholder="200"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('textmaxwidth', e.currentTarget.value)}
        />
      </Field>

      <Field
        label="Use real visual center for text position"
        description="When enabled, text offsets are calculated from the real rendered center instead of local origin [0,0,0]"
      >
        <Switch
          value={settings.use_real_center_for_text ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set('use_real_center_for_text', e.currentTarget.checked as any)
          }
          label="Use real visual center for text position"
        />
      </Field>

      <Field label="Show text statically (no hover required)">
        <Switch
          value={settings.textstatic ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('textstatic', e.currentTarget.checked)}
          label="Show statically"
        />
      </Field>

      {!settings.textstatic && (
        <Field label="Show text if data condition match">
          <Switch
            value={settings.show_if_condition_match ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('show_if_condition_match', e.currentTarget.checked)}
            label="Show text if data condition match"
          />
        </Field>
      )}

      <Field
        label="Show leader line"
        description="Draw a line from the object center to the text window"
      >
        <Switch
          value={settings?.leader_line ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('leader_line', e.currentTarget.checked)}
          label="Show leader line"
        />
      </Field>

      {settings?.leader_line && (
        <>
          <Field
            label="Custom leader line color"
            description="When off, the line color follows the text window background color"
          >
            <Switch
              value={settings?.leader_line_color_custom ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('leader_line_color_custom', e.currentTarget.checked)}
              label="Custom leader line color"
            />
          </Field>

          {settings?.leader_line_color_custom && (
            <Field label="Leader line color">
              <ColorPicker
                color={settings?.leader_line_color ?? "#ffffff"}
                onChange={(color) => set('leader_line_color', color)}
              />
            </Field>
          )}

          <Field label="Leader line width (px)">
            <Input
              type="number"
              placeholder="1"
              value={settings?.leader_line_width ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('leader_line_width', e.currentTarget.value)}
            />
          </Field>
        </>
      )}

      <Field label="Background color" description="Static fallback — each text window can override with data-driven color">
        <ColorPicker
          color={settings.backtextcolor ?? 'transparent'}
          onChange={(color) => set('backtextcolor', color)}
        />
      </Field>

      <Field label="Border color">
        <ColorPicker
          color={settings.bordersfortextcolor ?? '#ffffff'}
          onChange={(color) => set('bordersfortextcolor', color)}
        />
      </Field>

      <Field label="Border width (px)">
        <Input
          value={settings.bordersfortextwidth ?? ''}
          placeholder="0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('bordersfortextwidth', e.currentTarget.value)}
        />
      </Field>
    </CollapsElement>
  )
}
