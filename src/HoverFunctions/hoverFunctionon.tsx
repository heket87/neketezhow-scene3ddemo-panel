import { Box3, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { showHelpInfo } from "../GlobalFunctions/helpWindowState";

type HoverableMesh = Mesh & {
  userData: Record<string, any>;
};

export default function hoverfunctionon(
  hoveredmaterial: MeshStandardMaterial,
  enablehover: boolean,
  helpwindow?: boolean,
  object?: Mesh,
  addtext?: boolean,
  text?: string
) {
  if (object) {
    const mesh = object as HoverableMesh;
    if (enablehover && mesh.material) {
      if (!mesh.userData.__hoverRestoreMaterial) {
        mesh.userData.__hoverRestoreMaterial = mesh.material;
      }

      mesh.material = hoveredmaterial;
    }

    if (helpwindow) {
      const center = new Box3().setFromObject(mesh).getCenter(new Vector3());
      const lines: string[] = [];
      if (text) {lines.push(text);}
      lines.push("name: " + mesh.name);
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox;
      if (bb) {
        lines.push("width X: " + (bb.max.x - bb.min.x).toFixed(3));
        lines.push("height Y: " + (bb.max.y - bb.min.y).toFixed(3));
        lines.push("depth Z: " + (bb.max.z - bb.min.z).toFixed(3));
        lines.push(
          "center: " +
            center.x.toFixed(2) +
            ", " +
            center.y.toFixed(2) +
            ", " +
            center.z.toFixed(2)
        );
      }
      showHelpInfo(lines.join("\n"));
    }

    const htmldiv = document.getElementById(mesh.name + mesh.uuid) as HTMLElement | null;
    if (addtext) {
      if (htmldiv) {
        if (htmldiv.parentElement) {htmldiv.parentElement.style.pointerEvents = "none";}
        if (mesh.visible) {htmldiv.style.visibility = "visible";}
      }
    } else {
      if (htmldiv) {htmldiv.style.visibility = "hidden";}
    }
  }
}
