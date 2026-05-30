import React from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Mesh, Vector3 } from "three";
import { FieldConfigSource, PanelData } from "@grafana/data";

import create_text from "../create_text";
import { ElementOptions, Options, TransformMode } from "../types";
import Mytransforms from "./Transform";
import Visibility from "./Data_driven_visibility";
import ElementMaterial from "./ElementMaterial";
import {
  renderClickHandler,
  renderGeometry,
  renderHoverHandlers,
  renderTextWindow,
  renderEdges,
} from "./elementRenderHelpers";
import { showHelpInfo, hideHelpInfo } from "../GlobalFunctions/helpWindowState";
import {
  createPositionDependencySignature,
  isElementPositionReferenceReady,
  resolveElementLocalPosition,
  resolveElementWorldPosition,
  usePositionReferenceRegistryVersion,
} from "GlobalFunctions/positionReferenceHelpers";

type ResolvedLinePoint = { x: number; y: number; z: number };

function to3DNumber(value: unknown): number {
  return Number(String(value ?? "").replace(",", "."));
}

function getLineElementKey(element: ElementOptions, index: number): string {
  const item = element as ElementOptions & {
    id?: string | number;
    uid?: string | number;
    elementid?: string | number;
    name?: string;
    label?: string;
  };

  return String(item.id ?? item.uid ?? item.elementid ?? item.name ?? item.label ?? `${element.type}-${index}`);
}

