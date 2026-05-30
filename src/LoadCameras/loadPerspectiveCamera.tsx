import { PerspectiveCamera } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { CameraOptions } from 'types';

export default function LoadPerspectiveCamera({
  cameraId,
  camera,
  replaceVariables,
  registerCamera,
}: {
  cameraId: string;
  camera: CameraOptions;
  replaceVariables: any;
  registerCamera: (id: string, cam: THREE.Camera | null) => void;
}) {
  const cameraref = React.useRef<THREE.PerspectiveCamera | null>(null);

  React.useLayoutEffect(() => {
    const cam = cameraref.current;
    if (!cam) {return;}

    const px = Number(replaceVariables(camera.cameraposx));
    const py = Number(replaceVariables(camera.cameraposy));
    const pz = Number(replaceVariables(camera.cameraposz));

    const lx = Number(replaceVariables(camera.look_at_x));
    const ly = Number(replaceVariables(camera.look_at_y));
    const lz = Number(replaceVariables(camera.look_at_z));

    cam.position.set(px, py, pz);
    cam.near = Number(camera.cameranear);
    cam.far = Number(camera.cameradistance);
    cam.fov = Number(camera.fov);
    cam.aspect = Number(camera.aspect) || cam.aspect;

    cam.lookAt(lx, ly, lz);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }, [camera, replaceVariables]);

  React.useEffect(() => {
    registerCamera(cameraId, cameraref.current);
    return () => registerCamera(cameraId, null);
  }, [cameraId, registerCamera]);

  return (
    <PerspectiveCamera
      ref={cameraref}
      makeDefault
      near={Number(camera.cameranear)}
      far={Number(camera.cameradistance)}
      fov={Number(camera.fov)}
      aspect={Number(camera.aspect)}
      position={[
        Number(replaceVariables(camera.cameraposx)),
        Number(replaceVariables(camera.cameraposy)),
        Number(replaceVariables(camera.cameraposz)),
      ]}
    />
  );
}
