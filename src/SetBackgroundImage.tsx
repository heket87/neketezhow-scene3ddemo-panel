import React from "react";
import { useThree } from "@react-three/fiber";
import { Texture, TextureLoader } from "three";

export default function Set_Background_image({
  url,
}: {
  url: string;
}) {
  const { scene } = useThree();

  React.useEffect(() => {
    if (!url) {
      scene.background = null;
      return;
    }

    let disposed = false;
    const prevBackground = scene.background;
    const loader = new TextureLoader();

    loader.load(
      url,
      (texture: Texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        scene.background = texture;
      },
      undefined,
      () => {
        if (!disposed) {
          scene.background = null;
        }
      }
    );

    return () => {
      disposed = true;

      if (scene.background && "dispose" in scene.background) {
        (scene.background as Texture).dispose?.();
      }

      scene.background = prevBackground;
    };
  }, [url, scene]);

  return null;
}
