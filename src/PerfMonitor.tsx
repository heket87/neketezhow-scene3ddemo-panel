import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type PerfMetrics = {
  fps: number;
  ms: number;
  memory: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
};

export type PerfMonitorHandle = {
  update: (metrics: PerfMetrics) => void;
};

const EMPTY_METRICS: PerfMetrics = {
  fps: 0,
  ms: 0,
  memory: 0,
  calls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
};

// Component inside Canvas for collecting metrics
const PerfCollectorInner: React.FC<{
  onUpdate: (metrics: PerfMetrics) => void;
}> = ({ onUpdate }) => {
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());
  const frameTimeSum = React.useRef(0);

  const { gl, scene } = useThree();
  const diagInterval = React.useRef(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;

    frameCount.current++;
    frameTimeSum.current += delta;

    // Update every 60 frames
    if (frameCount.current >= 60) {
      const avgFrameTime = frameTimeSum.current / frameCount.current;
      const fps = Math.round(1000 / avgFrameTime);
      const ms = Math.round(avgFrameTime * 10) / 10;

      const info = gl.info;
      const calls = info.render.calls;
      const triangles = info.render.triangles;
      const geometries = info.memory.geometries;
      const textures = info.memory.textures;

      let memory = 0;
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        memory = Math.round(mem.usedJSHeapSize / 1048576);
      }

      onUpdate({ fps, ms, memory, calls, triangles, geometries, textures });

      diagInterval.current++;
      if (diagInterval.current >= 5) {
        diagInterval.current = 0;

        const nameCounts: Record<string, number> = {};
        let totalMeshes = 0;
        let totalInstanced = 0;

        scene.traverse((obj) => {
          if (obj instanceof THREE.InstancedMesh) {
            totalInstanced++;
            const key = 'InstancedMesh:' + (obj.name || 'unnamed');
            nameCounts[key] = (nameCounts[key] ?? 0) + 1;
          } else if (obj instanceof THREE.Mesh) {
            totalMeshes++;
            const key = 'Mesh:' + (obj.name || 'unnamed');
            nameCounts[key] = (nameCounts[key] ?? 0) + 1;
          }
        });

        const childTypes = scene.children.map((c) => {
          const isGroup = c.type === 'Group';
          const isMesh = c instanceof THREE.Mesh;
          const isIM = c instanceof THREE.InstancedMesh;
          const isLight = c instanceof THREE.Light;
          const isCamera = c instanceof THREE.Camera;
          const typeStr = isIM
            ? 'InstancedMesh'
            : isMesh
            ? 'Mesh'
            : isGroup
            ? 'Group'
            : isLight
            ? 'Light'
            : isCamera
            ? 'Camera'
            : c.type;

          return typeStr + (c.name ? ':' + c.name : '');
        });

        const childTypeCounts: Record<string, number> = {};
        childTypes.forEach((t) => {
          childTypeCounts[t] = (childTypeCounts[t] ?? 0) + 1;
        });

        void nameCounts;
        void totalMeshes;
        void totalInstanced;
        void childTypeCounts;
      }

      frameCount.current = 0;
      frameTimeSum.current = 0;
    }

    lastTime.current = now;
  });

  return null;
};

PerfCollectorInner.displayName = 'PerfCollector';

export const PerfCollector = React.memo(PerfCollectorInner);
PerfCollector.displayName = 'PerfCollector';

const PerfMonitorInner = React.forwardRef<PerfMonitorHandle>((_, ref) => {
  const [metrics, setMetrics] = React.useState<PerfMetrics>(EMPTY_METRICS);
  const metricsRef = React.useRef(metrics);

  React.useImperativeHandle(
    ref,
    () => ({
      update(next) {
        const prev = metricsRef.current;

        if (
          prev.fps === next.fps &&
          prev.ms === next.ms &&
          prev.memory === next.memory &&
          prev.calls === next.calls &&
          prev.triangles === next.triangles &&
          prev.geometries === next.geometries &&
          prev.textures === next.textures
        ) {
          return;
        }

        metricsRef.current = next;
        setMetrics(next);
      },
    }),
    []
  );

  const { fps, ms, memory, calls, triangles, geometries, textures } = metrics;

  return (
    <div
      style={{
        position: 'absolute',
        top: '36px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '8px 10px',
        borderRadius: '4px',
        zIndex: 10000,
        pointerEvents: 'none',
        userSelect: 'none',
        minWidth: '200px',
      }}
    >
      <div style={{ lineHeight: '1.5' }}>
        <div style={{ color: fps >= 50 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00', fontWeight: 'bold' }}>
          FPS: {fps}
        </div>
        <div style={{ color: ms <= 20 ? '#0f0' : ms <= 35 ? '#ff0' : '#f00' }}>
          MS: {ms}
        </div>
        {memory > 0 && <div style={{ color: '#0af' }}>MB: {memory}</div>}
        <div style={{ color: '#888', marginTop: '4px', fontSize: '10px' }}>Calls: {calls}</div>
        <div style={{ color: '#888', fontSize: '10px' }}>
          Triangles: {triangles.toLocaleString()}
        </div>
        <div style={{ color: '#888', fontSize: '10px' }}>Geometries: {geometries}</div>
        <div style={{ color: '#888', fontSize: '10px' }}>Textures: {textures}</div>
      </div>
    </div>
  );
});

PerfMonitorInner.displayName = 'PerfMonitorInner';

export const PerfMonitor = React.memo(PerfMonitorInner);
PerfMonitor.displayName = 'PerfMonitor';
