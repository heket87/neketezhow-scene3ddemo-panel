import { extend, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Options } from 'types';

extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
    }
  }
}

export const MyMapControls = ({ options }: { options: Options }) => {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controls = React.useRef<OrbitControls | null>(null);

  const firstCamera = options.cameras?.[0];
  const lookAtX = firstCamera?.look_at_x;
  const lookAtY = firstCamera?.look_at_y;
  const lookAtZ = firstCamera?.look_at_z;

  useEffect(() => {
    if (controls.current && firstCamera) {
      controls.current.target.set(
        Number(lookAtX),
        Number(lookAtY),
        Number(lookAtZ)
      );
      controls.current.update();
    }
  }, [firstCamera, lookAtX, lookAtY, lookAtZ]);

  useFrame(() => {
    if (controls.current) {
      controls.current.update();
    }
  });

  return <orbitControls ref={controls} args={[camera, domElement]} />;
};
