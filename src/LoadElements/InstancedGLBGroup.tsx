import React from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  BufferGeometry,
  Euler,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  Object3D,
  SkinnedMesh,
  Vector3,
} from "three";
import { ElementOptions, Options } from "types";
import { PanelData, FieldConfigSource } from "@grafana/data";

import getDatalatest from "../GlobalFunctions/getDatalatest";
import TextWindow from "./textwindow";
import Visibility from "./Data_driven_visibility";
import {
  createPositionDependencySignature,
  isElementPositionReferenceReady,
  resolveElementLocalPosition,
  resolveElementWorldPosition,
  usePositionReferenceRegistryVersion,
} from "GlobalFunctions/positionReferenceHelpers";

interface Props {
  elements: ElementOptions[];
  allElements?: ElementOptions[];
  data: PanelData;
  fieldConfig: FieldConfigSource;
  globaloptions: Options;
  replaceVariables: (s: string) => string;
  positionSpace?: "world" | "local";
}

interface MeshInfo {
  geometry: BufferGeometry;
  material: Material | Material[];
  localMatrix: Matrix4;
}

function toNum(value: unknown, fallback = 0) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function getElementKey(element: ElementOptions, index: number): string {
  const item = element as ElementOptions & {
    id?: string | number;
    uid?: string | number;
    elementid?: string | number;
    name?: string;
  };

  return String(
    item.id ?? item.uid ?? item.elementid ?? item.name ?? `instanced-${index}`
  );
}

function getUseRealCenterForText(el: ElementOptions, globaloptions: Options) {
  const useGlobal = el.textsettings?.useGlobalTextSettings !== false;
  const settings = useGlobal ? globaloptions?.globaltext : el.textsettings;
  return settings?.use_real_center_for_text ?? false;
}

function buildLocalBoundsFromMeshInfos(meshInfos: MeshInfo[]) {
  const box = new Box3();
  let hasData = false;

  for (const info of meshInfos) {
    const geom = info.geometry;
    if (!geom.boundingBox) {
      geom.computeBoundingBox();
    }

    if (!geom.boundingBox) {continue;}

    const transformed = geom.boundingBox.clone().applyMatrix4(info.localMatrix);

    if (!hasData) {
      box.copy(transformed);
      hasData = true;
    } else {
      box.union(transformed);
    }
  }

  if (!hasData) {
    return {
      modelSize: new Vector3(1, 1, 1),
      modelCenter: new Vector3(0, 0, 0),
    };
  }

  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  return {
    modelSize: size,
    modelCenter: center,
  };
}

function getInstanceMeshCenter(
  el: ElementOptions,
  modelCenter: Vector3,
  modelSize: Vector3,
  data: PanelData,
  globaloptions: Options
): [number, number, number] | undefined {
  const useRealCenterForText = getUseRealCenterForText(el, globaloptions);
  if (!useRealCenterForText) {return undefined;}

  const sx =
    toNum(getDatalatest(String(el.elementsizeX), data), 1) / (modelSize.x || 1);
  const sy =
    toNum(getDatalatest(String(el.elementsizeY), data), 1) / (modelSize.y || 1);
  const sz =
    toNum(getDatalatest(String(el.elementsizeZ), data), 1) / (modelSize.z || 1);

  if (el.enablecenter) {
    return [0, 0, 0];
  }

  return [modelCenter.x * sx, modelCenter.y * sy, modelCenter.z * sz];
}

/**
 * Inner component — requires a Suspense boundary from the parent.
 * useGLTF caches the loaded GLTF by URL so geometry/material refs are stable
 * across re-renders, which prevents R3F from constantly recreating the InstancedMesh objects.
 */
