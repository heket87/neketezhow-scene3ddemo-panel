import React from "react";
import { DoubleSide, FrontSide } from "three";

export default function ElementMaterial({
  el,
  elcolor,
}: {
  el: any;
  elcolor: string;
}) {
  const opacity = Number(el.opacity ?? 1);
  const common = {
    opacity,
    transparent: opacity < 1,
    depthWrite: opacity >= 1,
    side: el.double_side ? DoubleSide : FrontSide,
    attach: "material" as const,
  };

  return <meshStandardMaterial {...common} color={elcolor} />;
}
