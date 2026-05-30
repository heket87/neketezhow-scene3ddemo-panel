import { ColorPicker, Combobox, ComboboxOption, Field, Input, Switch, TextArea } from "@grafana/ui";
import React from "react";
import { ElementOptions, SubElementOptions } from "types";
import { CollapsElement } from "./Collapsesible";
import { updateField } from "./BaseEditorFields";
import { setSubField } from "./setSubField";

export default function RenderTextWindowSettings({
  type,
  thiselement,
  datasources,
  value,
  onChange,
  subIndex,
  subelement,
}: {
  type: string;
  thiselement: ElementOptions;
  datasources: Array<ComboboxOption<string>>;
  value: ElementOptions[];
  onChange: (val: ElementOptions[]) => void;
  subIndex?: number;
  subelement?: SubElementOptions;
}) {
  const options = [...datasources, { value: "static", label: "static" }];

  const isSubElement =
    type === "subelement" && subelement !== undefined && subIndex !== undefined;

  const textSettings = isSubElement
    ? subelement?.textsettings
    : thiselement.textsettings;

  const visibility = textSettings?.visibility;

  const setTextSettingsField = (path: string, fieldValue: any) => {
    if (isSubElement && subelement !== undefined && subIndex !== undefined) {
      setSubField(
        fieldValue,
        thiselement,
        subelement,
        subIndex,
        value,
        onChange,
        `textsettings.${path}`
      );
    } else {
      updateField(value, thiselement, onChange, `textsettings.${path}`, fieldValue);
    }
  };

  return (
    <CollapsElement label="Text settings" key="text-window-settings">
      <Field
        label="Use global text settings"
        description="Inherit size, color, border and leader settings from the panel-level global text settings"
      >
        <Switch
          value={textSettings?.useGlobalTextSettings !== false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("useGlobalTextSettings", e.currentTarget.checked)
          }
          label="Use global text settings"
        />
      </Field>

      <Field
        label="Element text"
        description="Enter text, to output query field surround it {}, Variables are written as $variablename"
      >
        <TextArea
          value={textSettings?.text || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setTextSettingsField("text", e.currentTarget.value)
          }
          rows={4}
        />
      </Field>

      <Field
        label="Use real visual center for text position"
        description="When enabled, text offsets are calculated from the real rendered center of the object instead of local origin [0,0,0]"
      >
        <Switch
          value={textSettings?.use_real_center_for_text ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("use_real_center_for_text", e.currentTarget.checked)
          }
          label="Use real visual center for text position"
        />
      </Field>

      <Field label="Text X offset relative to object">
        <Input
          value={textSettings?.textpositionx || ""}
          placeholder="0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("textpositionx", e.currentTarget.value)
          }
        />
      </Field>

      <Field label="Text Y offset relative to object">
        <Input
          value={textSettings?.textpositiony || ""}
          placeholder="0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("textpositiony", e.currentTarget.value)
          }
        />
      </Field>

      <Field label="Text Z offset relative to object">
        <Input
          value={textSettings?.textpositionz || ""}
          placeholder="0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("textpositionz", e.currentTarget.value)
          }
        />
      </Field>

      <Field label="Make text window clickable">
        <Switch
          value={textSettings?.text_make_clickable ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField("text_make_clickable", e.currentTarget.checked)
          }
          label="Make text window clickable"
        />
      </Field>

      {textSettings?.text_make_clickable && (
        <>
          <Field label="Link URL" description="Supports {fieldname} and $variable substitution">
            <Input
              placeholder="https://example.com"
              value={textSettings?.text_link ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("text_link", e.currentTarget.value)
              }
            />
          </Field>

          <Field label="Open in current window">
            <Switch
              value={textSettings?.text_open_in_current ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("text_open_in_current", e.currentTarget.checked)
              }
              label="Open in current window"
            />
          </Field>
        </>
      )}

      <Field label="Data field for visibility">
        <Combobox
          options={options}
          value={visibility?.visible_query}
          onChange={(e) =>
            setTextSettingsField("visibility.visible_query", e.value)
          }
        />
      </Field>

      {visibility?.visible_query !== "static" && (
        <>
          <Field label="Visibility condition mode">
            <Combobox
              options={[
                { label: "Numeric comparison", value: "threshold" },
                { label: "Regex", value: "regex" },
              ]}
              value={visibility?.visible_mode ?? "threshold"}
              onChange={(e) =>
                setTextSettingsField("visibility.visible_mode", e.value)
              }
            />
          </Field>

          {(visibility?.visible_mode ?? "threshold") === "threshold" && (
            <>
              <Field label="Hide when value is">
                <Combobox
                  options={[
                    { label: "< (less than)", value: "<" },
                    { label: "<= (less or equal)", value: "<=" },
                    { label: "> (greater than)", value: ">" },
                    { label: ">= (greater or equal)", value: ">=" },
                    { label: "== (equal)", value: "==" },
                    { label: "!= (not equal)", value: "!=" },
                  ]}
                  value={visibility?.visible_threshold_op ?? "<"}
                  onChange={(e) =>
                    setTextSettingsField(
                      "visibility.visible_threshold_op",
                      e.value
                    )
                  }
                />
              </Field>

              <Field label="Threshold value">
                <Input
                  type="number"
                  placeholder="0"
                  value={visibility?.visible_threshold_value ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTextSettingsField(
                      "visibility.visible_threshold_value",
                      e.currentTarget.value
                    )
                  }
                />
              </Field>
            </>
          )}

          {visibility?.visible_mode === "regex" && (
            <Field label="Regex — text hidden when matches">
              <Input
                placeholder="^0$"
                value={visibility?.visible_regex ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTextSettingsField(
                    "visibility.visible_regex",
                    e.currentTarget.value
                  )
                }
              />
            </Field>
          )}
        </>
      )}

      {!isSubElement &&
        visibility?.visible_query === "static" &&
        thiselement.textsettings?.useGlobalTextSettings === false && (
          <Field label="Static text visibility">
            <Switch
              value={visibility?.visible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("visibility.visible", e.currentTarget.checked)
              }
              label="Static text visibility"
            />
          </Field>
        )}

      {isSubElement &&
        visibility?.visible_query === "static" &&
        subelement?.textsettings?.useGlobalTextSettings === false && (
          <Field label="Static text visibility">
            <Switch
              value={visibility?.visible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("visibility.visible", e.currentTarget.checked)
              }
              label="Static text visibility"
            />
          </Field>
        )}

      {!textSettings?.useGlobalTextSettings && (
        <>
          <Field
            label="Show leader line"
            description="Draw a line from the object center to the text window"
          >
            <Switch
              value={textSettings?.leader_line ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("leader_line", e.currentTarget.checked)
              }
              label="Show leader line"
            />
          </Field>

          {textSettings?.leader_line && (
            <>
              <Field
                label="Custom leader line color"
                description="When off, the line color follows the text window background color"
              >
                <Switch
                  value={textSettings?.leader_line_color_custom ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTextSettingsField(
                      "leader_line_color_custom",
                      e.currentTarget.checked
                    )
                  }
                  label="Custom leader line color"
                />
              </Field>

              {textSettings?.leader_line_color_custom && (
                <Field label="Leader line color">
                  <ColorPicker
                    color={textSettings?.leader_line_color ?? "#ffffff"}
                    onChange={(color) =>
                      setTextSettingsField("leader_line_color", color)
                    }
                  />
                </Field>
              )}

              <Field label="Leader line width (px)">
                <Input
                  type="number"
                  placeholder="1"
                  value={textSettings?.leader_line_width ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTextSettingsField("leader_line_width", e.currentTarget.value)
                  }
                />
              </Field>
            </>
          )}
        </>
      )}

      {textSettings?.useGlobalTextSettings === false && (
        <>
          <Field label="Show text statically">
            <Switch
              value={textSettings?.textstatic ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("textstatic", e.currentTarget.checked)
              }
              label="Show text statically"
            />
          </Field>

          {!textSettings.textstatic && (
            <Field label="Show text if data condition match">
              <Switch
                value={textSettings.show_if_condition_match ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTextSettingsField("show_if_condition_match", e.currentTarget.checked)
                }
                label="Show text if data condition match"
              />
            </Field>
          )}

          <Field label="Size (px)">
            <Input
              value={textSettings?.textsize || ""}
              placeholder="14"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("textsize", e.currentTarget.value)
              }
            />
          </Field>

          <Field label="Maximum text window width (px)">
            <Input
              value={textSettings?.textmaxwidth || ""}
              placeholder="200"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("textmaxwidth", e.currentTarget.value)
              }
            />
          </Field>

          <Field label="Text color">
            <ColorPicker
              color={textSettings?.textcolor || ""}
              onChange={(color) => setTextSettingsField("textcolor", color)}
            />
          </Field>

          <Field label="Border color">
            <ColorPicker
              color={textSettings?.bordersfortextcolor || ""}
              onChange={(color) =>
                setTextSettingsField("bordersfortextcolor", color)
              }
            />
          </Field>

          <Field label="Border thickness (px)">
            <Input
              value={textSettings?.bordersfortextwidth || ""}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField("bordersfortextwidth", e.currentTarget.value)
              }
            />
          </Field>
        </>
      )}

      {!textSettings?.backtextcolor_enablequery &&
        !textSettings?.useGlobalTextSettings && (
          <Field label="Text window background color">
            <ColorPicker
              color={textSettings?.backtextcolor || ""}
              onChange={(color) =>
                setTextSettingsField("backtextcolor", color)
              }
            />
          </Field>
        )}

      <Field label="Use data for background color">
        <Switch
          value={textSettings?.backtextcolor_enablequery ?? false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextSettingsField(
              "backtextcolor_enablequery",
              e.currentTarget.checked
            )
          }
          label="Use data for background color"
        />
      </Field>

      {textSettings?.backtextcolor_enablequery && (
        <>
          <Field
            label="Data source for background color"
            description="Select data field for background color (threshold/gradient)"
          >
            <Combobox
              value={textSettings?.backtextcolorquery || ""}
              options={datasources}
              onChange={(e: ComboboxOption<string>) =>
                setTextSettingsField("backtextcolorquery", e.value)
              }
            />
          </Field>

          <Field label="Use gradient for background color">
            <Switch
              value={textSettings?.backtextcolor_usegradient ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTextSettingsField(
                  "backtextcolor_usegradient",
                  e.currentTarget.checked
                )
              }
              label="Use gradient for background color"
            />
          </Field>

          {textSettings?.backtextcolor_usegradient && (
            <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "8px" }}>
              Uses the panel-level gradient.
            </div>
          )}
        </>
      )}
    </CollapsElement>
  );
}
