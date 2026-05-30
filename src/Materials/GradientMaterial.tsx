import { Color, DataTexture, RGBAFormat } from "three";
import { HslColor } from "react-colorful";
import { GradientPoint } from "types";

type GradientParams = {
  lowValue?: number;
  highValue?: number;
  saturation?: number;
  lightness?: number;
  lowColor?: HslColor;
  highColor?: HslColor;
  gradientStep?: number;
  scaleX?: number;
  scaleY?: number;

  krigingRange?: number;
  krigingNugget?: number;
  krigingSill?: number;
  gradientype?: string;
  rbfFunction?: string;
  rbfEpsilon?: number;
  rbfSmooth?: number;
};

type HslLike = {
  h: number;
  s: number;
  l: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function interpolateGradientHsl(
  value: number,
  lowValue: number,
  highValue: number,
  lowColor: HslLike,
  highColor: HslLike,
  overrides?: {
    saturation?: number;
    lightness?: number;
    gradientStep?: number;
  }
): HslLike {
  const range = highValue - lowValue || 1;

  let t = clamp((value - lowValue) / range, 0, 1);

  const step = overrides?.gradientStep;
  if (step !== undefined && step > 0 && step <= 1) {
    t = Math.round(t / step) * step;
    t = clamp(t, 0, 1);
  }

  const hStart = lowColor.h;
  const hEnd = highColor.h;
  const hueDistance = (hStart - hEnd + 360) % 360;
  const h = (hStart - t * hueDistance + 360) % 360;

  const sRaw = lowColor.s + (highColor.s - lowColor.s) * t;
  const lRaw = lowColor.l + (highColor.l - lowColor.l) * t;

  const s = overrides?.saturation !== undefined ? overrides.saturation : sRaw;
  const l = overrides?.lightness !== undefined ? overrides.lightness : lRaw;

  return { h, s, l };
}

export const createGradientTexture = (
  points: GradientPoint[],
  width: number,
  height: number,
  params: GradientParams = {}
): DataTexture => {
  if (!points || points.length === 0) {
    const texture = new DataTexture(
      new Uint8Array([0, 0, 0, 255]),
      1,
      1,
      RGBAFormat
    );
    texture.needsUpdate = true;
    return texture;
  }

  const safeWidth = Math.max(1, Math.floor(width || 1));
  const safeHeight = Math.max(1, Math.floor(height || 1));

  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
  const dataValues = points.map((p) => p.data);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const naturalWidth = maxX - minX;
  const naturalHeight = maxY - minY;

  const planeWidth =
    params.scaleX !== undefined ? params.scaleX : naturalWidth || 1;
  const planeHeight =
    params.scaleY !== undefined ? params.scaleY : naturalHeight || 1;

  const minData =
    params.lowValue !== undefined ? params.lowValue : Math.min(...dataValues);
  const maxData =
    params.highValue !== undefined ? params.highValue : Math.max(...dataValues);

  const lowHSL = params.lowColor ?? { h: 240, s: 100, l: 50 };
  const highHSL = params.highColor ?? { h: 0, s: 100, l: 50 };

  const textureData = new Uint8Array(safeWidth * safeHeight * 4);

  const getColor = (value: number): Color => {
    const { h, s, l } = interpolateGradientHsl(
      value,
      minData,
      maxData,
      lowHSL,
      highHSL,
      {
        saturation: params.saturation,
        lightness: params.lightness,
        gradientStep: params.gradientStep,
      }
    );

    const color = new Color();
    color.setHSL(h / 360, s / 100, l / 100);
    return color;
  };

  const interpolateValueIDW = (x: number, y: number): number => {
    let totalWeight = 0;
    let valueSum = 0;

    for (const point of points) {
      const dx = point.x - x;
      const dy = point.y - y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < 0.0001) {
        return point.data;
      }

      const weight = 1 / distanceSq;
      totalWeight += weight;
      valueSum += weight * point.data;
    }

    if (totalWeight === 0) {
      return points[0]?.data ?? minData;
    }

    return valueSum / totalWeight;
  };

  const calculateCovarianceMatrix = (
    sourcePoints: GradientPoint[],
    range: number,
    sill: number,
    nugget: number
  ) => {
    const n = sourcePoints.length;
    const matrix: number[][] = Array.from({ length: n }, () =>
      Array(n).fill(0)
    );

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const dx = sourcePoints[i].x - sourcePoints[j].x;
        const dy = sourcePoints[i].y - sourcePoints[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let covariance = nugget;
        if (distance > 0) {
          covariance = sill * Math.exp(-distance / range);
        } else {
          covariance = sill + nugget;
        }

        matrix[i][j] = covariance;
        matrix[j][i] = covariance;
      }
    }

    return matrix;
  };

  const solveKrigingWeights = (
    covMatrix: number[][],
    targetCov: number[]
  ) => {
    const n = covMatrix.length;
    const matrix: number[][] = [];
    const vector: number[] = [...targetCov, 1];

    for (let i = 0; i < n; i++) {
      matrix[i] = [...covMatrix[i], 1];
    }
    matrix[n] = Array(n).fill(1).concat(0);

    for (let i = 0; i <= n; i++) {
      let maxRow = i;
      for (let j = i + 1; j <= n; j++) {
        if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = j;
        }
      }

      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [vector[i], vector[maxRow]] = [vector[maxRow], vector[i]];

      const pivot = matrix[i][i] || 1e-12;

      for (let j = i; j <= n; j++) {
        matrix[i][j] /= pivot;
      }
      vector[i] /= pivot;

      for (let j = i + 1; j <= n; j++) {
        const factor = matrix[j][i];
        for (let k = i; k <= n; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
        vector[j] -= factor * vector[i];
      }
    }

    const weights: number[] = Array(n + 1).fill(0);
    for (let i = n; i >= 0; i--) {
      weights[i] = vector[i];
      for (let j = i + 1; j <= n; j++) {
        weights[i] -= matrix[i][j] * weights[j];
      }
    }

    return weights.slice(0, n);
  };

  const krigeValue = (
    x: number,
    y: number,
    sourcePoints: GradientPoint[],
    covMatrix: number[][],
    range: number,
    sill: number
  ) => {
    const targetCov: number[] = [];

    for (const point of sourcePoints) {
      const dx = point.x - x;
      const dy = point.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      targetCov.push(sill * Math.exp(-distance / range));
    }

    const weights = solveKrigingWeights(covMatrix, targetCov);
    const result = sourcePoints.reduce(
      (sum, point, i) => sum + point.data * weights[i],
      0
    );

    return clamp(result, minData, maxData);
  };

  const buildDelaunayTriangulation = (sourcePoints: GradientPoint[]) => {
    const triangles: Array<[number, number, number]> = [];

    for (let i = 0; i < sourcePoints.length; i++) {
      for (let j = i + 1; j < sourcePoints.length; j++) {
        for (let k = j + 1; k < sourcePoints.length; k++) {
          const p1 = sourcePoints[i];
          const p2 = sourcePoints[j];
          const p3 = sourcePoints[k];

          let valid = true;

          for (let m = 0; m < sourcePoints.length; m++) {
            if (m === i || m === j || m === k) {continue;}

            const p = sourcePoints[m];

            const ax = p1.x - p.x;
            const ay = p1.y - p.y;
            const bx = p2.x - p.x;
            const by = p2.y - p.y;
            const cx = p3.x - p.x;
            const cy = p3.y - p.y;

            const ab = ax * by - ay * bx;
            const bc = bx * cy - by * cx;
            const ca = cx * ay - cy * ax;

            if (
              (ab >= 0 && bc >= 0 && ca >= 0) ||
              (ab <= 0 && bc <= 0 && ca <= 0)
            ) {
              valid = false;
              break;
            }
          }

          if (valid) {
            triangles.push([i, j, k]);
          }
        }
      }
    }

    return triangles;
  };

  const interpolateSpline = (
    x: number,
    y: number,
    sourcePoints: GradientPoint[],
    triangles: Array<[number, number, number]>
  ) => {
    for (const tri of triangles) {
      const [i1, i2, i3] = tri;
      const p1 = sourcePoints[i1];
      const p2 = sourcePoints[i2];
      const p3 = sourcePoints[i3];

      const denom =
        (p2.y - p3.y) * (p1.x - p3.x) +
        (p3.x - p2.x) * (p1.y - p3.y);

      if (Math.abs(denom) < 1e-8) {continue;}

      const w1 =
        ((p2.y - p3.y) * (x - p3.x) + (p3.x - p2.x) * (y - p3.y)) / denom;
      const w2 =
        ((p3.y - p1.y) * (x - p3.x) + (p1.x - p3.x) * (y - p3.y)) / denom;
      const w3 = 1 - w1 - w2;

      if (w1 >= 0 && w2 >= 0 && w3 >= 0) {
        return w1 * p1.data + w2 * p2.data + w3 * p3.data;
      }
    }

    let minDist = Infinity;
    let closestValue = sourcePoints[0]?.data ?? minData;

    for (const point of sourcePoints) {
      const dx = point.x - x;
      const dy = point.y - y;
      const dist = dx * dx + dy * dy;

      if (dist < minDist) {
        minDist = dist;
        closestValue = point.data;
      }
    }

    return closestValue;
  };

  const solveLinearSystem = (A: number[][], b: number[]) => {
    const n = A.length;
    const matrix = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = j;
        }
      }

      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

      const pivot = matrix[i][i] || 1e-12;
      for (let j = i; j <= n; j++) {
        matrix[i][j] /= pivot;
      }

      for (let j = i + 1; j < n; j++) {
        const factor = matrix[j][i];
        for (let k = i; k <= n; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
      }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = matrix[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= matrix[i][j] * x[j];
      }
    }

    return x;
  };

  const solveRBF = (
    sourcePoints: GradientPoint[],
    type = "multiquadric",
    epsilon = 1.0,
    smooth = 0.0
  ) => {
    const n = sourcePoints.length;
    const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const b = sourcePoints.map((p) => p.data);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const dx = sourcePoints[i].x - sourcePoints[j].x;
        const dy = sourcePoints[i].y - sourcePoints[j].y;
        const r = Math.sqrt(dx * dx + dy * dy);

        switch (type) {
          case "gaussian":
            A[i][j] = Math.exp(-((epsilon * r) ** 2));
            break;
          case "linear":
            A[i][j] = r;
            break;
          case "thinplate":
            A[i][j] = r > 0 ? r * r * Math.log(r) : 0;
            break;
          case "multiquadric":
          default:
            A[i][j] = Math.sqrt(1 + (epsilon * r) ** 2);
            break;
        }

        if (i === j && smooth > 0) {
          A[i][j] += smooth;
        }
      }
    }

    return solveLinearSystem(A, b);
  };

  const interpolateRBF = (
    x: number,
    y: number,
    sourcePoints: GradientPoint[],
    lambda: number[],
    type = "multiquadric",
    epsilon = 1.0
  ) => {
    let result = 0;

    for (let i = 0; i < sourcePoints.length; i++) {
      const dx = x - sourcePoints[i].x;
      const dy = y - sourcePoints[i].y;
      const r = Math.sqrt(dx * dx + dy * dy);

      let basis = 0;
      switch (type) {
        case "gaussian":
          basis = Math.exp(-((epsilon * r) ** 2));
          break;
        case "linear":
          basis = r;
          break;
        case "thinplate":
          basis = r > 0 ? r * r * Math.log(r) : 0;
          break;
        case "multiquadric":
        default:
          basis = Math.sqrt(1 + (epsilon * r) ** 2);
          break;
      }

      result += lambda[i] * basis;
    }

    return clamp(result, minData, maxData);
  };

  let krigingData:
    | {
        covMatrix: number[][];
        range: number;
        sill: number;
        nugget: number;
      }
    | null = null;

  let splineData:
    | {
        triangles: Array<[number, number, number]>;
      }
    | null = null;

  let rbfData:
    | {
        lambda: number[];
        type: string;
        epsilon: number;
      }
    | null = null;

  if (params.gradientype === "kriging" && points.length > 0) {
    const range = params.krigingRange || Math.max(planeWidth, planeHeight) * 0.2 || 1;
    const nugget = params.krigingNugget || 0.1;
    const sill = params.krigingSill || (maxData - minData) * 0.8 || 1.0;

    krigingData = {
      covMatrix: calculateCovarianceMatrix(points, range, sill, nugget),
      range,
      sill,
      nugget,
    };
  }

  if (
    (params.gradientype === "splain" || params.gradientype === "spline") &&
    points.length >= 3
  ) {
    splineData = {
      triangles: buildDelaunayTriangulation(points),
    };
  }

  if (params.gradientype === "RBF" && points.length > 0) {
    const rbfType = params.rbfFunction || "multiquadric";
    const epsilon = params.rbfEpsilon || 1.0;
    const smooth = params.rbfSmooth || 0.01;

    rbfData = {
      lambda: solveRBF(points, rbfType, epsilon, smooth),
      type: rbfType,
      epsilon,
    };
  }

  for (let iy = 0; iy < safeHeight; iy++) {
    for (let ix = 0; ix < safeWidth; ix++) {
      const worldX =
        minX + (ix / Math.max(1, safeWidth - 1)) * planeWidth;
      const worldY =
        minY + (iy / Math.max(1, safeHeight - 1)) * planeHeight;

      let value: number;

      if (params.gradientype === "RBF" && rbfData) {
        value = interpolateRBF(
          worldX,
          worldY,
          points,
          rbfData.lambda,
          rbfData.type,
          rbfData.epsilon
        );
      } else if (
        (params.gradientype === "splain" || params.gradientype === "spline") &&
        splineData
      ) {
        value = interpolateSpline(worldX, worldY, points, splineData.triangles);
      } else if (params.gradientype === "kriging" && krigingData) {
        value = krigeValue(
          worldX,
          worldY,
          points,
          krigingData.covMatrix,
          krigingData.range,
          krigingData.sill
        );
      } else {
        value = interpolateValueIDW(worldX, worldY);
      }

      const color = getColor(value);

      const idx = (iy * safeWidth + ix) * 4;
      textureData[idx] = Math.floor(color.r * 255);
      textureData[idx + 1] = Math.floor(color.g * 255);
      textureData[idx + 2] = Math.floor(color.b * 255);
      textureData[idx + 3] = 255;
    }
  }

  const texture = new DataTexture(textureData, safeWidth, safeHeight, RGBAFormat);
  texture.needsUpdate = true;
  return texture;
};
