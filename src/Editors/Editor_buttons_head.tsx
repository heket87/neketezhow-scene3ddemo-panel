import { Button } from "@grafana/ui";
import React from "react";
import { ElementOptions } from "types";
import { generateUniqueId } from "./generate_id";
import { defaultValuesElement } from "defaultValuesElement";

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneElementWithNewIds(element: ElementOptions): ElementOptions {
  const cloned = deepClone(element);

  const reassignIds = (item: ElementOptions): ElementOptions => {
    const next: ElementOptions = {
      ...item,
      id: generateUniqueId("U2FsdGVkX18n4d9fnfqYO3VfsBk+Xw7Co68qvZcD/KzC3uvtCMpY9Hsx4Q3nxLDh5CTQFuAvDpmZc+yg3akk0g=="),
    };



    return next;
  };

  return reassignIds(cloned);
}

// Delete element
export function handleDeleteElement(
  globalOptions: ElementOptions[],
  elementToDelete: ElementOptions,
  parentElement: ElementOptions | undefined,
  onChange: (val: ElementOptions[]) => void
) {

    const updatedValue = globalOptions.filter((el) => el.id !== elementToDelete.id);
    onChange(updatedValue);
  
}

// Add element / Copy element
export function handleAddElement(
  parentElement: ElementOptions | undefined,
  onChange: (val: ElementOptions[]) => void,
  globalOptions: ElementOptions[],
  copyElement?: ElementOptions
) {
  const source = copyElement
    ? copyElement
    : (defaultValuesElement as ElementOptions);

  const newElement = cloneElementWithNewIds(source);

  // необязательно, но удобно визуально отличать копию
  if (copyElement && newElement.name) {
    newElement.name = `${newElement.name} copy`;
  }


    const updatedValue = [...globalOptions, newElement];
    onChange(updatedValue);
  
}

// Control buttons component
export default function EditorButtonsHead({
  globaloptions,
  element,
  onChange,
  parentElement,
}: {
  globaloptions: ElementOptions[];
  element: ElementOptions;
  onChange: (val: ElementOptions[]) => void;
  parentElement?: ElementOptions;
}) {
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
      <div style={{ flex: 1, textAlign: "left", fontSize: "110%" }}>
        {element.name}
      </div>

      <div style={{ marginLeft: "8px" }}>
        <Button
          aria-label="Delete element"
          title="Delete element"
          icon="trash-alt"
          variant="destructive"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteElement(globaloptions, element, parentElement, onChange);
          }}
        />
      </div>

      <div style={{ marginLeft: "8px" }}>
        <Button 
          aria-label="Copy element"
          title="Copy element"
          icon="copy"
          variant="primary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            handleAddElement(parentElement, onChange, globaloptions, element);
          }}
        />
      </div>
    </div>
  );
}
