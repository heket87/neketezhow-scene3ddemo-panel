type HslLike = { h: number; s: number; l: number };

export function interpolateGradientHsl(
  value: number,
  lowValue: number,
  highValue: number,
  lowColor: HslLike,
  highColor: HslLike
) {
  const range = highValue - lowValue || 1;
  const t = Math.max(0, Math.min(1, (value - lowValue) / range));

  const hStart = lowColor.h;
  const hEnd = highColor.h;
  const hueDistance = (hStart - hEnd + 360) % 360;
  const h = (hStart - t * hueDistance + 360) % 360;

  const s = lowColor.s + (highColor.s - lowColor.s) * t;
  const l = lowColor.l + (highColor.l - lowColor.l) * t;

  return { h, s, l };
}
