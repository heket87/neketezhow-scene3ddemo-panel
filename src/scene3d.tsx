import { PanelProps, PanelData, DataFrame, Field } from '@grafana/data';
import React from 'react';
import * as THREE from 'three';
import {
  Canvas,
  invalidate,
  useThree,
  RootState,
} from '@react-three/fiber';
import {
  Html,
  MapControls,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';

import { AxesHelper, CameraOptions, ElementOptions, Options, ViewBindableCamera } from './types';
import { defaultValuesCamera } from './defaultValuesCamera';

import { getColorFromData } from './GlobalFunctions/getColorFromData';
import Set_Background_image from './SetBackgroundImage';

import LoadPerspectiveCamera from './LoadCameras/loadPerspectiveCamera';

import {  PerfCollector, PerfMetrics, PerfMonitor, PerfMonitorHandle } from './PerfMonitor';
import LoadGrid from './LoadElements/loadGrid';
import LoadBaseElement from './LoadElements/loadBaseElement';

import Load_Model from 'LoadElements/loadModel';
import InstancedGLBGroup from 'LoadElements/InstancedGLBGroup';
import InlineEditor from 'Editors/InlineEditor';
import GradientLegend from 'LoadElements/GradientLegend';
import HelpInfoOverlay from 'LoadElements/HelpInfoOverlay';
import ListLinksRender from 'ListLinksRender';

interface Props extends PanelProps<Options> {}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type ViewportConfig = {
  cameraId: string;
  title: string;
  left: number;
  top: number;
  width: number;
  height: number;
  enabled?: boolean;
};

const MODEL_TYPES = new Set(['load gltf/glb']);
const BASE_ELEMENT_TYPES = new Set([
  'cube',
  'plane',
  'sphere',
  'text3d',
  'text2d',
  'Line3D',
]);

const AXIS_HELPER_COLORS = {
  x: '#ff5b5b',
  y: '#6bd66b',
  z: '#5b8cff',
};

type AxisHelperPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'center-right'
  | 'center-left'
  | 'center-center';

type AxisHelperDirection = 'posX' | 'negX' | 'posY' | 'negY' | 'posZ' | 'negZ';

type ViewAxisDescriptor = {
  key: AxisHelperDirection;
  axis: 'x' | 'y' | 'z';
  label: string;
  vector: THREE.Vector3;
  negative?: boolean;
};

const VIEW_AXIS_DESCRIPTORS: ViewAxisDescriptor[] = [
  { key: 'negZ', axis: 'z', label: 'z', vector: new THREE.Vector3(0, 0, -1), negative: true },
  { key: 'negY', axis: 'y', label: 'y', vector: new THREE.Vector3(0, -1, 0), negative: true },
  { key: 'negX', axis: 'x', label: 'x', vector: new THREE.Vector3(-1, 0, 0), negative: true },
  { key: 'posX', axis: 'x', label: 'X', vector: new THREE.Vector3(1, 0, 0) },
  { key: 'posY', axis: 'y', label: 'Y', vector: new THREE.Vector3(0, 1, 0) },
  { key: 'posZ', axis: 'z', label: 'Z', vector: new THREE.Vector3(0, 0, 1) },
];

function toFiniteNumber(value: unknown, fallback = 0) {
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : fallback;
}

function getAxisHelperAnchorStyle(position: string, marginX: number, marginY: number): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute' };

  switch (position as AxisHelperPosition) {
    case 'top-left':
      return { ...base, top: marginY, left: marginX };
    case 'top-right':
      return { ...base, top: marginY, right: marginX };
    case 'top-center':
      return { ...base, top: marginY, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-left':
      return { ...base, bottom: marginY, left: marginX };
    case 'bottom-center':
      return { ...base, bottom: marginY, left: '50%', transform: 'translateX(-50%)' };
    case 'center-left':
      return { ...base, top: '50%', left: marginX, transform: 'translateY(-50%)' };
    case 'center-right':
      return { ...base, top: '50%', right: marginX, transform: 'translateY(-50%)' };
    case 'center-center':
      return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    case 'bottom-right':
    default:
      return { ...base, bottom: marginY, right: marginX };
  }
}

function ViewportAxisHelperOverlay({
  view,
  camera,
  config,
  active,
  onActivate,
  onSnap,
  onInteractionChange,
}: {
  view: ViewportConfig;
  camera: ViewBindableCamera | null;
  config: AxesHelper;
  active: boolean;
  onActivate: () => void;
  onSnap: (direction: AxisHelperDirection) => void;
  onInteractionChange?: (interacting: boolean) => void;
}) {
  const [, forceRerender] = React.useReducer((v: number) => v + 1, 0);

  React.useEffect(() => {
    if (!camera) {
      return;
    }

    let frame = 0;
    let last = '';

    const tick = () => {
      const q = camera.quaternion;
      const signature = `${q.x.toFixed(4)}|${q.y.toFixed(4)}|${q.z.toFixed(4)}|${q.w.toFixed(4)}`;

      if (signature !== last) {
        last = signature;
        forceRerender();
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [camera]);

  const helperSize = Math.max(72, toFiniteNumber(config.size, 92));
  const marginX = toFiniteNumber(config.marginx, 0);
  const marginY = toFiniteNumber(config.marginy, 0);
  const pointSize = Math.max(10, toFiniteNumber(config.points_size, 14));

  const projectedAxes = !camera
  ? []
  : (() => {
      const center = helperSize / 2;
      const radius = helperSize * 0.34;
      const inverseQuaternion = camera.quaternion.clone().invert();

      return VIEW_AXIS_DESCRIPTORS.map((item) => {
        const projected = item.vector.clone().applyQuaternion(inverseQuaternion);
        const depthScale = THREE.MathUtils.clamp(0.84 + (projected.z + 1) * 0.18, 0.82, 1.2);

        return {
          ...item,
          x: center + projected.x * radius,
          y: center - projected.y * radius,
          depth: projected.z,
          depthScale,
        };
      }).sort((a, b) => a.depth - b.depth);
    })();

  const beginInteraction = React.useCallback(
    (e?: React.PointerEvent<HTMLElement | SVGElement>) => {
      e?.stopPropagation();
      e?.preventDefault();
      onActivate();
      onInteractionChange?.(true);

      if (e?.currentTarget && 'setPointerCapture' in e.currentTarget) {
        try {
          (e.currentTarget as Element & { setPointerCapture?: (pointerId: number) => void }).setPointerCapture?.(
            e.pointerId
          );
        } catch {
          // ignore
        }
      }
    },
    [onActivate, onInteractionChange]
  );

  const endInteraction = React.useCallback(
    (e?: React.PointerEvent<HTMLElement | SVGElement>) => {
      e?.stopPropagation();
      onInteractionChange?.(false);

      if (e?.currentTarget && 'releasePointerCapture' in e.currentTarget) {
        try {
          (
            e.currentTarget as Element & { releasePointerCapture?: (pointerId: number) => void }
          ).releasePointerCapture?.(e.pointerId);
        } catch {
          // ignore
        }
      }
    },
    [onInteractionChange]
  );

  if (!camera) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${view.left * 100}%`,
        top: `${view.top * 100}%`,
        width: `${view.width * 100}%`,
        height: `${view.height * 100}%`,
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <div
        style={{
          ...getAxisHelperAnchorStyle(String(config.position || 'bottom-right'), marginX, marginY),
          width: helperSize,
          height: helperSize,
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
          cursor: 'default',
        }}
        onPointerEnter={() => onActivate()}
        onPointerDown={beginInteraction}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        onPointerLeave={() => onInteractionChange?.(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg width={helperSize} height={helperSize} viewBox={`0 0 ${helperSize} ${helperSize}`}>
          <circle
            cx={helperSize / 2}
            cy={helperSize / 2}
            r={helperSize * 0.48}
            fill={active ? 'rgba(30,34,39,0.94)' : 'rgba(24,28,34,0.88)'}
            stroke={active ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.14)'}
            strokeWidth={1}
          />
          <circle
            cx={helperSize / 2}
            cy={helperSize / 2}
            r={helperSize * 0.42}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />

          {projectedAxes.map((axis) => {
            const color = AXIS_HELPER_COLORS[axis.axis];
            const center = helperSize / 2;
            const isBack = axis.negative;
            const armWidth = isBack ? helperSize * 0.024 : helperSize * 0.036;
            const visibleRadius = (isBack ? pointSize * 0.56 : pointSize) * axis.depthScale;
            const hitRadius = Math.max(visibleRadius + 6, helperSize * 0.085);

            return (
              <g key={axis.key}>
                <line
                  x1={center}
                  y1={center}
                  x2={axis.x}
                  y2={axis.y}
                  stroke={color}
                  strokeWidth={armWidth}
                  strokeLinecap="round"
                  opacity={isBack ? 0.3 : 1}
                />
                <circle
                  cx={axis.x}
                  cy={axis.y}
                  r={visibleRadius}
                  fill={color}
                  opacity={isBack ? 0.42 : 1}
                  stroke={isBack ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.28)'}
                  strokeWidth={isBack ? 1 : 1.2}
                />
                <circle
                  cx={axis.x}
                  cy={axis.y}
                  r={hitRadius}
                  fill="transparent"
                  onPointerDown={(e) => {
                    beginInteraction(e);
                    onSnap(axis.key);
                  }}
                  onPointerUp={endInteraction}
                  onPointerCancel={endInteraction}
                />
                <text
                  x={axis.x}
                  y={axis.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isBack ? 'rgba(255,255,255,0.78)' : '#111418'}
                  fontSize={Math.max(11, visibleRadius * 1.02)}
                  fontWeight={800}
                  style={{ pointerEvents: 'none' }}
                  opacity={isBack ? 0.9 : 1}
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          <circle
            cx={helperSize / 2}
            cy={helperSize / 2}
            r={Math.max(4, helperSize * 0.03)}
            fill="rgba(255,255,255,0.12)"
          />
        </svg>
      </div>
    </div>
  );
}

function ViewportCameraResetOverlay({
  view,
  position,
  size,
  active,
  onActivate,
  onReset,
}: {
  view: ViewportConfig;
  position: Corner;
  size: number;
  active: boolean;
  onActivate: () => void;
  onReset: () => void;
}) {
  const dimension = Math.max(24, size);
  const inset = 10;

  const anchorStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.startsWith('top') ? inset : undefined,
    bottom: position.startsWith('bottom') ? inset : undefined,
    left: position.endsWith('left') ? inset : undefined,
    right: position.endsWith('right') ? inset : undefined,
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${view.left * 100}%`,
        top: `${view.top * 100}%`,
        width: `${view.width * 100}%`,
        height: `${view.height * 100}%`,
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <button
        aria-label="Reset camera"
        type="button"
        title="Reset camera"
        onPointerEnter={() => onActivate()}
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
          onReset();
        }}
        style={{
          ...anchorStyle,
          pointerEvents: 'auto',
          zIndex: 20,
          width: dimension,
          height: dimension,
          borderRadius: Math.max(6, dimension * 0.18),
          border: active ? '1px solid rgba(255,255,255,0.34)' : '1px solid rgba(255,255,255,0.22)',
          background: active ? 'rgba(42,42,42,0.92)' : 'rgba(20,20,20,0.82)',
          color: '#fff',
          fontSize: Math.max(14, dimension * 0.46),
          lineHeight: '1',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(60,60,60,0.92)')}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = active ? 'rgba(42,42,42,0.92)' : 'rgba(20,20,20,0.82)')
        }
      >
        ⌂
      </button>
    </div>
  );
}

function OverlayCorner({
  position,
  children,
}: {
  position: Corner;
  children: React.ReactNode;
}) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: isTop ? 'column' : 'column-reverse',
        gap: 8,
        alignItems: isLeft ? 'flex-start' : 'flex-end',
        top: isTop ? 12 : undefined,
        bottom: !isTop ? 12 : undefined,
        left: isLeft ? 12 : undefined,
        right: !isLeft ? 12 : undefined,
      }}
    >
      {children}
    </div>
  );
}

