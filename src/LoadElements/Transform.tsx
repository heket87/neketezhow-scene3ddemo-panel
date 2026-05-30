import React from "react";
import { TransformControls } from "@react-three/drei";
import { ElementOptions } from "types";
import { Group, Object3D, Vector3 } from "three";
import { radToDeg } from "three/src/math/MathUtils";

type TransformPatch = Partial<ElementOptions>;
type TransformMode = "translate" | "rotate" | "scale";

function toSafeString(value: number, fallback = "0") {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return String(Number(value.toFixed(6)));
}

export default function Mytransforms({
  children,
  visible,
  mode,
  setMode,
  el,
  groupref,
  size,
  onTransformChange,
  scaleTargetRef,
  scaleBaseSize,
  scaleBaseCenter,
}: {
  children: React.ReactNode;
  visible: boolean;
  mode: TransformMode;
  setMode: React.Dispatch<React.SetStateAction<TransformMode>>;
  el: ElementOptions;
  groupref: React.MutableRefObject<Group | null>;
  size: number;
  onTransformChange?: (patch: TransformPatch) => void;
  scaleTargetRef?: React.MutableRefObject<Object3D | null>;
  scaleBaseSize?: Vector3;
  scaleBaseCenter?: Vector3;
}) {
  const controlsRef = React.useRef<any>(null);
  const [targetObject, setTargetObject] = React.useState<Object3D | null>(null);

  const applyPatch = React.useCallback(() => {
    const group = groupref.current;
    if (!group) {return;}

    const scaleTarget = scaleTargetRef?.current ?? group;
    const baseSize = scaleBaseSize ?? new Vector3(1, 1, 1);
    const baseCenter = scaleBaseCenter ?? new Vector3(0, 0, 0);

    const patch: TransformPatch = {
      elementaxisx: toSafeString(group.position.x, String(el.elementaxisx ?? 0)),
      elementaxisy: toSafeString(group.position.y, String(el.elementaxisy ?? 0)),
      elementaxisz: toSafeString(group.position.z, String(el.elementaxisz ?? 0)),
      rotationx: toSafeString(radToDeg(group.rotation.x), String(el.rotationx ?? 0)),
      rotationy: toSafeString(radToDeg(group.rotation.y), String(el.rotationy ?? 0)),
      rotationz: toSafeString(radToDeg(group.rotation.z), String(el.rotationz ?? 0)),
    };

    if (mode === "scale" && scaleTarget) {
      const nextSizeX = (baseSize.x || 1) * scaleTarget.scale.x;
      const nextSizeY = (baseSize.y || 1) * scaleTarget.scale.y;
      const nextSizeZ = (baseSize.z || 1) * scaleTarget.scale.z;

      patch.elementsizeX = toSafeString(
        nextSizeX,
        String(el.elementsizeX ?? baseSize.x ?? 1)
      );
      patch.elementsizeY = toSafeString(
        nextSizeY,
        String(el.elementsizeY ?? baseSize.y ?? 1)
      );
      patch.elementsizeZ = toSafeString(
        nextSizeZ,
        String(el.elementsizeZ ?? baseSize.z ?? 1)
      );

      if (el.enablecenter && scaleTarget !== group) {
        scaleTarget.position.set(
          -baseCenter.x * scaleTarget.scale.x,
          -baseCenter.y * scaleTarget.scale.y,
          -baseCenter.z * scaleTarget.scale.z
        );
        scaleTarget.updateMatrix();
        scaleTarget.updateMatrixWorld(true);
      }
    }

    Object.assign(el, patch);
    onTransformChange?.(patch);
  }, [groupref, scaleTargetRef, scaleBaseSize, scaleBaseCenter, mode, el, onTransformChange]);

  React.useLayoutEffect(() => {
    const nextTarget =
      mode === "scale"
        ? scaleTargetRef?.current ?? groupref.current
        : groupref.current;

    setTargetObject((prev) => (prev === nextTarget ? prev : nextTarget ?? null));
  }, [mode, scaleTargetRef, groupref]);

  React.useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {return;}

    const handleMouseUp = () => applyPatch();
    const handleTouchEnd = () => applyPatch();
    const handleObjectChange = () => {
      if (mode === "scale") {
        applyPatch();
      }
    };

    controls.addEventListener("mouseUp", handleMouseUp);
    controls.addEventListener("touchEnd", handleTouchEnd);
    controls.addEventListener("objectChange", handleObjectChange);

    return () => {
      controls.removeEventListener("mouseUp", handleMouseUp);
      controls.removeEventListener("touchEnd", handleTouchEnd);
      controls.removeEventListener("objectChange", handleObjectChange);
    };
  }, [applyPatch, mode, targetObject]);

  return (
    <>
      {children}
      {visible && targetObject && (
        <TransformControls
          ref={controlsRef}
          object={targetObject}
          mode={mode}
          size={size}
          enabled={visible}
        />
      )}
    </>
  );
}
