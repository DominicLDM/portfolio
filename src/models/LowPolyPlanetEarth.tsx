import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

export default function LowPolyPlanetEarth(props: any) {
  const { scene } = useGLTF('/models/low_poly_planet_earth.glb')
  const ref = useRef<THREE.Object3D>(null)
  return <primitive ref={ref} object={scene} {...props} />
}