function isViewBindableCamera(camera: THREE.Camera): camera is ViewBindableCamera {
  return (camera as THREE.PerspectiveCamera).isPerspectiveCamera === true;
}

function ActiveViewCameraBinder({ camera }: { camera: ViewBindableCamera | null }) {
  const set = useThree((s) => s.set);

  React.useEffect(() => {
    if (camera) {
      set({ camera: camera as RootState['camera'] });
    }
  }, [camera, set]);

  return null;
}

function DynamicDprControls({
  enabled,
  movingDpr,
  idleDpr,
  onChange,
  controlsenabled,
  cameraTarget,
  controlsRef,
}: {
  enabled: boolean;
  movingDpr: number;
  idleDpr: number;
  onChange: () => void;
  controlsenabled: boolean;
  cameraTarget: [number, number, number];
  controlsRef: React.RefObject<any>;
}) {
  const setDpr = useThree((s: RootState) => s.setDpr);
  const regress = useThree((s: RootState) => s.performance.regress);


  React.useEffect(() => {
    setDpr(idleDpr);
  }, [setDpr, idleDpr]);



  React.useEffect(() => {
    if (!controlsRef.current) {return;}
    controlsRef.current.target.set(...cameraTarget);
    controlsRef.current.update();
  }, [cameraTarget, controlsRef]);

  const handleStart = React.useCallback(() => {
    if (enabled) {
      setDpr(movingDpr);
    }
  }, [enabled, movingDpr, setDpr]);
  
  const handleEnd = React.useCallback(() => {
    if (enabled) {
      setDpr(idleDpr);
    }
  }, [enabled, idleDpr, setDpr]);

  const handleChange = React.useCallback(() => {
    onChange();
    regress();
  }, [onChange, regress]);

  return (
    <MapControls
      ref={controlsRef}
      makeDefault
      onChange={handleChange}
      onStart={handleStart}
      onEnd={handleEnd}
      enabled={controlsenabled}
      target={cameraTarget}
    />
  );
}

