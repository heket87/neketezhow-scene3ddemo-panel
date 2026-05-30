import React from "react";
import { Combobox, ComboboxOption, Field, Input, Switch } from "@grafana/ui";
import { CollapsElement } from "./Collapsesible";
import { HslColorPicker } from "react-colorful";

interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface GradientSettings {
  lowvaluegradientcolor?: HslColor;
  highvaluegradientcolor?: HslColor;
  highvalueforgradient?: string | number;
  lowvalueforgradient?: string | number;
  gradienttype?: string;
  krigingRange?: string;
  krigingNugget?: string;
  krigingSill?: string;
  rbfEpsilon?: string;
  rbfSmooth?: string;
  rbfFunction?: string;
  show_legend?: boolean;
  legend_position?: string;
  legend_steps?: string;
  legend_width?: string;
  legend_height?: string;
  legend_title?: string;
}

const gradientoptions: ComboboxOption[] = [
  { label: 'IDW', value: 'IDW' },
  { label: 'kriging', value: 'kriging' },
  { label: 'splain', value: 'splain' },
  { label: 'RBF', value: 'RBF' },
]

const legendPositionOptions: ComboboxOption[] = [
  { label: 'Top left', value: 'top-left' },
  { label: 'Top right', value: 'top-right' },
  { label: 'Bottom left', value: 'bottom-left' },
  { label: 'Bottom right', value: 'bottom-right' },
]

const rbfoptions: ComboboxOption[] = [
  { label: 'linear', value: 'linear' },
  { label: 'gaussian', value: 'gaussian' },
  { label: 'multiquadric', value: 'multiquadric' },
  { label: 'thinplate', value: 'thinplate' },
]

interface Props {
  value: GradientSettings;
  onChange: (newSettings: GradientSettings) => void;
}

export const CommonGradient = ({ value, onChange }: Props) => {
  // Update both colors when one changes
  const updateColors = (updatedColor: HslColor, isLowColor: boolean) => {
    const currentLow = value.lowvaluegradientcolor || { h: 45, s: 100, l: 50 };
    const currentHigh = value.highvaluegradientcolor || { h: 45, s: 100, l: 50 };
    
    onChange({
      ...value,
      lowvaluegradientcolor: {
        h: isLowColor ? updatedColor.h : currentLow.h,
        s: updatedColor.s,
        l: updatedColor.l
      },
      highvaluegradientcolor: {
        h: isLowColor ? currentHigh.h : updatedColor.h,
        s: updatedColor.s,
        l: updatedColor.l
      }
    });
  };

  // Function to update other fields
  const setGradientField = <K extends keyof GradientSettings>(
    field: K,
    newValue: GradientSettings[K]
  ) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <CollapsElement label="Gradient settings">
      <Field label="Lower gradient boundary color">
        <section>
          <HslColorPicker
            color={{
              h: value.lowvaluegradientcolor?.h || 45,
              s: value.lowvaluegradientcolor?.s || 100,
              l: value.lowvaluegradientcolor?.l || 50,
            }}
            onChange={(color) => updateColors(color, true)}
          />
        </section>
      </Field>

      <Field label="Upper gradient boundary color">
        <section>
          <HslColorPicker
            color={{
              h: value.highvaluegradientcolor?.h || 45,
              s: value.highvaluegradientcolor?.s || 100,
              l: value.highvaluegradientcolor?.l || 50,
            }}
            onChange={(color) => updateColors(color, false)}
          />
        </section>
      </Field>

      <Field label="Upper gradient boundary value">
        <Input
          type="number"
          placeholder="0"
          value={value.highvalueforgradient || ""}
          onChange={(e) => 
            setGradientField("highvalueforgradient", e.currentTarget.value)
          }
        />
      </Field>

      <Field label="Lower gradient boundary value">
        <Input
          type="number"
          placeholder="0"
          value={value.lowvalueforgradient || ""}
          onChange={(e) => 
            setGradientField("lowvalueforgradient", e.currentTarget.value)
          }
        />
      </Field>

      <Field label="Gradient type">
        <Combobox
          value={value.gradienttype}
          options={gradientoptions}
          onChange={(e) => setGradientField("gradienttype", e.value)}
        />
      </Field>

      {value.gradienttype === "kriging" && <>
        <Field label="Range for variogram">
          <Input
            value={value.krigingRange || ""}
            onChange={(e) => setGradientField("krigingRange", e.currentTarget.value)}
          />
        </Field>
        <Field label="Nugget effect for variogram">
          <Input
            value={value.krigingNugget || ""}
            onChange={(e) => setGradientField("krigingNugget", e.currentTarget.value)}
          />
        </Field>
        <Field label="Variogram plateau">
          <Input
            value={value.krigingSill || ""}
            onChange={(e) => setGradientField("krigingSill", e.currentTarget.value)}
          />
        </Field>
      </>}

      {value.gradienttype === "RBF" && <>
        <Field label="Shape parameter for RBF">
          <Input
            value={value.rbfEpsilon || ""}
            onChange={(e) => setGradientField("rbfEpsilon", e.currentTarget.value)}
          />
        </Field>
        <Field label="Smoothing parameter">
          <Input
            value={value.rbfSmooth || ""}
            onChange={(e) => setGradientField("rbfSmooth", e.currentTarget.value)}
          />
        </Field>
        <Field label="Basis function type">
          <Combobox
            value={value.rbfFunction}
            options={rbfoptions}
            onChange={(e) => setGradientField("rbfFunction", e.value)}
          />
        </Field>
      </>}

      <Field label="Show legend on scene">
        <Switch
          value={value.show_legend ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGradientField("show_legend", e.currentTarget.checked)
          }
        />
      </Field>

      {value.show_legend && (
        <>
          <Field label="Legend position">
            <Combobox
              value={value.legend_position || 'bottom-right'}
              options={legendPositionOptions}
              onChange={(e) => setGradientField("legend_position", e.value)}
            />
          </Field>
          <Field label="Legend title">
            <Input
              placeholder="e.g. Temperature, °C"
              value={value.legend_title || ''}
              onChange={(e) => setGradientField("legend_title", e.currentTarget.value)}
            />
          </Field>
          <Field label="Legend width (px)">
            <Input
              type="number"
              placeholder="160"
              value={value.legend_width || ''}
              onChange={(e) => setGradientField("legend_width", e.currentTarget.value)}
            />
          </Field>
          <Field label="Legend bar height (px)">
            <Input
              type="number"
              placeholder="14"
              value={value.legend_height || ''}
              onChange={(e) => setGradientField("legend_height", e.currentTarget.value)}
            />
          </Field>
          <Field label="Legend steps (tick count)">
            <Input
              type="number"
              placeholder="5"
              value={value.legend_steps || ''}
              onChange={(e) => setGradientField("legend_steps", e.currentTarget.value)}
            />
          </Field>
        </>
      )}
    </CollapsElement>
  );
};
