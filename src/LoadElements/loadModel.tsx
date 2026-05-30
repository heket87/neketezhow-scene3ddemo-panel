import React from "react";
import { Box3, Color, Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FieldConfigSource } from "@grafana/data";
import { ElementOptions, Options, TransformMode } from "types";

import Mytransforms from "./Transform";
import TextWindow from "./textwindow";
import LoadinProgress from "./LoadInProgress";
import Errorload from "./ErrorLoad";
import Visibility from "./Data_driven_visibility";
import { renderClickHandler } from "./elementRenderHelpers";
import { applySubelementSettings, cloneModelMaterials, getObjectBounds, loadObject3DModel } from "./loadModelHelpers";
import {
  clearSubelementWorldAnchorsForElement,
  isElementPositionReferenceReady,
  registerSubelementWorldAnchor,
  resolveElementLocalPosition,
} from "GlobalFunctions/positionReferenceHelpers";

function disposeModel(root: Object3D | null) {
  root?.traverse((child) => {
    if (!(child instanceof Mesh)) {return;}
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat?.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}

function samePoint(a?: [number, number, number], b?: [number, number, number], eps = 0.0001) {
  if (!a || !b) {return false;}
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps && Math.abs(a[2] - b[2]) < eps;
}

function getCenterInRootLocalSpace(root: Object3D, target: Object3D): [number, number, number] | undefined {
  root.updateMatrixWorld(true);
  target.updateMatrixWorld(true);
  const box = new Box3().setFromObject(target);
  if (box.isEmpty()) {return undefined;}
  const worldCenter = new Vector3();
  box.getCenter(worldCenter);
  const localCenter = root.worldToLocal(worldCenter.clone());
  return [localCenter.x, localCenter.y, localCenter.z];
}

function getUseRealCenterForText(el: ElementOptions, globaloptions: Options) {
  const useGlobal = el.textsettings?.useGlobalTextSettings !== false;
  const settings = useGlobal ? globaloptions?.globaltext : el.textsettings;
  return settings?.use_real_center_for_text ?? false;
}

export default function Load_Model({
  url,
  el,
  data,
  replaceVariables,
  fieldConfig,
  globaloptions,
  settriggerelement,
  allElements = [],
  onHoverStart,
  onHoverEnd,
}: {
  url: string;
  el: ElementOptions;
  data: any;
  replaceVariables: any;
  fieldConfig: FieldConfigSource<any>;
  globaloptions: Options;
  settriggerelement: React.Dispatch<React.SetStateAction<ElementOptions | undefined>>;
  allElements?: ElementOptions[];
  onHoverStart?: (e?: any) => void;
  onHoverEnd?: (e?: any) => void;
}) {
  const groupref = React.useRef<Group | null>(null);
  const modelref = React.useRef<Group | null>(null);
  const [mode, setMode] = React.useState<TransformMode>("translate");
  const [error, setError] = React.useState<string>("none");
  const [model, setModel] = React.useState<Object3D | null>(null);
  const [modelSize, setModelSize] = React.useState<Vector3>(new Vector3(1, 1, 1));
  const [modelCenter, setModelCenter] = React.useState<Vector3>(new Vector3(0, 0, 0));
  const [hovered, setHovered] = React.useState(false);
  const [realCenter, setRealCenter] = React.useState<[number, number, number] | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    setError("none");
    setModel(null);

    loadObject3DModel(url)
      .then((loaded) => {
        if (cancelled) {return;}
        const cloned = skeletonClone(loaded);
        cloneModelMaterials(cloned);
        const bounds = getObjectBounds(cloned);
        setModelSize(bounds.size);
        setModelCenter(bounds.center);
        setModel((prev) => {
          disposeModel(prev);
          return cloned;
        });
      })
      .catch((err) => setError(String(err)));

    return () => {
      cancelled = true;
    };
  }, [url]);

  React.useEffect(() => () => disposeModel(model), [model]);

  React.useLayoutEffect(() => {
    if (!model) {return;}
    applySubelementSettings({ root: model, subelements: el.subelements, data, fieldConfig });
  }, [model, el.subelements, data, fieldConfig]);

  const sceneElements = React.useMemo<ElementOptions[]>(() => {
    if (Array.isArray(allElements) && allElements.length > 0) {return allElements;}
    const maybeGlobalElements = (globaloptions as Options & { elements?: ElementOptions[] }).elements;
    return Array.isArray(maybeGlobalElements) ? maybeGlobalElements : [];
  }, [allElements, globaloptions]);

  const elementPosition = React.useMemo<[number, number, number]>(() => resolveElementLocalPosition(el, sceneElements), [el, sceneElements]);
  const elementRotation = React.useMemo<[number, number, number]>(
    () => [Number(el.rotationx) * Math.PI / 180 || 0, Number(el.rotationy) * Math.PI / 180 || 0, Number(el.rotationz) * Math.PI / 180 || 0],
    [el.rotationx, el.rotationy, el.rotationz]
  );
  const modelScale = React.useMemo<[number, number, number]>(
    () => [
      (Number(el.elementsizeX) || 1) / (modelSize.x || 1),
      (Number(el.elementsizeY) || 1) / (modelSize.y || 1),
      (Number(el.elementsizeZ) || 1) / (modelSize.z || 1),
    ],
    [el.elementsizeX, el.elementsizeY, el.elementsizeZ, modelSize]
  );
  const modelOffset = React.useMemo<[number, number, number]>(
    () => (el.enablecenter ? [-modelCenter.x, -modelCenter.y, -modelCenter.z] : [0, 0, 0]),
    [el.enablecenter, modelCenter]
  );

  React.useLayoutEffect(() => {
    clearSubelementWorldAnchorsForElement(el.id);
    if (!model) {return;}
    model.updateMatrixWorld(true);
    model.traverse((child) => {
      if (!(child instanceof Mesh) || !child.name) {return;}
      const center = getCenterInRootLocalSpace(model, child);
      if (center) {
        registerSubelementWorldAnchor(el.id, child.name, center);
      }
    });
  }, [el.id, model, modelScale, modelOffset]);

  const useRealCenterForText = getUseRealCenterForText(el, globaloptions);
  React.useLayoutEffect(() => {
    if (!useRealCenterForText || !groupref.current || !modelref.current) {
      setRealCenter(undefined);
      return;
    }
    const next = getCenterInRootLocalSpace(groupref.current, modelref.current);
    if (next) {
      setRealCenter((prev) => (samePoint(prev, next) ? prev : next));
    }
  }, [useRealCenterForText, model, modelScale]);

  const elementVisible = Boolean(Visibility(false, data, "element", el, false, globaloptions.globaltext)) && isElementPositionReferenceReady(el);
  const clickHandler = React.useMemo(() => renderClickHandler(el, replaceVariables), [el, replaceVariables]);

  const pointerHandlers = React.useMemo(() => ({
    onPointerOver: (e: any) => {
      e.stopPropagation();
      setHovered(true);
      onHoverStart?.(e);
      if (el.hover && model) {
        model.traverse((child) => {
          if (!(child instanceof Mesh)) {return;}
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat instanceof MeshStandardMaterial && mat.color) {
              mat.userData.__baseColor = mat.userData.__baseColor || `#${mat.color.getHexString()}`;
              mat.color = new Color(el.hovercolor || "#00FF00");
            }
          });
        });
      }
    },
    onPointerOut: (e: any) => {
      e.stopPropagation();
      setHovered(false);
      onHoverEnd?.(e);
      if (model) {
        model.traverse((child) => {
          if (!(child instanceof Mesh)) {return;}
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat instanceof MeshStandardMaterial && mat.userData.__baseColor) {
              mat.color = new Color(mat.userData.__baseColor);
            }
          });
        });
      }
    },
  }), [el.hover, el.hovercolor, model, onHoverStart, onHoverEnd]);

  if (!elementVisible) {return null;}
  if (error !== "none") {return <Errorload error={error} />;}
  if (!model) {return <LoadinProgress />;}

  return (
    <Mytransforms
      visible={Boolean(globaloptions.add_pivot_controls && el.enablecenter)}
      mode={mode}
      setMode={setMode}
      el={el}
      groupref={groupref}
      size={Number(globaloptions.controlsize) || 1}
      scaleTargetRef={modelref}
      scaleBaseSize={modelSize}
      scaleBaseCenter={modelCenter}
    >
      <group ref={groupref} position={elementPosition} rotation={elementRotation}>
        <group
          ref={modelref}
          position={modelOffset}
          scale={modelScale}
          onClick={clickHandler}
          onDoubleClick={() => settriggerelement(el)}
          {...pointerHandlers}
        >
          <primitive object={model} />
        </group>
        {el.addText && (
          <TextWindow
            subelement={false}
            el={el}
            replaceVariables={replaceVariables}
            data={data}
            fieldConfig={fieldConfig}
            hovered={hovered}
            globaloptions={globaloptions}
            meshCenter={realCenter}
          />
        )}
      </group>
    </Mytransforms>
  );
}