function sanitizeColor(color: string | undefined): string {
  if (typeof color === 'string' && /^#[0-9a-fA-F]{8}$/.test(color)) {
    return color.slice(0, 7);
  }
  return color || '#FF00FF';
}

function parseLoadError(raw: string): string {
  if (!raw || raw === '[object Event]' || raw === '[object ProgressEvent]') {
    return 'Model load failed (unknown error)';
  }

  const msg = raw.replace(/^Error:\s*/i, '');
  const statusMatch = msg.match(/\b([45]\d{2})\b/);

  if (statusMatch) {
    const code = statusMatch[1];
    const names: Record<string, string> = {
      '400': 'Bad Request',
      '401': 'Unauthorized',
      '403': 'Forbidden',
      '404': 'Not Found',
      '408': 'Request Timeout',
      '429': 'Too Many Requests',
      '500': 'Internal Server Error',
      '502': 'Bad Gateway',
      '503': 'Service Unavailable',
      '504': 'Gateway Timeout',
    };
    return `HTTP ${code}${names[code] ? ' – ' + names[code] : ''}`;
  }

  if (/Failed to fetch/i.test(msg)) {return 'Network error – failed to fetch (wrong URL or server unreachable)';}
  if (/NetworkError/i.test(msg)) {return 'Network error';}
  if (/timeout/i.test(msg)) {return 'Request timeout';}
  if (/CORS/i.test(msg)) {return 'CORS error – server does not allow cross-origin requests';}

  return msg.replace(/Could not load .+?:\s*/i, '').slice(0, 120);
}