function InstancedGLBGroupInner({
  elements,
  allElements = [],
  data,
  fieldConfig,
  globaloptions,
  replaceVariables,
  positionSpace = "world",
}: Props) {
  const url = String(elements[0]?.elementurl ?? "");
  const gltf = useGLTF(url);

  const sceneElements = React.useMemo<ElementOptions[]>(() => {
    if (Array.isArray(allElements) && allElements.length > 0) {
      return allElements;
    }
    return elements;
  }, [allElements, elements]);

  const positionRegistryVersion = usePositionReferenceRegistryVersion();
  const sceneElementsSignature = createPositionDependencySignature(sceneElements);

  const { meshInfos, modelSize, modelCenter } = React.useMemo(() => {
    gltf.scene.updateMatrixWorld(true);

    const rootInverse = gltf.scene.matrixWorld.clone().invert();
    const infos: MeshInfo[] = [];

    gltf.scene.traverse((child) => {
      if (!(child instanceof Mesh) || child instanceof SkinnedMesh) {return;}

      child.updateWorldMatrix(true, false);

      const relativeMatrix = rootInverse.clone().multiply(child.matrixWorld);

      infos.push({
        geometry: child.geometry,
        material: child.material,
        localMatrix: relativeMatrix,
      });
    });

    const bounds = buildLocalBoundsFromMeshInfos(infos);

    return {
      meshInfos: infos,
      modelSize: bounds.modelSize,
      modelCenter: bounds.modelCenter,
    };
  }, [gltf]);

  const count = elements.length;
  const instanceRefs = React.useRef<Array<InstancedMesh | null>>([]);

  const hoverCountersRef = React.useRef<Record<number, number>>({});
  const [hoveredInstance, setHoveredInstance] = React.useState<number | null>(null);

  const handlePointerOver = React.useCallback((e: any) => {
    e?.stopPropagation?.();

    const instanceId = e?.instanceId;
    if (typeof instanceId !== "number") {return;}

    hoverCountersRef.current[instanceId] =
      (hoverCountersRef.current[instanceId] || 0) + 1;

    setHoveredInstance((prev) => (prev === instanceId ? prev : instanceId));
  }, []);

  const handlePointerOut = React.useCallback((e: any) => {
    e?.stopPropagation?.();

    const instanceId = e?.instanceId;
    if (typeof instanceId !== "number") {return;}

    const nextCount = Math.max(
      0,
      (hoverCountersRef.current[instanceId] || 0) - 1
    );

    if (nextCount === 0) {
      delete hoverCountersRef.current[instanceId];
      setHoveredInstance((prev) => (prev === instanceId ? null : prev));
    } else {
      hoverCountersRef.current[instanceId] = nextCount;
    }
  }, []);

  const handlePointerMissed = React.useCallback(() => {
    hoverCountersRef.current = {};
    setHoveredInstance(null);
  }, []);

  React.useEffect(() => {
    hoverCountersRef.current = {};
    setHoveredInstance(null);
  }, [url, count]);

  React.useLayoutEffect(() => {
    const tmpObj = new Object3D();
    const tmpMat = new Matrix4();

    instanceRefs.current.forEach((iMesh, meshIndex) => {
      if (!iMesh || !meshInfos[meshIndex]) {return;}

      const { localMatrix } = meshInfos[meshIndex];

      elements.forEach((el, instanceIndex) => {
        const visible =
          Boolean(Visibility(false, data, "element", el, false, globaloptions.globaltext)) &&
          isElementPositionReferenceReady(el);

        const sx = visible
          ? toNum(getDatalatest(String(el.elementsizeX), data), 1) /
            (modelSize.x || 1)
          : 0;

        const sy = visible
          ? toNum(getDatalatest(String(el.elementsizeY), data), 1) /
            (modelSize.y || 1)
          : 0;

        const sz = visible
          ? toNum(getDatalatest(String(el.elementsizeZ), data), 1) /
            (modelSize.z || 1)
          : 0;

          const resolvedPosition =
          positionSpace === "local"
            ? resolveElementLocalPosition(el, sceneElements)
            : resolveElementWorldPosition(el, sceneElements);

        tmpObj.position.set(
          resolvedPosition[0],
          resolvedPosition[1],
          resolvedPosition[2]
        );

        tmpObj.setRotationFromEuler(
          new Euler(
            (Math.PI * toNum(el.rotationx)) / 180,
            (Math.PI * toNum(el.rotationy)) / 180,
            (Math.PI * toNum(el.rotationz)) / 180
          )
        );

        tmpObj.scale.set(sx, sy, sz);
        tmpObj.updateMatrix();

        if (el.enablecenter) {
          const centerOffset = new Matrix4().makeTranslation(
            -modelCenter.x,
            -modelCenter.y,
            -modelCenter.z
          );

          tmpMat.copy(tmpObj.matrix).multiply(centerOffset).multiply(localMatrix);
        } else {
          tmpMat.copy(tmpObj.matrix).multiply(localMatrix);
        }

        iMesh.setMatrixAt(instanceIndex, tmpMat);
      });

      iMesh.instanceMatrix.needsUpdate = true;
    });
  }, [
    positionSpace,
    elements,
    meshInfos,
    modelSize,
    modelCenter,
    data,
    globaloptions,
    sceneElementsSignature,
    positionRegistryVersion,
    sceneElements,
  ]);

  return (
    <group onPointerMissed={handlePointerMissed}>
      {meshInfos.map((info, idx) => (
        <instancedMesh
          key={`mesh-${idx}`}
          ref={(ref) => {
            instanceRefs.current[idx] = ref as InstancedMesh | null;
          }}
          args={[info.geometry, info.material as any, count]}
          frustumCulled={false}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      ))}

      {elements.map((el, index) => {
        const visible =
          Boolean(Visibility(false, data, "element", el, false, globaloptions.globaltext)) &&
          isElementPositionReferenceReady(el);
        if (!visible || !el.addText) {return null;}

        const resolvedPosition =
        positionSpace === "local"
          ? resolveElementLocalPosition(el, sceneElements)
          : resolveElementWorldPosition(el, sceneElements);

        const meshCenter = getInstanceMeshCenter(
          el,
          modelCenter,
          modelSize,
          data,
          globaloptions
        );

        return (
          <group
            key={`text-${getElementKey(el, index)}`}
            position={resolvedPosition}
            rotation={[
              (toNum(el.rotationx) * Math.PI) / 180,
              (toNum(el.rotationy) * Math.PI) / 180,
              (toNum(el.rotationz) * Math.PI) / 180,
            ]}
          >
            <TextWindow
              subelement={false}
              el={el}
              replaceVariables={replaceVariables}
              data={data}
              fieldConfig={fieldConfig}
              hovered={hoveredInstance === index}
              globaloptions={globaloptions}
              meshCenter={meshCenter}
            />
          </group>
        );
      })}
    </group>
  );
}

/**
 * Renders N instances of the same GLB model as InstancedMesh objects.
 * Memo is left with default shallow compare because aggressive custom compare
 * would block TextWindow/data updates.
 */
export default React.memo(function InstancedGLBGroup(props: Props) {
  return <InstancedGLBGroupInner {...props} />;
});
