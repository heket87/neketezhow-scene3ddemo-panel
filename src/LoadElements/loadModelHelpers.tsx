import { Box3, Color, DoubleSide, Mesh, MeshLambertMaterial, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";
import { FieldConfigSource } from "@grafana/data";
import { SubElementOptions } from "types";
import { getColorFromData } from "GlobalFunctions/getColorFromData";

export type HoverOffColor = string | undefined;
const ORIGINAL_COLOR_KEY = "__scene3dOriginalColor";
const ORIGINAL_MAP_KEY = "__scene3dOriginalMap";
const modelCache = new Map<string, Promise<Object3D>>();

function normalizeHoverOffColor(value: unknown): HoverOffColor {
  if (value === "defaultcolor") {return "defaultcolor";}
  if (value === undefined || value === null || value === "") {return undefined;}

  try {
    const color = new Color(String(value));
    return `#${color.getHexString()}`;
  } catch {
    return undefined;
  }
}

export function getSubelementHoverOffColor({
  sub,
  data,
  fieldConfig,
}: {
  sub: SubElementOptions;
  data: any;
  fieldConfig: FieldConfigSource<any>;
}): HoverOffColor {
  if (sub.enablecolorquery) {
    const queryColor = getColorFromData(String(sub.value ?? ""), data, fieldConfig, "defaultcolor");
    return normalizeHoverOffColor(queryColor) ?? "defaultcolor";
  }

  return normalizeHoverOffColor(sub.value ?? sub.color) ?? "defaultcolor";
}

export function getObjectCenterInWorldSpace(object: Object3D): [number, number, number] | null {
  object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(object);
  if (box.isEmpty()) {return null;}
  const worldCenter = new Vector3();
  box.getCenter(worldCenter);
  return [worldCenter.x, worldCenter.y, worldCenter.z];
}

export function getObjectBounds(object: Object3D) {
  object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(object);
  const size = new Vector3(1, 1, 1);
  const center = new Vector3(0, 0, 0);
  if (!box.isEmpty()) {
    box.getSize(size);
    box.getCenter(center);
  }
  return { size, center };
}

export async function loadObject3DModel(url: string) {
  const cached = modelCache.get(url);
  if (cached) {
    return cached;
  }

  const loader = new GLTFLoader();
  const loadPromise = loader.loadAsync(url).then((gltf) => gltf.scene);
  modelCache.set(url, loadPromise);

  try {
    return await loadPromise;
  } catch (error) {
    modelCache.delete(url);
    throw error;
  }
}

export function cloneModelMaterials(root: Object3D) {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {return;}

    if (Array.isArray(child.material)) {
      child.material = child.material.map((mat) => (mat?.clone ? mat.clone() : mat));
    } else if (child.material?.clone) {
      child.material = child.material.clone();
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => {
      if (mat && "color" in mat && mat.color instanceof Color) {
        mat.userData[ORIGINAL_COLOR_KEY] = `#${mat.color.getHexString()}`;
      }
      if (mat && "map" in mat) {
        mat.userData[ORIGINAL_MAP_KEY] = mat.map;
      }
    });
  });
}

function restoreOriginalMaterialColor(mat: MeshLambertMaterial | MeshStandardMaterial) {
  const originalColor = mat.userData?.[ORIGINAL_COLOR_KEY];
  if (typeof originalColor === "string" && "color" in mat) {
    mat.color = new Color(originalColor);
  }
}

function toAmbientResponsiveMaterial(mat: MeshStandardMaterial | MeshLambertMaterial): MeshLambertMaterial {
  if (mat instanceof MeshLambertMaterial) {
    return mat;
  }

  const originalColor = mat.userData?.[ORIGINAL_COLOR_KEY];
  const color = typeof originalColor === "string" ? originalColor : `#${mat.color.getHexString()}`;
  const sourceMap = mat.userData?.[ORIGINAL_MAP_KEY] ?? mat.map;
  const lambert = new MeshLambertMaterial({
    color,
    map: sourceMap ?? null,
    opacity: mat.opacity,
    transparent: mat.transparent,
    side: mat.side,
    alphaMap: mat.alphaMap ?? null,
    vertexColors: mat.vertexColors,
  });

  lambert.name = mat.name;
  lambert.userData = { ...mat.userData };
  return lambert;
}

export function applySubelementSettings({
  root,
  subelements,
  data,
  fieldConfig,
}: {
  root: Object3D;
  subelements?: SubElementOptions[];
  data: any;
  fieldConfig: FieldConfigSource<any>;
}) {
  if (!subelements?.length) {return;}
  const byName = new Map(subelements.map((sub) => [sub.name, sub]));

  root.traverse((child) => {
    if (!(child instanceof Mesh)) {return;}
    const sub = byName.get(child.name);
    if (!sub) {return;}

    const material = child.material as MeshStandardMaterial | MeshLambertMaterial | Array<MeshStandardMaterial | MeshLambertMaterial>;
    const materials = (Array.isArray(material) ? material : [material]).map((mat) => toAmbientResponsiveMaterial(mat));
    child.material = Array.isArray(material) ? materials : materials[0];
    const color = getSubelementHoverOffColor({ sub, data, fieldConfig });
    const opacity = Number(sub.opacity ?? 1);

    child.visible = sub.visibility?.visible ?? true;
    materials.forEach((mat) => {
      if (!mat) {return;}
      if (color && color !== "defaultcolor" && "color" in mat) {
        mat.color = new Color(color);
      } else if ("color" in mat) {
        restoreOriginalMaterialColor(mat);
      }
      mat.opacity = opacity;
      mat.transparent = opacity < 1;
      mat.depthWrite = opacity >= 1;
      mat.side = sub.double_side ? DoubleSide : mat.side;
    });
  });
}