const ModelFallback = ({ error }: { error: Error }) => (
  <Html>
    <div
      style={{
        color: '#ff6666',
        background: 'rgba(0,0,0,0.85)',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ff4444',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '320px',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.4',
      }}
    >
      ⚠ Model load error
      <br />
      {parseLoadError(error?.message || String(error))}
    </div>
  </Html>
);

const SceneFallback = ({ error }: { error: Error }) => (
  <div
    style={{
      color: '#ff6666',
      background: 'rgba(0,0,0,0.85)',
      padding: '12px 16px',
      borderRadius: '4px',
      border: '1px solid #ff4444',
      fontFamily: 'monospace',
      fontSize: '13px',
      maxWidth: '400px',
      margin: '16px',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.5',
    }}
  >
    ⚠ Scene error
    <br />
    {parseLoadError(error?.message || String(error))}
  </div>
);

function getFieldLabel(frame: DataFrame, field: Field): string {
  return field.config?.displayNameFromDS || field.state?.displayName || frame.name || frame.refId || field.name;
}

function normalizeColorDataKey(dataKey: string, data: PanelData): string {
  if (!dataKey?.includes(':')) {
    return dataKey;
  }

  const refId = dataKey.split(':', 1)[0];
  const fieldName = dataKey.split(':').slice(1).join(':');
  const frame = data.series?.find((s) => s.refId === refId);

  if (!frame) {
    return fieldName || refId || dataKey;
  }

  const field = frame.fields?.find((f) => f.name === fieldName);
  if (!field) {
    return fieldName || frame.name || frame.refId || dataKey;
  }

  return getFieldLabel(frame, field);
}

const CAMERA_ID = 'perspective-camera';
const FULL_VIEWPORT: ViewportConfig = {
  cameraId: CAMERA_ID,
  title: '',
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  enabled: true,
};

