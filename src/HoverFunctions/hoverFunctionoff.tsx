import { MeshStandardMaterial } from "three";
import { hideHelpInfo } from "../GlobalFunctions/helpWindowState";

type HoverMaterialSource = Record<string, any> | null | undefined;

type HoverObject = {
  material?: any;
  userData?: Record<string, any>;
} | null | undefined;

function getSourceMaterial(source?: HoverMaterialSource) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return "material" in source ? (source as any).material : undefined;
}

export default function hoverfunctionoff(
  changecolor?: boolean,
  helpwindow?: boolean,
  object?: HoverObject,
  materials?: HoverMaterialSource,
  color?: string,
  usequery?: boolean,
) {
  if (helpwindow) {
    hideHelpInfo();
  }

  if (!object) {
    return;
  }

  const storedRestoreMaterial = object.userData?.__hoverRestoreMaterial;
  const sourceMaterial = storedRestoreMaterial ?? getSourceMaterial(materials);

  if (color !== "defaultcolor" && color !== undefined && changecolor && !usequery) {
    const coloredmaterial = new MeshStandardMaterial({ color });
    if (sourceMaterial?.map) {
      coloredmaterial.map = sourceMaterial.map;
    }
    object.material = coloredmaterial;
  } else {
    object.material = sourceMaterial;
  }

  if (object.userData && "__hoverRestoreMaterial" in object.userData) {
    delete object.userData.__hoverRestoreMaterial;
  }
}
