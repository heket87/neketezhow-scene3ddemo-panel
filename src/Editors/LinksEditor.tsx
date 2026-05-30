import { StandardEditorProps } from "@grafana/data";
import { Button, Field, Input, Switch } from "@grafana/ui";
import React from "react";
import { LinksOptions } from "types";
import { CollapsElement } from "./Collapsesible";

interface LinksProps extends StandardEditorProps<LinksOptions[]> {}

export const LinksDefaultValue: LinksOptions = {
  name: "Link",
  link: "https://google.com",
  open_in_current: false,
};

const updateLinksField = (
  links: LinksOptions[],
  linkIndex: number,
  onChange: (val: LinksOptions[]) => void,
  updates: Partial<LinksOptions>
) => {
  const updatedLinks = links.map((item, index) =>
    index === linkIndex ? { ...item, ...updates } : item
  );
  onChange(updatedLinks);
};

export const LinksEditor: React.FC<LinksProps> = ({
  value = [],
  onChange,
  
}) => {
  return (
    <>
      {value.map((link: LinksOptions, index: number) => (
        <CollapsElement
          key={index}
          label={
            <div style={{ width: "100%" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "84%",
                  textAlign: "left",
                  fontSize: "110%",
                }}
              >
                {link.name}
              </div>

              <div
                style={{
                  display: "inline-block",
                  width: "5%",
                  marginLeft: "3%",
                }}
              >
                <Button
                  aria-label="Delete link"
                  title="Delete link"
                  icon="trash-alt"
                  variant="destructive"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((_, i) => i !== index));
                  }}
                />
              </div>

              <div
                style={{
                  display: "inline-block",
                  width: "5%",
                  marginLeft: "2%",
                }}
              >
                <Button
                  aria-label="Copy link"
                  title="Copy link"
                  icon="copy"
                  variant="primary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    const copy = { ...link };
                    const newLinks = [...value];
                    newLinks.splice(index + 1, 0, copy);
                    onChange(newLinks);
                  }}
                />
              </div>
            </div>
          }
        >
          <Field label="Link name">
            <Input
              value={link.name}
              onChange={(e) =>
                updateLinksField(value, index, onChange, {
                  name: e.currentTarget.value,
                })
              }
              placeholder="Link name"
            />
          </Field>

          <Field label="Link URL">
            <Input
              value={link.link}
              onChange={(e) =>
                updateLinksField(value, index, onChange, {
                  link: e.currentTarget.value,
                })
              }
              placeholder="Link URL"
            />
          </Field>

          <Field label="Open in current window">
            <Switch
              checked={link.open_in_current}
              onChange={(e) =>
                updateLinksField(value, index, onChange, {
                  open_in_current: e.currentTarget.checked,
                })
              }
            />
          </Field>

          <Field>
            <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
              <Button
                aria-label="Move up"
                title="Move up"
                icon="arrow-up"
                variant="secondary"
                size="md"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (index === 0) {
                    return;
                  }

                  const newLinks = [...value];
                  [newLinks[index - 1], newLinks[index]] = [
                    newLinks[index],
                    newLinks[index - 1],
                  ];
                  onChange(newLinks);
                }}
              />

              <Button
                aria-label="Move down"
                title="Move down"
                icon="arrow-down"
                variant="secondary"
                size="md"
                disabled={index === value.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (index === value.length - 1) {
                    return;
                  }

                  const newLinks = [...value];
                  [newLinks[index], newLinks[index + 1]] = [
                    newLinks[index + 1],
                    newLinks[index],
                  ];
                  onChange(newLinks);
                }}
              />

              <Button
                aria-label="Delete link"
                title="Delete link"
                icon="trash-alt"
                variant="destructive"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((_, i) => i !== index));
                }}
              />
            </div>
          </Field>
        </CollapsElement>
      ))}

      <Field>
        <Button
          aria-label="Add link"
          variant="secondary"
          icon="plus"
          size="sm"
          onClick={() => {
            const newLink = { ...LinksDefaultValue };
            onChange([...value, newLink]);
          }}
        >
          Add Link
        </Button>
      </Field>
    </>
  );
};