function buildCustomShape(points?: { x: string; y: string }[]) {
  if (!points?.length) {
    return null;
  }

  const shape = new THREE.Shape();
  points.forEach((point, index) => {
    const x = to3DNumber(point.x);
    const y = to3DNumber(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export default function LoadBaseElement({
  el,
  data,
  elcolor,
  replaceVariables,
  fieldConfig,
  globaloptions,
  settriggerelement,
  allElements = [],
  onHoverStart,
  onHoverEnd,
}: {
  el: ElementOptions;
  data: PanelData;
  elcolor: string;
  replaceVariables: any;
  fieldConfig: FieldConfigSource<any>;
  globaloptions: Options;
  settriggerelement: React.Dispatch<React.SetStateAction<ElementOptions | undefined>>;
  allElements?: ElementOptions[];
  onHoverStart?: (e?: any) => void;
  onHoverEnd?: (e?: any) => void;
}) {
  const [mode, setMode] = React.useState<TransformMode>("translate");
  const [hovered, setHovered] = React.useState(false);

  const groupref = React.useRef<THREE.Group | null>(null);
  const cuberef = React.useRef<Mesh | null>(null);

  const sceneElements = React.useMemo<ElementOptions[]>(() => {
    if (Array.isArray(allElements) && allElements.length > 0) {
      return allElements;
    }
    const maybeGlobalElements = (globaloptions as Options & { elements?: ElementOptions[] }).elements;
    return Array.isArray(maybeGlobalElements) ? maybeGlobalElements : [];
  }, [allElements, globaloptions]);

  const positionRegistryVersion = usePositionReferenceRegistryVersion();
  const sceneElementsSignature = React.useMemo(() => createPositionDependencySignature(sceneElements), [sceneElements]);

  const elementPosition = React.useMemo<[number, number, number]>(() => {
    void sceneElementsSignature;
    void positionRegistryVersion;
    return resolveElementLocalPosition(el, sceneElements);
  }, [el, sceneElements, sceneElementsSignature, positionRegistryVersion]);

  const positionReferenceReady = React.useMemo(() => {
    void positionRegistryVersion;
    return isElementPositionReferenceReady(el);
  }, [el, positionRegistryVersion]);

  const elementRotation = React.useMemo<[number, number, number]>(
    () => [
      THREE.MathUtils.degToRad(Number(el.rotationx) || 0),
      THREE.MathUtils.degToRad(Number(el.rotationy) || 0),
      THREE.MathUtils.degToRad(Number(el.rotationz) || 0),
    ],
    [el.rotationx, el.rotationy, el.rotationz]
  );

  const elementScale = React.useMemo<[number, number, number]>(
    () => [Number(el.elementsizeX) || 1, Number(el.elementsizeY) || 1, Number(el.elementsizeZ) || 1],
    [el.elementsizeX, el.elementsizeY, el.elementsizeZ]
  );

  const customGeometry = React.useMemo(() => {
    if (el.type !== "Custom Element") {
      return null;
    }
    return buildCustomShape(el.points);
  }, [el.type, el.points]);

  React.useEffect(() => () => customGeometry?.dispose(), [customGeometry]);

  const rawLinePoints = React.useMemo<ResolvedLinePoint[]>(() => {
    void sceneElementsSignature;
    void positionRegistryVersion;

    if (el.type !== "Line3D") {
      return [];
    }

    const useManualPoints = el.line3d_set_points_manually ?? true;
    if (useManualPoints) {
      return (el.points3d || [])
        .map((p) => ({ x: to3DNumber(p.x), y: to3DNumber(p.y), z: to3DNumber(p.z) }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
    }

    const lineOriginTuple = resolveElementWorldPosition(el, sceneElements);
    const linkedElements = Array.isArray(el.line3d_connected_elements) ? el.line3d_connected_elements : [];

    return linkedElements
      .map((linkedPoint) => {
        const linkedElement = sceneElements.find(
          (item, index) => getLineElementKey(item, index) === linkedPoint.elementId || String(item.id) === String(linkedPoint.elementId)
        );
        if (!linkedElement) {
          return null;
        }
        const linkedPositionTuple = resolveElementWorldPosition(linkedElement, sceneElements);
        return {
          x: linkedPositionTuple[0] - lineOriginTuple[0],
          y: linkedPositionTuple[1] - lineOriginTuple[1],
          z: linkedPositionTuple[2] - lineOriginTuple[2],
        };
      })
      .filter((p): p is ResolvedLinePoint => p !== null);
  }, [el, sceneElements, sceneElementsSignature, positionRegistryVersion]);

  const lineMeshCenter = React.useMemo<[number, number, number] | undefined>(() => {
    if (el.type !== "Line3D" || rawLinePoints.length === 0) {
      return undefined;
    }

    const bounds = rawLinePoints.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        minY: Math.min(acc.minY, point.y),
        minZ: Math.min(acc.minZ, point.z),
        maxX: Math.max(acc.maxX, point.x),
        maxY: Math.max(acc.maxY, point.y),
        maxZ: Math.max(acc.maxZ, point.z),
      }),
      {
        minX: rawLinePoints[0].x,
        minY: rawLinePoints[0].y,
        minZ: rawLinePoints[0].z,
        maxX: rawLinePoints[0].x,
        maxY: rawLinePoints[0].y,
        maxZ: rawLinePoints[0].z,
      }
    );

    return [
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    ];
  }, [el.type, rawLinePoints]);

  const lineTextPosition = React.useMemo<[number, number, number] | undefined>(() => {
    if (!lineMeshCenter) {
      return undefined;
    }

    return [
      lineMeshCenter[0] + to3DNumber(el.textsettings?.textpositionx),
      lineMeshCenter[1] + to3DNumber(el.textsettings?.textpositiony),
      lineMeshCenter[2] + to3DNumber(el.textsettings?.textpositionz),
    ];
  }, [
    lineMeshCenter,
    el.textsettings?.textpositionx,
    el.textsettings?.textpositiony,
    el.textsettings?.textpositionz,
  ]);

  const tubeGeometry = React.useMemo(() => {
    if (el.type !== "Line3D" || rawLinePoints.length < 2) {
      return null;
    }

    const pts = rawLinePoints.map((p) => new Vector3(p.x, p.y, p.z));
    const radius = Number(el.line3d_radius) > 0 ? Number(el.line3d_radius) : 0.1;
    const radialSegments = Math.max(3, Number(el.line3d_radial_segments) || 8);
    const closed = Boolean(el.line3d_closed);

    if (el.line3d_smooth) {
      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts, closed),
        Math.max(1, Number(el.line3d_tube_segments) || 64),
        radius,
        radialSegments,
        closed
      );
    }

    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) {
      path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    }
    if (closed && pts.length > 2) {
      path.add(new THREE.LineCurve3(pts[pts.length - 1], pts[0]));
    }
    return new THREE.TubeGeometry(path, Math.max(1, Number(el.line3d_tube_segments) || 64), radius, radialSegments, false);
  }, [el.type, el.line3d_radius, el.line3d_radial_segments, el.line3d_closed, el.line3d_smooth, el.line3d_tube_segments, rawLinePoints]);

  React.useEffect(() => () => tubeGeometry?.dispose(), [tubeGeometry]);

  const elementvisibility = Boolean(Visibility(false, data, "element", el, false, globaloptions.globaltext));
  const effectiveElementVisibility = elementvisibility && positionReferenceReady;

  const hoverHandlers = React.useMemo(() => {
    const base = renderHoverHandlers({ el, setHovered, showHelpInfo, hideHelpInfo });
    return {
      onPointerOver: (e: any) => {
        base.onPointerOver(e);
        onHoverStart?.(e);
      },
      onPointerOut: (e: any) => {
        base.onPointerOut(e);
        onHoverEnd?.(e);
      },
    };
  }, [el, onHoverStart, onHoverEnd]);

  const clickHandler = React.useMemo(() => renderClickHandler(el, replaceVariables), [el, replaceVariables]);

  const text = React.useMemo(
    () => create_text(el.textsettings?.text || el.name || "Text", replaceVariables, data, fieldConfig),
    [el.textsettings?.text, el.name, replaceVariables, data, fieldConfig]
  );

  const commonMeshProps = {
    ref: cuberef,
    onClick: clickHandler,
    onDoubleClick: () => settriggerelement(el),
    ...hoverHandlers,
  };

  const content = (() => {
    if (el.type === "text2d" || el.type === "text3d") {
      return (
        <Text
          {...hoverHandlers}
          onClick={clickHandler}
          onDoubleClick={() => settriggerelement(el)}
          fontSize={Number(el.fontsize) || 1}
          color={elcolor}
          anchorX="center"
          anchorY="middle"
          maxWidth={Number(el.text_of_element_width) || undefined}
        >
          {text}
        </Text>
      );
    }

    if (el.type === "Line3D" && tubeGeometry) {
      return (
        <mesh {...commonMeshProps} geometry={tubeGeometry}>
          <ElementMaterial el={el} elcolor={elcolor} />
          {renderEdges(el)}
        </mesh>
      );
    }

    return (
      <mesh {...commonMeshProps}>
        {el.type === "Custom Element" && customGeometry ? <primitive object={customGeometry} attach="geometry" /> : renderGeometry(el, Number(el.radiuis) || 1)}
        <ElementMaterial el={el} elcolor={elcolor} />
        {renderEdges(el)}
      </mesh>
    );
  })();

  if (!effectiveElementVisibility) {
    return null;
  }

  return (
    <Mytransforms
      visible={Boolean(globaloptions.add_pivot_controls && el.enablecenter)}
      mode={mode}
      setMode={setMode}
      el={el}
      groupref={groupref}
      size={Number(globaloptions.controlsize) || 1}
    >
      <group ref={groupref} position={elementPosition} rotation={elementRotation} scale={elementScale}>
        {content}
        {el.addText && renderTextWindow({
          el,
          replaceVariables,
          data,
          fieldConfig,
          hovered,
          globaloptions,
          textPos: lineTextPosition,
          meshCenter: lineMeshCenter,
        })}
      </group>
    </Mytransforms>
  );
}
