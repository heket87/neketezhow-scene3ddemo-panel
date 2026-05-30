import * as THREE from 'three'
import { InstancedFlow } from 'three/examples/jsm/modifiers/CurveModifier.js'
import { useFrame } from '@react-three/fiber'
import React, { useMemo } from 'react'

type InstancedFlowPatched = InstancedFlow & { writeChanges: (index: number) => void }

export default function InstancedLinkPackets({
  curve,
  count = 12,
  speed = 0.35,
  radius = 0.06,
  color = 'white',
}: {
  curve: THREE.Curve<THREE.Vector3>
  count?: number
  speed?: number
  radius?: number
  color?: THREE.ColorRepresentation
}) {
  const flow = useMemo(() => {
    const geometry = new THREE.SphereGeometry(radius, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })

    const curveCount = 1

    const f = new InstancedFlow(
      count,
      curveCount,
      geometry,
      material as unknown as THREE.Material
    ) as InstancedFlowPatched

    f.updateCurve(0, curve)

    for (let i = 0; i < count; i++) {
      f.setCurve(i, 0)
      f.moveIndividualAlongCurve(i, i / count) // равномерно по длине
      f.writeChanges(i) // TS-фикc (в рантайме метод есть)
    }

    // Важно: в r3f нужно рендерить object3D
    return f
  }, [curve, count, radius, color])

  useFrame((_, dt) => {
    flow.moveAlongCurve(dt * speed)
  })

  return <primitive object={flow.object3D} />
}
