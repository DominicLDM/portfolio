import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function LowPolyPlanetEarth(props: any) {
  const { scene } = useGLTF('/models/low_poly_planet_earth.glb')
  const ref = useRef<THREE.Object3D>(null)
  useEffect(() => {
    if (scene && props.onLoaded) {
      props.onLoaded();
    }
  }, [scene, props.onLoaded]);
  return <primitive ref={ref} object={scene} {...props} />
}
