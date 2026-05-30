import React from "react";
import { Edges } from "@react-three/drei";
import TextWindow from "./textwindow";
import { FieldConfigSource, PanelData } from "@grafana/data";
import { ElementOptions, Options } from "../types";

export function renderTextWindow({
  el,
  replaceVariables,
  data,
  fieldConfig,
  hovered,
  globaloptions,
  subelement = false,
  textPos,
  meshCenter,
}: {
  el: any;
  replaceVariables: any;
  data: PanelData;
  fieldConfig: FieldConfigSource<any>;
  hovered: boolean;
  globaloptions: Options;
  subelement?: boolean;
  textPos?: [number, number, number];
  meshCenter?: [number, number, number];
}) {
  if (!el.addText) {return null;}

  return (
    <TextWindow
      subelement={subelement}
      el={el}
      replaceVariables={replaceVariables}
      data={data}
      fieldConfig={fieldConfig}
      hovered={hovered}
      globaloptions={globaloptions}
      textPos={textPos}
      meshCenter={meshCenter}
    />
  );
}

export function renderClickHandler(el: ElementOptions, replaceVariables: any) {
  return (e: any) => {
    e.stopPropagation();
    if (!el.make_clikable) {return;}

    if (el.open_in_current) {
      window.open(replaceVariables(el.link), "_self", "noopener,noreferrer");
    } else {
      window.open(replaceVariables(el.link), "_blank", "noopener,noreferrer");
    }
  };
}

export function renderHoverHandlers({
  el,
  setHovered,
  showHelpInfo,
  hideHelpInfo,
}: {
  el: ElementOptions;
  setHovered: React.Dispatch<React.SetStateAction<boolean>>;
  showHelpInfo: (text: string) => void;
  hideHelpInfo: () => void;
}) {
  return {
    onPointerOver: (e: any) => {
      e.stopPropagation();
      setHovered(true);

      if (el.helpwindow) {
        const lines: string[] = [];
        if (el.textsettings?.text) {lines.push(String(el.textsettings?.text));}
        lines.push("name: " + el.name);
        showHelpInfo(lines.join("\n"));
      }
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      if (el.helpwindow) {hideHelpInfo();}
      setHovered(false);
    },
  };
}

export function renderGeometry(el: ElementOptions, radius?: number) {
  if (el.type === "cube") {
    return <boxGeometry attach="geometry" args={[1, 1, 1]} />;
  }
  if (el.type === "plane") {
    return <planeGeometry attach="geometry" args={[1, 1]} />;
  }
  if (el.type === "sphere") {
    return (
      <sphereGeometry
        attach="geometry"
        args={[
          Number(radius),
          Number(el.segmentswidth),
          Number(el.segmentsheight),
        ]}
      />
    );
  }
  return null;
}

export function renderEdges(el: ElementOptions) {
  if (!el.bordersforelement) {return null;}
  return (
    <Edges
      linewidth={Number(el.bordersforelementwidth)}
      threshold={15}
      color={el.bordersforelementcolor}
    />
  );
}
