import React from "react";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { MeshStandardMaterial } from "three";
import { PanelData } from "@grafana/data";

import { ElementOptions, Options } from "types";
import Mytransforms from "./Transform";

export default function LoadGrid({
  el,
  elcolor,
  replaceVariables,
  globaloptions,
}: {
  el: ElementOptions;
  data: PanelData;
  elcolor: string;
  replaceVariables: any;
  globaloptions: Options;
  onHoverStart?: (e?: any) => void;
  onHoverEnd?: (e?: any) => void;
}) {
  const [mode, setMode] = React.useState<any>("translate");
  const groupref = React.useRef<THREE.Group | null>(null);

  const material = React.useMemo(() => {
    return new MeshStandardMaterial({ color: elcolor });
  }, [elcolor]);

  React.useEffect(() => () => material.dispose(), [material]);

  const position: [number, number, number] = [Number(el.elementaxisx) || 0, Number(el.elementaxisy) || 0, Number(el.elementaxisz) || 0];
  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(Number(el.rotationx) || 0),
    THREE.MathUtils.degToRad(Number(el.rotationy) || 0),
    THREE.MathUtils.degToRad(Number(el.rotationz) || 0),
  ];

  void replaceVariables;
  return (
    <Mytransforms
      visible={Boolean(globaloptions.add_pivot_controls && el.enablecenter)}
      mode={mode}
      setMode={setMode}
      el={el}
      groupref={groupref}
      size={Number(globaloptions.controlsize) || 1}
    >
      <group ref={groupref} position={position} rotation={rotation}>
        <mesh material={material}>
          <boxGeometry args={[Number(el.elementsizeX) || 1, Number(el.elementsizeY) || 1, Number(el.elementsizeZ) || 0.02]} />
          {el.bordersforelement && (
            <Edges linewidth={Number(el.bordersforelementwidth)} threshold={15} color={el.bordersforelementcolor} />
          )}
        </mesh>
      </group>
    </Mytransforms>
  );
}