const Scene3DPanel: React.FC<Props> = ({
  options,
  data,
  replaceVariables,
  fieldConfig,
  width,
  height,
  onOptionsChange,
}) => {
  const canvasref = React.useRef<HTMLCanvasElement>(null);
  const inlinecontainerRef = React.useRef<HTMLDivElement>(null);
  const sceneContainerRef = React.useRef<HTMLDivElement>(null);

  const cameraRefs = React.useRef<Record<string, ViewBindableCamera>>({});
  const controlsRef = React.useRef<any>(null);
  const cameraTargetRefs = React.useRef<Record<string, THREE.Vector3>>({});

  const [, bumpCameraVersion] = React.useReducer((v: number) => v + 1, 0);
  const [axisHelperPointerOwner, setAxisHelperPointerOwner] = React.useState<boolean>(false);

  const [showPerf, setShowPerf] = React.useState<boolean>(false);
  const [triggerelement, settriggerelement] = React.useState<ElementOptions | undefined>();



  const [inlineeditorPosition, setInlineEditorPosition] = React.useState<[number, number, number]>([0, 0, 0]);
  const [inlineeditorsize, setinlineeditorSize] = React.useState({ width: width / 2, height: height / 2 });

  const disabledScrollHandler = React.useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const canvasKey = `canvas-${options.canvas_antialias}-${options.canvas_power_preference}`;

  const cameraOption = React.useMemo<CameraOptions>(() => ({
    ...defaultValuesCamera,
    ...(options.cameras?.[0] ?? {}),
    id: CAMERA_ID,
    type: 'PerspectiveCamera',
  }), [options.cameras]);

  React.useEffect(() => {
    const canvas = canvasref.current;
    if (!canvas) {return;}

    canvas.addEventListener('mousewheel', disabledScrollHandler, { passive: false });
    canvas.addEventListener('DOMMouseScroll', disabledScrollHandler, { passive: false });

    return () => {
      canvas.removeEventListener('mousewheel', disabledScrollHandler as EventListener);
      canvas.removeEventListener('DOMMouseScroll', disabledScrollHandler as EventListener);
    };
  }, [canvasKey, disabledScrollHandler]);

  const registerCamera = React.useCallback((id: string, cam: THREE.Camera | null) => {
    if (id === CAMERA_ID && cam && isViewBindableCamera(cam)) {
      cameraRefs.current[CAMERA_ID] = cam;
    } else {
      delete cameraRefs.current[CAMERA_ID];
    }
    bumpCameraVersion();
  }, []);

  const activeCamera = cameraRefs.current[CAMERA_ID] || null;
  const activeCameraOptions = cameraOption;
  const cameraOptionsById = React.useMemo<Record<string, CameraOptions>>(
    () => ({ [CAMERA_ID]: cameraOption }),
    [cameraOption]
  );


  const controlsenabled = React.useMemo(() => {
    if (triggerelement || axisHelperPointerOwner) {
      return false;
    }

    if (typeof activeCameraOptions.enablecontrols === 'boolean') {
      return activeCameraOptions.enablecontrols;
    }

    return !!options.enablecontrols;
  }, [activeCameraOptions, axisHelperPointerOwner, options.enablecontrols, triggerelement]);

  const defaultCameraTargets = React.useMemo<Record<string, THREE.Vector3>>(() => ({
    [CAMERA_ID]: new THREE.Vector3(
      toFiniteNumber(replaceVariables((cameraOption as any).look_at_x), 0),
      toFiniteNumber(replaceVariables((cameraOption as any).look_at_y), 0),
      toFiniteNumber(replaceVariables((cameraOption as any).look_at_z), 0)
    ),
  }), [cameraOption, replaceVariables]);

  React.useEffect(() => {
    if (!cameraTargetRefs.current[CAMERA_ID]) {
      cameraTargetRefs.current[CAMERA_ID] = defaultCameraTargets[CAMERA_ID].clone();
    }
  }, [defaultCameraTargets]);

  const findElementById = React.useCallback((elements: ElementOptions[], id: string): ElementOptions | undefined => {
    for (const element of elements) {
      if (element.id === id) {
        return element;
      }

    }
    return undefined;
  }, []);

  const handleElementChange = React.useCallback(
    (newElements: ElementOptions[]) => {
      onOptionsChange({ ...options, elements: newElements });

      if (triggerelement) {
        const updatedElement = findElementById(newElements, triggerelement.id);
        if (updatedElement) {
          settriggerelement(updatedElement);
        }
      }
    },
    [findElementById, onOptionsChange, options, triggerelement]
  );

  const handleResizeInline = React.useCallback((w: number, h: number) => {
    setinlineeditorSize({ width: w, height: h });
  }, []);


  React.useEffect(() => {
    if (!options.add_debug) {
      setShowPerf(false);
      return;
    }

    const timer = setTimeout(() => setShowPerf(true), 100);
    return () => clearTimeout(timer);
  }, [options.add_debug]);

  const perfMonitorRef = React.useRef<PerfMonitorHandle>(null);

  const handlePerfUpdate = React.useCallback((metrics: PerfMetrics) => {
    perfMonitorRef.current?.update(metrics);
  }, []);

  const resolveElementColor = React.useCallback(
    (el: ElementOptions) => {
      const baseColor = sanitizeColor(el.color || '#ff00ff');

      if (!el.enablecolorquery || !el.colorquery) {
        return baseColor;
      }

      const dataKey = normalizeColorDataKey(String(el.colorquery), data);

      return sanitizeColor(
        getColorFromData(dataKey, data, fieldConfig, baseColor, {
          usegradient: !!el.usegradient,
          global_gradient: options.gradientcolor,
        })
      );
    },
    [data, fieldConfig, options.gradientcolor]
  );

  const renderCamera = React.useCallback(
    () => (
      <LoadPerspectiveCamera
        key={CAMERA_ID}
        cameraId={CAMERA_ID}
        camera={cameraOption}
        replaceVariables={replaceVariables}
        registerCamera={registerCamera}
      />
    ),
    [cameraOption, replaceVariables, registerCamera]
  );

  const isInstancable = React.useCallback(
    (el: ElementOptions): boolean =>
      el.type === 'load gltf/glb' &&
      String(el.elementurl) !== 'Enter link' &&
      (!el.traverse || !el.subelements || el.subelements.length === 0),
    []
  );

  const renderInstancedGLBGroups = React.useCallback(
    (elements: ElementOptions[]) => {
      const urlMap = new Map<string, ElementOptions[]>();

      elements.forEach((el) => {
        if (!isInstancable(el)) {return;}
        const url = String(el.elementurl);
        if (!urlMap.has(url)) {
          urlMap.set(url, []);
        }
        urlMap.get(url)!.push(el);
      });

      return Array.from(urlMap.entries()).map(([url, els]) => (
        <ErrorBoundary key={`instanced-${url}`} FallbackComponent={ModelFallback}>
          <React.Suspense fallback={null}>
            <InstancedGLBGroup
              elements={els}
              allElements={options.elements}
              data={data}
              fieldConfig={fieldConfig}
              globaloptions={options}
              replaceVariables={replaceVariables}
            />
          </React.Suspense>
        </ErrorBoundary>
      ));
    },
    [data, fieldConfig, isInstancable, options, replaceVariables]
  );

  const renderElements = React.useCallback(
    (elements: ElementOptions[]) =>
      elements.map((el: ElementOptions) => {
        if (el.type && MODEL_TYPES.has(el.type)) {
          if (isInstancable(el)) {
            return null;
          }

          if (String(el.elementurl) !== 'Enter link') {
            return (
              <ErrorBoundary key={el.id} FallbackComponent={ModelFallback}>
                <Load_Model
                  globaloptions={options}
                  el={el}
                  url={String(el.elementurl)}
                  data={data}
                  replaceVariables={replaceVariables}
                  fieldConfig={fieldConfig}
                  settriggerelement={settriggerelement}
                  allElements={options.elements}
                />
              </ErrorBoundary>
            );
          }

          return <group key={el.id}>loading</group>;
        }

        if (el.type === 'Custom Element') {
          const elcolor = resolveElementColor(el);

          return (
            <ErrorBoundary key={el.id} FallbackComponent={ModelFallback}>
              {el.points && (
                <LoadBaseElement
                  fieldConfig={fieldConfig}
                  globaloptions={options}
                  elcolor={elcolor}
                  data={data}
                  el={el}
                  replaceVariables={replaceVariables}
                  settriggerelement={settriggerelement}
                  allElements={options.elements}
                />
              )}
            </ErrorBoundary>
          );
        }

        if (el.type && BASE_ELEMENT_TYPES.has(el.type)) {
          const elcolor = resolveElementColor(el);

          return (
            <ErrorBoundary key={el.id} FallbackComponent={ModelFallback}>
              <LoadBaseElement
                globaloptions={options}
                elcolor={elcolor}
                data={data}
                el={el}
                replaceVariables={replaceVariables}
                fieldConfig={fieldConfig}
                settriggerelement={settriggerelement}
                allElements={options.elements}
              />
            </ErrorBoundary>
          );
        }

        if (el.type === 'grid') {
          const elcolor = resolveElementColor(el);

          return (
            <ErrorBoundary key={el.id} FallbackComponent={ModelFallback}>
              <LoadGrid
                globaloptions={options}
                elcolor={elcolor}
                data={data}
                el={el}
                replaceVariables={replaceVariables}
              />
            </ErrorBoundary>
          );
        }



        return (
          <mesh key={el.id} position={[Number(el.elementaxisx), Number(el.elementaxisy), Number(el.elementaxisz)]}>
            <boxGeometry
              attach="geometry"
              args={[Number(el.elementsizeX), Number(el.elementsizeZ), Number(el.elementsizeY)]}
            />
            <meshStandardMaterial attach="material" color="#6be092" />
          </mesh>
        );
      }),
    [data, fieldConfig, isInstancable, options, replaceVariables, resolveElementColor]
  );

  const defaultActiveCameraTarget = React.useMemo<[number, number, number]>(() => [
    toFiniteNumber(replaceVariables((activeCameraOptions as any).look_at_x), 0),
    toFiniteNumber(replaceVariables((activeCameraOptions as any).look_at_y), 0),
    toFiniteNumber(replaceVariables((activeCameraOptions as any).look_at_z), 0),
  ], [activeCameraOptions, replaceVariables]);

  const activeCameraTarget = React.useMemo<[number, number, number]>(() => {
    const target = cameraTargetRefs.current[CAMERA_ID];

    if (target) {
      return [target.x, target.y, target.z];
    }

    const fallback = defaultCameraTargets[CAMERA_ID];
    if (fallback) {
      return [fallback.x, fallback.y, fallback.z];
    }

    return defaultActiveCameraTarget;
  }, [defaultActiveCameraTarget, defaultCameraTargets]);




  const snapCameraToAxis = React.useCallback(
    (cameraId: string, direction: AxisHelperDirection) => {
      const camera = cameraRefs.current[cameraId];
      if (!camera) {
        return;
      }

      const target = (cameraTargetRefs.current[cameraId] || defaultCameraTargets[cameraId] || new THREE.Vector3()).clone();
      const directionVector = new THREE.Vector3(
        direction === 'posX' ? 1 : direction === 'negX' ? -1 : 0,
        direction === 'posY' ? 1 : direction === 'negY' ? -1 : 0,
        direction === 'posZ' ? 1 : direction === 'negZ' ? -1 : 0
      );

      let distance = camera.position.distanceTo(target);

      if (!Number.isFinite(distance) || distance < 0.001) {
        const fallbackCamera = cameraOptionsById[cameraId];

        if (fallbackCamera) {
          const fallbackPosition = new THREE.Vector3(
            toFiniteNumber(replaceVariables((fallbackCamera as any).cameraposx), 0),
            toFiniteNumber(replaceVariables((fallbackCamera as any).cameraposy), 5),
            toFiniteNumber(replaceVariables((fallbackCamera as any).cameraposz), 10)
          );

          distance = Math.max(0.001, fallbackPosition.distanceTo(target));
        } else {
          distance = 10;
        }
      }

      camera.position.copy(target).addScaledVector(directionVector, distance);

      if (direction === 'posY') {
        camera.up.set(0, 0, -1);
      } else if (direction === 'negY') {
        camera.up.set(0, 0, 1);
      } else {
        camera.up.set(0, 1, 0);
      }

      camera.lookAt(target);
      camera.updateMatrixWorld(true);

      if ((camera as any).updateProjectionMatrix) {
        (camera as any).updateProjectionMatrix();
      }

      cameraTargetRefs.current[cameraId] = target.clone();

      if (controlsRef.current) {
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
      }

      invalidate();
    },
    [cameraOptionsById, defaultCameraTargets, replaceVariables]
  );

  const resetCameraById = React.useCallback(
    (cameraId: string) => {
      const camera = cameraRefs.current[cameraId];
      const cameraOption = cameraOptionsById[cameraId];
      if (!camera || !cameraOption) {
        return;
      }

      const position = new THREE.Vector3(
        toFiniteNumber(replaceVariables((cameraOption as any).cameraposx), 0),
        toFiniteNumber(replaceVariables((cameraOption as any).cameraposy), 5),
        toFiniteNumber(replaceVariables((cameraOption as any).cameraposz), 10)
      );
      const target = new THREE.Vector3(
        toFiniteNumber(replaceVariables((cameraOption as any).look_at_x), 0),
        toFiniteNumber(replaceVariables((cameraOption as any).look_at_y), 0),
        toFiniteNumber(replaceVariables((cameraOption as any).look_at_z), 0)
      );

      camera.position.copy(position);
      camera.up.set(0, 1, 0);
      camera.lookAt(target);
      camera.updateMatrixWorld(true);

      if ((camera as any).updateProjectionMatrix) {
        (camera as any).updateProjectionMatrix();
      }

      cameraTargetRefs.current[cameraId] = target.clone();

      if (controlsRef.current) {
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
      }

      invalidate();
    },
    [cameraOptionsById, replaceVariables]
  );

  const canvasStyle = React.useMemo(
    () =>
      ({
        height: '100%',
        width: '100%',
        position: 'relative' as const,
      }),
    []
  );

  const raycasterConfig = React.useMemo(
    () => ({
      params: {
        Mesh: {},
        Sprite: {},
        LOD: {},
        Line: { threshold: 1 },
        Points: { threshold: 0.01 },
      },
    }),
    []
  );

  const handleMouseOver = React.useCallback((e: any) => {
    e.preventDefault();
  }, []);

  const handleControlsChange = React.useCallback(() => {
    if (controlsRef.current?.target) {
      cameraTargetRefs.current[CAMERA_ID] = controlsRef.current.target.clone();
    }

    invalidate();
  }, []);

  const glConfig = React.useMemo(
    () => ({
      antialias: options.canvas_antialias ?? true,
      powerPreference: (options.canvas_power_preference ?? 'default') as WebGLPowerPreference,
    }),
    [options.canvas_antialias, options.canvas_power_preference]
  );

  const performanceConfig = React.useMemo(
    () => (options.canvas_adaptive_dpr ? { min: options.canvas_adaptive_dpr_min ?? 0.5 } : undefined),
    [options.canvas_adaptive_dpr, options.canvas_adaptive_dpr_min]
  );

  const overlays: Record<Corner, React.ReactNode[]> = {
    'top-left': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-right': [],
  };

  if (options.add_common_gradient && options.gradientcolor?.show_legend) {
    const pos = (options.gradientcolor.legend_position ?? 'bottom-right') as Corner;
    overlays[pos].push(
      <div key="gradient" style={{ pointerEvents: 'none' }}>
        <GradientLegend gc={options.gradientcolor} inline />
      </div>
    );
  }

  {
    const pos = (options.helpwindow_position as Corner) ?? 'top-right';
    overlays[pos].push(
      <div key="help" style={{ pointerEvents: 'auto' }}>
        <HelpInfoOverlay position={pos} width={options.helpwindow_size} />
      </div>
    );
  }

  if (options.enable_links && options.links) {
    const pos = (options.links_position ?? 'bottom-right') as Corner;
    overlays[pos].push(
      <div key="links" style={{ pointerEvents: 'auto' }}>
        <ListLinksRender
          links={options.links}
          position={pos}
          data={data}
          fieldConfig={fieldConfig}
          replaceVariables={replaceVariables}
          links_size={options.links_size || 'small'}
          links_bgcolor={options.links_bgcolor || '#00000000'}
          links_borderwidth={options.links_borderwidth || '0'}
          links_bordercolor={options.links_bordercolor || '#00000000'}
          links_color={options.links_color || '#00000000'}
          inline
        />
      </div>
    );
  }


  return (
    <div style={{ width, height }}>
      <ErrorBoundary FallbackComponent={SceneFallback}>
        <div style={{ width, height }}>
          <div
            ref={sceneContainerRef}
            style={{ width, height, display: 'inline-block', zIndex: 0, position: 'relative' }}
          >
  
            {triggerelement && (
              <InlineEditor
                key={triggerelement.id || 'editor'}
                settriggerelement={settriggerelement}
                ref={inlinecontainerRef}
                width={inlineeditorsize.width}
                height={inlineeditorsize.height}
                onResize={handleResizeInline}
                data={data}
                onChange={handleElementChange}
                globaloptions={options}
                element={triggerelement}
                position={inlineeditorPosition}
                onPositionChange={setInlineEditorPosition}
              />
            )}
  
            {showPerf && <PerfMonitor ref={perfMonitorRef} />}
  
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Corner[]).map((corner) =>
              overlays[corner].length ? (
                <OverlayCorner key={corner} position={corner}>
                  {overlays[corner]}
                </OverlayCorner>
              ) : null
            )}
  
            {cameraOption.add_axis_helper && cameraOption.AxesHelper && (
              <ViewportAxisHelperOverlay
                key="axis-helper"
                view={FULL_VIEWPORT}
                camera={activeCamera}
                config={cameraOption.AxesHelper}
                active={true}
                onActivate={() => {}}
                onInteractionChange={(interacting) => setAxisHelperPointerOwner(interacting)}
                onSnap={(direction) => snapCameraToAxis(CAMERA_ID, direction)}
              />
            )}

            {cameraOption.showresetcamerabutton && (
              <ViewportCameraResetOverlay
                key="camera-reset"
                view={FULL_VIEWPORT}
                position={cameraOption.camera_reset_button_position ?? 'bottom-right'}
                size={toFiniteNumber(cameraOption.camera_reset_button_size, 36)}
                active={true}
                onActivate={() => {}}
                onReset={() => resetCameraById(CAMERA_ID)}
              />
            )}
  
            <Canvas
              key={canvasKey}
              onMouseOver={handleMouseOver}
              ref={canvasref}
              raycaster={raycasterConfig}
              style={canvasStyle}
              gl={glConfig}
              performance={performanceConfig}
            >
              {options.canvas_adaptive_dpr && <AdaptiveDpr pixelated />}
              {options.canvas_adaptive_dpr && <AdaptiveEvents />}
  
              {options.usebackgroundimage && options.imageurl && <Set_Background_image url={options.imageurl} />}
              {renderCamera()}
  
              {activeCamera && <ActiveViewCameraBinder camera={activeCamera} />}

              <DynamicDprControls
                key="single-perspective-controls"
                controlsRef={controlsRef}
                enabled={!!options.use_dynamic_dpr}
                movingDpr={options.dpr_moving ?? 1}
                idleDpr={options.dpr_idle ?? 1.5}
                onChange={handleControlsChange}
                controlsenabled={controlsenabled}
                cameraTarget={activeCameraTarget}
              />
  
              <>
                {showPerf && <PerfCollector onUpdate={handlePerfUpdate} />}
                {options.elements && renderElements(options.elements)}
                {options.elements && renderInstancedGLBGroups(options.elements)}
                <ambientLight
                  color={options.ambient_light_color || '#ffffff'}
                  intensity={options.ambient_light_intensity ?? 1}
                />
              </>
  
              {options.changebackgroundcolor && options.backgroundcolor && (
                <color attach="background" args={[options.backgroundcolor]} />
              )}
            </Canvas>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};
export { Scene3DPanel, Scene3DPanel as Scene3D };
