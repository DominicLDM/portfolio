import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function LowPolyPlanetEarth(props: any) {
  const { scene } = useGLTF('/models/low_poly_planet_earth.glb')
  const ref = useRef<THREE.Object3D>(null)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003
    }
  })
  return <primitive ref={ref} object={scene} {...props} />
}
