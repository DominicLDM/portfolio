import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Preload } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
useGLTF.preload('/models/black_hole.glb')
useGLTF.preload('/models/galaxy.glb')
useGLTF.preload('/models/galaxy2.glb')
useGLTF.preload('/models/Goose.glb')
useGLTF.preload('/models/low_poly_planet_earth.glb')
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, Stars } from '@react-three/drei'
import { useThree } from "@react-three/fiber"
import { X, RotateCcw } from "lucide-react"
import * as THREE from 'three'
import { getSelectionRects } from 'troika-three-text'
import LowPolyPlanetEarth from './models/LowPolyPlanetEarth'

type LandmarkData = {
  model: string;
  position: [number, number, number];
  tab: string;
  scale?: [number, number, number];
  rotation?: [number, number, number];
};

// Landmark component
function Landmark({ model, position, tab, onClick, scale = [1, 1, 1], rotation = [0, 0, 0] }: {
  model: string,
  position: [number, number, number],
  tab: string,
  onClick: (tab: string) => void,
  scale?: [number, number, number],
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(model)
  const [hovered, setHovered] = useState(false)

  // Helper to clone the scene for highlight
  const highlightScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#ffe066', // Vibrant yellow highlight
          emissive: '#ffe066', // Glow effect
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.55, // More translucent
          wireframe: true,
          depthWrite: false // Always appears on top, doesn't block other objects
        });
      }
    });
    return clone;
  }, [scene]);

  // Compute bounding box for adaptive ring size
  const [ringRadius, setRingRadius] = useState(0.65);
  const [ringYOffset, setRingYOffset] = useState(-0.18 * (scale[1] ?? 1));
  const highlightScale = scale.map(s => s * 1.05) as [number, number, number];

  useEffect(() => {
    if (scene) {
      const bbox = new THREE.Box3().setFromObject(scene);
      const size = bbox.getSize(new THREE.Vector3());
      // Use the largest X/Z dimension for the ring radius
      const maxXZ = Math.max(size.x, size.z);
      setRingRadius(0.5 + maxXZ * 0.55); // base + scale factor
      // Calculate offset from model origin to bottom
      const center = bbox.getCenter(new THREE.Vector3());
      // The offset is min.y minus center.y, then apply scale
      setRingYOffset((bbox.min.y - center.y) * Math.max(...scale));
    }
  }, [scene, scale]);
  return (
    <group position={position} rotation={rotation}>
      {/* Blurple ring always visible below the landmark */}
      <mesh position={[0, ringYOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringRadius, 0.09 * Math.max(...scale), 32, 64]} />
        <meshStandardMaterial
          color="#7e8bf5"
          emissive="#7e8bf5"
          emissiveIntensity={0.7}
          transparent
          opacity={0.82}
          roughness={0.35}
          metalness={0.45}
          depthWrite={false}
        />
      </mesh>
      {/* Highlight mesh matching model shape */}
      {hovered && highlightScene && (
        <primitive object={highlightScene.clone()} scale={highlightScale} />
      )}
      <primitive
        object={scene}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(tab)}
      />
    </group>
  )
}

const LANDMARKS: LandmarkData[] = [
  {
    model: '/models/House.glb',
    position: [2.5, 1.2, 2.5],
    tab: 'about',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/Briefcase.glb',
    position: [-2.2, 1.5, -2.2],
    tab: 'experience',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/laptop.glb',
    position: [1.8, 2.1, -2.8],
    tab: 'projects',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/skis.glb',
    position: [-2.8, -1.7, 1.5],
    tab: 'skiing',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/camera.glb',
    position: [0, 1.5, -3],
    tab: 'photos',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/controller.glb',
    position: [0, 1.5, -3],
    tab: 'gaming',
    scale: [0.1, 0.1, 0.1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/esb.glb',
    position: [0, 3.5, 0],
    tab: 'cities',
    scale: [0.2, 0.2, 0.2],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/headphones.glb',
    position: [0, 1.5, -3],
    tab: 'music',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  },
  {
    model: '/models/spotlight.glb',
    position: [0, 1.5, -3],
    tab: 'theatre',
    scale: [1, 1, 1],
    rotation: [0, 0, 0]
  }
]

// Animated camera updater
function AnimatedCamera({ position }: { position: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.updateProjectionMatrix();
  }, [position, camera]);
  return null;
}

function useResponsiveFont(baseSize = 1.2) {
  const { viewport } = useThree()
  let scale = Math.min(viewport.width / 12, 1)
  // Slightly reduce font size for small screens
  if (viewport.width < 600) {
    scale *= 0.8
  }
  return baseSize * scale
}

function useKerningCenters(line: string, fontSize: number) {
  const [centers, setCenters] = useState<number[] | null>(null)
  const [width, setWidth] = useState(0)

  const onSync = useCallback((mesh: any) => {
    const info = mesh?.textRenderInfo
    if (!info) return
    const block = info.blockBounds
    const left = block[0]
    const rights: number[] = []

    for (let i = 0; i < line.length; i++) {
      const rects = getSelectionRects(info, 0, i + 1)
      const right = rects[0]?.right
      rights.push(
        right !== undefined
          ? right
          : (i > 0 ? rights[i - 1] : left)
      )
    }

    const c = rights.map((r, i) => {
      const l = i === 0 ? left : rights[i - 1]
      return (l + r) / 2
    })
    setCenters(c)
    setWidth(block[2] - block[0])
  }, [line, fontSize])

  const Measure = useMemo(() => function MeasureText() {
    return (
      <group visible={false}>
        <Text
          anchorX="center"
          anchorY="middle"
          fontSize={fontSize}
          fontWeight={700}
          onSync={onSync}
        >
          {line}
        </Text>
      </group>
    )
  }, [line, fontSize, onSync])

  return { centers, width, Measure }
}

// Animation states for the typewriter
type AnimationPhase = 'typing' | 'pause' | 'exploding' | 'complete'

interface LetterState {
  char: string
  initialPosition: THREE.Vector3
  velocity: THREE.Vector3
  currentPosition: THREE.Vector3
  rotation: THREE.Euler
  rotationSpeed: THREE.Vector3
  opacity: number
  visible: boolean
}

function Typewriter3D({ onExplodeStart }: { 
  onExplodeStart: () => void, 
  onExplodeComplete: () => void 
}) {
  const text1 = "Hi, I'm "
  const name = "Dominic"
  const text2 = "Welcome to my World."
  const topLine = `${text1}${name}`
  const bottomLine = text2

  const fontSizeTop = useResponsiveFont(1.2)
  const fontSizeBottom = useResponsiveFont(1.1)

  const { centers: topCenters, width: topWidth, Measure: MeasureTop } = useKerningCenters(topLine, fontSizeTop)
  const { centers: botCenters, width: botWidth, Measure: MeasureBottom } = useKerningCenters(bottomLine, fontSizeBottom)

  const { viewport } = useThree()
  const maxAllowed = viewport.width * 0.9
  const fitScale = Math.min(1, maxAllowed / Math.max(topWidth || 1, botWidth || 1))
  const lineSpacing = 3.2 * fitScale

  // Animation state
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('typing')
  const [visibleIndex, setVisibleIndex] = useState(0)
  const [letterStates, setLetterStates] = useState<LetterState[]>([])
  
  const topLetters = useMemo(() => topLine.split(''), [topLine])
  const bottomLetters = useMemo(() => bottomLine.split(''), [bottomLine])
  const total = topLetters.length + bottomLetters.length
  
  // Animation timing refs
  const explosionStartTime = useRef<number>(0)
  const hasTriggeredExplodeStart = useRef(false)

  // Initialize letter states when positions are available
  useEffect(() => {
    if (!topCenters || !botCenters || letterStates.length > 0) return
    
    const states: LetterState[] = []
    
    // Top line letters
    topLetters.forEach((char, i) => {
      const worldPos = new THREE.Vector3(
        (topCenters[i] || 0) * fitScale,
        lineSpacing,
        2
      )
      states.push({
        char,
        initialPosition: worldPos.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        currentPosition: worldPos.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        rotationSpeed: new THREE.Vector3(0, 0, 0),
        opacity: 1,
        visible: false
      })
    })
    
    // Bottom line letters
    bottomLetters.forEach((char, i) => {
      const worldPos = new THREE.Vector3(
        (botCenters[i] || 0) * fitScale,
        -lineSpacing,
        2
      )
      states.push({
        char,
        initialPosition: worldPos.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        currentPosition: worldPos.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        rotationSpeed: new THREE.Vector3(0, 0, 0),
        opacity: 1,
        visible: false
      })
    })
    
    setLetterStates(states)
  }, [topCenters, botCenters, fitScale, lineSpacing, topLetters, bottomLetters])

  // Typing animation with initial pause
  useEffect(() => {
    if (animationPhase !== 'typing' || visibleIndex >= total) return

    let delay = 50 + Math.random() * 35
    const isTopLine = visibleIndex < topLetters.length
    const charIndex = isTopLine ? visibleIndex : visibleIndex - topLetters.length
    const char = isTopLine ? topLetters[charIndex] : bottomLetters[charIndex]

    if (visibleIndex === 0) {
      delay = 2400 // Initial pause before first letter
    } else if (visibleIndex === 3) {
      delay = 500 // Pause after 'Hi,'
    } else {
      if (char === " ") delay = 120
      if (char === "," || char === ".") delay = 250
      // Add pause after finishing the name
      const lastNameIndex = text1.length + name.length
      if (visibleIndex === lastNameIndex) delay = 1200
    }

    const timer = setTimeout(() => {
      setVisibleIndex(i => i + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [animationPhase, visibleIndex, total, topLetters, bottomLetters, text1.length, name.length])

  // Update letter visibility based on typing progress
  useEffect(() => {
    if (letterStates.length === 0) return
    
    setLetterStates(prevStates => 
      prevStates.map((state, i) => ({
        ...state,
        visible: i < visibleIndex
      }))
    )
  }, [visibleIndex, letterStates.length])

  // Transition to pause phase when typing is complete
  useEffect(() => {
    if (animationPhase === 'typing' && visibleIndex >= total) {
      const timer = setTimeout(() => {
        setAnimationPhase('pause')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [animationPhase, visibleIndex, total])

  // Initialize explosion when pause ends
  useEffect(() => {
    if (animationPhase === 'pause') {
      const timer = setTimeout(() => {
        // Calculate explosion velocities for all letters
        setLetterStates(prevStates => 
          prevStates.map(state => {
            // Create random direction in 3D space
            const direction = new THREE.Vector3(
              (Math.random() - 0.5),
              (Math.random() - 0.5),
              (Math.random() - 0.5)
            ).normalize()
            
            // Scale the velocity (speed of explosion)
            const speed = 0.8 + Math.random() * 1.5
            const velocity = direction.multiplyScalar(speed)
            
            // Random rotation speeds
            const rotationSpeed = new THREE.Vector3(
              (Math.random() - 0.5) * 0.06,
              (Math.random() - 0.5) * 0.06,
              (Math.random() - 0.5) * 0.06
            )
            
            return {
              ...state,
              velocity,
              rotationSpeed
            }
          })
        )
        
        explosionStartTime.current = Date.now()
        setAnimationPhase('exploding')
        
        if (!hasTriggeredExplodeStart.current) {
          hasTriggeredExplodeStart.current = true
          onExplodeStart()
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [animationPhase, onExplodeStart])

  // Animation loop using useFrame for smooth updates
  useFrame(() => {
    if ((animationPhase !== 'exploding' && animationPhase !== 'complete') || letterStates.length === 0) return
    // Update letter positions and properties
    setLetterStates(prevStates => 
      prevStates.map(state => {
        // Update position based on velocity (straight line motion)
        const newPosition = state.currentPosition.clone()
        newPosition.add(state.velocity.clone().multiplyScalar(1/60)) // Assuming 60fps

        // Update rotation
        const newRotation = state.rotation.clone()
        newRotation.x += state.rotationSpeed.x
        newRotation.y += state.rotationSpeed.y
        newRotation.z += state.rotationSpeed.z

        // Always visible during explosion
        const opacity = 1

        return {
          ...state,
          currentPosition: newPosition,
          rotation: newRotation,
          opacity
        }
      })
    )
  })

  return (
    <>
      <MeasureTop />
      <MeasureBottom />
      
      {/* Top line letters */}
      <group>
        {letterStates.slice(0, topLetters.length).map((state, i) => {
          if (!state.visible) return null
          
          const isFlying = animationPhase === 'exploding' || animationPhase === 'complete'
          const position = isFlying ? state.currentPosition : state.initialPosition
          const rotation = isFlying ? state.rotation : new THREE.Euler(0, 0, 0)
          const opacity = isFlying ? state.opacity : 1
          
          return (
            <Text
              key={`top-${i}`}
              position={[position.x, position.y, position.z]}
              rotation={[rotation.x, rotation.y, rotation.z]}
              anchorX="center"
              anchorY="middle"
              fontSize={fontSizeTop}
              fontWeight={700}
              color={i >= text1.length && i < text1.length + name.length ? "#7e8bf5" : "#ffffff"}
              material-transparent={true}
              material-opacity={opacity}
            >
              {state.char}
            </Text>
          )
        })}
      </group>
      
      {/* Bottom line letters */}
      <group>
        {letterStates.slice(topLetters.length).map((state, i) => {
          if (!state.visible) return null
          const isFlying = animationPhase === 'exploding' || animationPhase === 'complete'
          const position = isFlying ? state.currentPosition : state.initialPosition
          const rotation = isFlying ? state.rotation : new THREE.Euler(0, 0, 0)
          const opacity = isFlying ? state.opacity : 1
          
          return (
            <Text
              key={`bot-${i}`}
              position={[position.x, position.y, position.z]}
              rotation={[rotation.x, rotation.y, rotation.z]}
              anchorX="center"
              anchorY="middle"
              fontSize={fontSizeBottom}
              fontWeight={700}
              color="#ffffff"
              material-transparent={true}
              material-opacity={opacity}
            >
              {state.char}
            </Text>
          )
        })}
      </group>
    </>
  )
}

// Goose model
function Goose(props: any) {
  const { scene } = useGLTF('/models/Goose.glb')
  return (
    <primitive
      object={scene}
      position={[8.5, 4.2, 12.5]}
      scale={[0.01, 0.01, 0.01]}
      rotation={[Math.PI * 0.18, Math.PI * 0.7, Math.PI * -0.12]}
      {...props}
    />
  )
}

// Galaxy models
function Blackhole(props: any) {
  const { scene } = useGLTF('/models/black_hole.glb')
  return (
    <primitive
      object={scene}
      position={[0, -70, 0]}
      scale={[2.5, 2.5, 2.5]}
      rotation={[0, 0, 0]}
      {...props}
    />
  )
}

function Galaxy2(props: any) {
  const { scene } = useGLTF('/models/galaxy2.glb')
  return (
    <primitive
      object={scene}
      position={[36, -12, 80]}
      scale={[0.5, 0.5, 0.5]}
      rotation={[Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.18]}
      {...props}
    />
  )
}

function Galaxy(props: any) {
  const { scene } = useGLTF('/models/galaxy.glb')
  return (
    <primitive
      object={scene}
      position={[-60, 20, -90]}
      scale={[5, 5, 5]}
      rotation={[12, Math.PI * 0.2, 0]}
      {...props}
    />
  )
}

function Galaxy3(props: any) {
  const { scene } = useGLTF('/models/galaxy3.glb')
  return (
    <primitive
      object={scene}
      position={[190, 80, -30]}
      scale={[0.05, 0.05, 0.05]}
      rotation={[10, Math.PI * 0.2, 15]}
      {...props}
    />
  )
}

function Nebula(props: any) {
  const { scene } = useGLTF('/models/nebula.glb')
  return (
    <primitive
      object={scene}
      position={[-190, -100, 120]}
      scale={[1, 1, 1]}
      rotation={[Math.PI * 0.3, Math.PI * 0.2, Math.PI * 0.3]}
      {...props}
    />
  )
}

function Nebula2(props: any) {
  const { scene } = useGLTF('/models/nebula2.glb')
  return (
    <primitive
      object={scene}
      position={[-190, 400, 520]} // moved far away from other objects
      scale={[30, 30, 30]}
      rotation={[Math.PI * 0.3, Math.PI * 0.2, Math.PI * 0.3]}
      {...props}
    />
  )
}

function Planet1(props: any) {
  const { scene } = useGLTF('/models/planet1.glb')
  return (
    <primitive
      object={scene}
      position={[60, -10, -130]}
      scale={[1.5, 1.5, 1.5]}
      rotation={[0, Math.PI * 0.3, 0]}
      {...props}
    />
  )
}

function Planet2(props: any) {
  const { scene } = useGLTF('/models/planet2.glb')
  return (
    <primitive
      object={scene}
      position={[-60, -10, 150]}
      scale={[1.2, 1.2, 1.2]}
      rotation={[Math.PI * 0.2, Math.PI * 0.5, 0]}
      {...props}
    />
  )
}

function Planet3(props: any) {
  const { scene } = useGLTF('/models/planet3.glb')
  return (
    <primitive
      object={scene}
      position={[150, -50, 20]}
      scale={[1.2, 1.2, 1.2]}
      rotation={[Math.PI * 0.1, Math.PI * 0.7, Math.PI * 0.2]}
      {...props}
    />
  )
}

function Planet4(props: any) {
  const { scene } = useGLTF('/models/planet4.glb')
  return (
    <primitive
      object={scene}
      position={[-160, 15, 20]}
      scale={[0.1, 0.1, 0.1]}
      rotation={[Math.PI * 0.4, Math.PI * 0.2, Math.PI * 0.3]}
      {...props}
    />
  )
}

function Moon(props: any) {
  const { scene } = useGLTF('/models/moon.glb')
  return (
    <primitive
      object={scene}
      position={[50, 10, 40]}
      scale={[0.03, 0.03, 0.03]}
      rotation={[0, Math.PI * 0.3, 0]}
      {...props}
    />
  )
}

function Rocket(props: any) {
  const { scene } = useGLTF('/models/rocket.glb')
  return (
    <primitive
      object={scene}
      position={[-40, 50, 40]}
      scale={[0.08, 0.08, 0.08]}
      rotation={[12, Math.PI * 1.2, 0]}
      {...props}
    />
  )
}

function Satellite(props: any) {
  const { scene } = useGLTF('/models/satellite.glb')
  return (
    <primitive
      object={scene}
      position={[60, 80, -75]}
      scale={[0.2, 0.2, 0.2]}
      rotation={[0, Math.PI * 1.2, 0]}
      {...props}
    />
  )
}

function UFO(props: any) {
  const { scene } = useGLTF('/models/ufo.glb')
  return (
    <primitive
      object={scene}
      position={[5, -30, -80]}
      scale={[0.01, 0.01, 0.01]}
      rotation={[0, Math.PI * 0.5, 0]}
      {...props}
    />
  )
}

// Minimal Asteroids
function Asteroids() {
  type Asteroid = {
    position: [number, number, number]
    scale: number
    rotation: [number, number, number]
  }
  const asteroids = useMemo(() => {
    const arr: Asteroid[] = []
    let tries = 0
    while (arr.length < 40 && tries < 400) {
      const r = 18 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > 14) {
        arr.push({
          position: [x, y, z],
          scale: Math.random() * 0.35 + 0.08,
          rotation: [
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ],
        })
      }
      tries++
    }
    return arr
  }, [])
  
  return (
    <group>
      {asteroids.map((a, i) => (
        <mesh
          key={i}
          position={a.position}
          scale={a.scale}
          rotation={a.rotation}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#888" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function StarsPoints({ count = 1200 }) {
  const stars = useMemo(() => {
    const positions = []
    const colors = []
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      positions.push(x, y, z)
      
      const color = new THREE.Color()
      color.setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.7 + Math.random() * 0.3)
      colors.push(color.r, color.g, color.b)
    }
    return { positions, colors }
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(stars.positions), 3]} />
        <bufferAttribute attach="attributes-color" args={[new Float32Array(stars.colors), 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.45}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

function LoadingScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-purple-600/30 border-t-purple-400 animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-pink-500/30 border-b-pink-400 animate-spin animate-reverse m-auto"></div>
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 m-auto animate-pulse"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Loading the Universe...
        </h2>
      </div>
    </div>
  )
}

export default function SpacePortfolio() {
  const [activeModal, setActiveModal] = React.useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [autoRotate, setAutoRotate] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const interactionTimeout = React.useRef<number | null>(null)
  const controlsRef = React.useRef<any>(null)

  // UI state
  const [showUI, setShowUI] = React.useState(false)
  const [isTypewriterDone, setTypewriterDone] = React.useState(false)
  const [explosionFinished, setExplosionFinished] = React.useState(false)
  const [cameraZoomFinished, setCameraZoomFinished] = React.useState(false)
  const [headerVisible, setHeaderVisible] = React.useState(false)
  // Camera position state for zoom animation
  // Responsive initial camera position
  const initialCameraZ = window.innerWidth < 600 ? 16 : 18;
  const [cameraPos, setCameraPos] = React.useState<[number, number, number]>([0, 0, initialCameraZ])
  const [cameraTarget] = React.useState<[number, number, number]>([0, 0, 0])

  // Simulate loading time
  React.useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(loadingTimer)
  }, [])

  // Start camera zoom with proper delay after explosion starts
  function handleExplodeStart() {
    // Give the explosion 0.4 seconds to establish before starting camera movement
    setTimeout(() => {
      const startPos = new THREE.Vector3(...cameraPos)
      const endPos = new THREE.Vector3(0, 0, 7)
      const duration = 1.5 // Smooth zoom duration
      const fps = 60
      const totalFrames = duration * fps
      let frame = 0
      
      const animateCamera = () => {
        frame++
        const t = Math.min(frame / totalFrames, 1)
        // Use smooth easing function
        const alpha = t * t * (3 - 2 * t)
        const newPos = startPos.clone().lerp(endPos, alpha)
        setCameraPos([newPos.x, newPos.y, newPos.z])
        
        if (t < 1) {
          requestAnimationFrame(animateCamera)
        } else {
          setShowUI(true)
          setTimeout(() => setHeaderVisible(true), 100)
          setCameraZoomFinished(true)
        }
      }
      animateCamera()
    }, 400) // Wait for explosion to establish trajectory
  }

  function handleExplodeComplete() {
    setExplosionFinished(true)
    console.log('Explosion animation completed')
  // Unmount Typewriter3D only after both explosion and camera zoom are finished
  React.useEffect(() => {
    if (explosionFinished && cameraZoomFinished) {
      setTypewriterDone(true)
    }
  }, [explosionFinished, cameraZoomFinished])
  }

  // Listen for 'r' key to trigger camera reset
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        handleCameraReset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (activeModal) {
      setShowModal(false)
      setTimeout(() => setShowModal(true), 10)
    } else {
      setShowModal(false)
    }
  }, [activeModal])

  const openModal = (section: string) => {
    setActiveModal(section)
    setIsMobileMenuOpen(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setTimeout(() => setActiveModal(null), 300)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCameraReset = () => {
    const controls = controlsRef.current
    if (controls && controls.object) {
      const camera = controls.object
      const startPos = camera.position.clone()
      const endPos = new THREE.Vector3(0, 0, 7)
      const startTarget = controls.target.clone()
      const endTarget = new THREE.Vector3(0, 0, 0)
      let t = 0
      const duration = 1.2
      const fps = 60
      const totalFrames = duration * fps
      
      function smoothstep(x: number) {
        return x * x * (3 - 2 * x)
      }
      
      function animate() {
        t++
        const linearAlpha = Math.min(1, t / totalFrames)
        const alpha = smoothstep(linearAlpha)
        camera.position.lerpVectors(startPos, endPos, alpha)
        controls.target.lerpVectors(startTarget, endTarget, alpha)
        controls.update()
        if (linearAlpha < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }

  const handleInteractionStart = () => {
    setAutoRotate(false)
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
    }
  }

  const handleInteractionEnd = () => {
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    interactionTimeout.current = setTimeout(() => {
      setAutoRotate(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <LoadingScreen isVisible={isLoading} />
      
      {/* Header - only show when UI should be visible */}
      {showUI && (
        <header
          className={`fixed top-0 left-0 w-full z-[101] bg-[#2a1d4d]/80 backdrop-blur-sm transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="relative group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-300 tracking-wider transition-all duration-500 cursor-default select-none mt-2 mb-2"
                     style={{ 
                       fontFamily: "'PlanetoidX', 'Orbitron', 'Montserrat', 'Poppins', sans-serif"
                     }}>
                  Dominic
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <nav className="flex space-x-8">
                  {['About', 'Experience', 'Projects', 'Hobbies'].map((item, index) => (
                    <button
                      key={item}
                      onClick={() => openModal(item.toLowerCase())}
                      className="relative text-[#edeafd] hover:text-[#7e8bf5] transition-all duration-300 font-medium tracking-wide group cursor-pointer px-1 text-[1.15rem]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="relative z-10 transition-colors duration-300 inline-block">
                        {item}
                      </span>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-[#7e8bf5] transition-all duration-300"></div>
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 group hover:scale-110 transition-transform duration-300 cursor-pointer"
                  aria-label="Toggle mobile menu"
                >
                  <span className={`w-6 h-0.5 bg-purple-200 transition-all duration-500 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`w-6 h-0.5 bg-purple-200 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`w-6 h-0.5 bg-purple-200 transition-all duration-500 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300" onClick={toggleMobileMenu} />
          <div className="absolute top-20 left-4 right-4 max-w-sm mx-auto animate-in slide-in-from-top-5 duration-500">
            <div className="bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-800/90 backdrop-blur-md border border-purple-400/20 rounded-2xl p-6 shadow-lg">
              <button
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 text-purple-200 hover:text-purple-100 transition-all duration-300 hover:rotate-90 cursor-pointer"
              >
                <X size={20} />
              </button>

              <nav className="space-y-4 mt-2">
                {["About", "Experience", "Projects", "Hobbies"].map((item, index) => (
                  <button
                    key={item}
                    onClick={() => openModal(item.toLowerCase())}
                    className="flex items-center w-full text-left text-purple-200 hover:text-pink-200 transition-all duration-300 font-medium tracking-wide py-3 px-2 hover:bg-purple-800/20 rounded-lg group transform hover:translate-x-1 cursor-pointer"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <span className="text-purple-300 font-bold mr-3 transition-transform duration-300">{index + 1}.</span>
                    <span>{item}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-300">→</div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Reset button - only show when UI is visible */}
      {showUI && (
        <button
          onClick={handleCameraReset}
          className={`fixed top-21 right-2 z-30 cursor-pointer p-3 bg-purple-600/20 hover:bg-purple-500/30 border border-purple-400/30 hover:border-purple-300/50 rounded-xl group text-purple-200 hover:text-purple-100 backdrop-blur-md shadow-lg transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}
          title="Reset Camera View"
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      )}

      {/* Main 3D content - always rendered, loading screen overlays */}
      <main className="fixed inset-0 z-10 w-full h-full">
        {(() => {
          // Responsive FOV for camera
          let fov = 55;
          if (window.innerWidth < 600) fov = 80;
          return (
            <Canvas
              camera={{ position: [0, 0, initialCameraZ], fov }}
              className="w-full h-full"
              style={{ background: 'transparent' }}
            >
              <AnimatedCamera position={cameraPos} />
              {/* Typewriter animation - keep mounted until explosion is done */}
              {!isTypewriterDone && (
                <Typewriter3D
                  onExplodeStart={handleExplodeStart}
                  onExplodeComplete={handleExplodeComplete}
                />
              )}
              {/* All scene elements - always loaded and rendered properly */}
              <Stars 
                radius={100} 
                depth={60} 
                count={1800} 
                factor={4} 
                saturation={0} 
                fade 
                speed={0.5}
              />
              <StarsPoints count={2200} />
              <LowPolyPlanetEarth position={[0, -2.7, 0]} scale={[2.2, 2.2, 2.2]} />
              {/* Render all landmarks attached to the Earth */}
              {LANDMARKS.map((lm, i) => (
                <Landmark
                  key={i}
                  model={lm.model}
                  position={lm.position}
                  tab={lm.tab}
                  onClick={openModal}
                  scale={lm.scale}
                  rotation={lm.rotation}
                />
              ))}
              <Galaxy />
              <Galaxy2 />
              <Galaxy3 />
              <Nebula />
              <Nebula2 />
              <Planet1 />
              <Planet2 />
              <Planet3 />
              <Planet4 />
              <Moon />
              <Rocket />
              <Satellite />
              <UFO />
              <Asteroids />
              <Blackhole />
              <Goose />
              {/* Improved lighting for vibrancy and brightness */}
              <ambientLight intensity={0.62} color="#e0e7ff" />
              <directionalLight position={[12, 18, 8]} intensity={2.8} color="#aee" castShadow />
              <directionalLight position={[-8, -12, -10]} intensity={1.7} color="#7e8bf5" />
              <directionalLight position={[0, 12, 12]} intensity={1.2} color="#ffe066" />
              <directionalLight position={[0, -18, -12]} intensity={1.1} color="#ff6f91" />
              <ambientLight intensity={0.45} color="#b8c0ff" />
              <pointLight position={[-12, 20, -60]} intensity={3.2} color="#9d4edd" distance={120} decay={1.2} />
              <pointLight position={[36, -12, 80]} intensity={2.7} color="#7209b7" distance={110} decay={1.2} />
              <pointLight position={[0, -65, 5]} intensity={4.0} color="#c77dff" distance={60} decay={1.4} />
              <pointLight position={[0, -2.7, 0]} intensity={2.2} color="#4cc9f0" distance={22} decay={1.7} />
              <pointLight position={[0, 8, 0]} intensity={1.7} color="#ffe066" distance={18} decay={1.5} />
              <directionalLight position={[-15, -8, -12]} intensity={0.7} color="#9d4edd" />
              <directionalLight position={[8, -15, 8]} intensity={0.5} color="#6a4c93" />
              <spotLight
                position={[0, 12, 8]}
                angle={0.55}
                penumbra={0.9}
                intensity={3.2}
                color="#fff8e1"
                distance={28}
                castShadow
                target-position={[0, -2.7, 0]}
              />
              {/* Only enable controls when UI is visible */}
              {showUI && (
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.5}
                  maxDistance={10}
                  minDistance={3.5}
                  target={cameraTarget}
                  onStart={handleInteractionStart}
                  onEnd={handleInteractionEnd}
                />
              )}
              {/* Drei Preload for materials/textures */}
              <Preload all />
            </Canvas>
          );
        })()}
      </main>

      {/* Modal popups */}
      {activeModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-500 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={`bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-800/90 backdrop-blur-md border border-purple-400/20 rounded-2xl p-8 max-w-2xl w-full mx-4 relative shadow-lg transition-all duration-500 ${showModal ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-purple-200 hover:text-purple-100 transition-all duration-300 hover:rotate-90 z-10 cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className={`transition-all duration-700 delay-100 ${showModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              {activeModal === "about" && (
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">
                    About Me
                  </h2>
                  <div className="text-purple-100 space-y-4 leading-relaxed">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, euismod tincidunt nisi nisl euismod.</p>
                    <p>Morbi non urna euismod, tincidunt nisi eu, aliquam enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
                  </div>
                </div>
              )}

              {activeModal === "experience" && (
                <div>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">
                    Experience
                  </h2>
                  <div className="text-purple-100 space-y-6">
                    <div className="border-l-2 border-purple-400/60 pl-6 hover:border-pink-300/60 transition-all duration-300 group cursor-pointer">
                      <h3 className="text-2xl font-semibold text-purple-200 group-hover:text-pink-200 transition-colors duration-300">Lorem Ipsum</h3>
                      <p className="text-purple-300 text-lg">Lorem Company • 2022 - Present</p>
                      <p className="mt-3 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.
                      </p>
                    </div>
                    <div className="border-l-2 border-purple-400/60 pl-6 hover:border-pink-300/60 transition-all duration-300 group cursor-pointer">
                      <h3 className="text-2xl font-semibold text-purple-200 group-hover:text-pink-200 transition-colors duration-300">Dolor Sit</h3>
                      <p className="text-purple-300 text-lg">Ipsum Startup • 2020 - 2022</p>
                      <p className="mt-3 leading-relaxed">
                        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === "projects" && (
                <div>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">
                    Projects
                  </h2>
                  <div className="text-purple-100 space-y-6">
                    <div className="bg-purple-800/20 rounded-lg p-6 border border-purple-400/15 hover:border-pink-300/30 hover:bg-purple-700/25 transition-all duration-300 group cursor-pointer">
                      <h3 className="text-2xl font-semibold text-purple-200 mb-3 group-hover:text-pink-200 transition-colors duration-300">Lorem Dashboard</h3>
                      <p className="leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                    <div className="bg-purple-800/20 rounded-lg p-6 border border-purple-400/15 hover:border-pink-300/30 hover:bg-purple-700/25 transition-all duration-300 group cursor-pointer">
                      <h3 className="text-2xl font-semibold text-purple-200 mb-3 group-hover:text-pink-200 transition-colors duration-300">Ipsum Chat App</h3>
                      <p className="leading-relaxed">
                        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                      </p>
                    </div>
                    <div className="bg-purple-800/20 rounded-lg p-6 border border-purple-400/15 hover:border-pink-300/30 hover:bg-purple-700/25 transition-all duration-300 group cursor-pointer">
                      <h3 className="text-2xl font-semibold text-purple-200 mb-3 group-hover:text-pink-200 transition-colors duration-300">Dolor Commerce</h3>
                      <p className="leading-relaxed">Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === "hobbies" && (
                <div>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">
                    Hobbies & Interests
                  </h2>
                  <div className="text-purple-100 space-y-5">
                    <div className="flex items-center space-x-4 group cursor-pointer hover:text-pink-100 transition-colors duration-300">
                      <div className="w-3 h-3 bg-purple-300 rounded-full group-hover:bg-pink-300 transition-colors duration-300 shadow-sm"></div>
                      <span className="text-lg leading-relaxed">Lorem ipsum dolor sit amet</span>
                    </div>
                    <div className="flex items-center space-x-4 group cursor-pointer hover:text-pink-100 transition-colors duration-300">
                      <div className="w-3 h-3 bg-indigo-300 rounded-full group-hover:bg-pink-300 transition-colors duration-300 shadow-sm"></div>
                      <span className="text-lg leading-relaxed">Consectetur adipiscing elit</span>
                    </div>
                    <div className="flex items-center space-x-4 group cursor-pointer hover:text-pink-100 transition-colors duration-300">
                      <div className="w-3 h-3 bg-pink-300 rounded-full group-hover:bg-purple-300 transition-colors duration-300 shadow-sm"></div>
                      <span className="text-lg leading-relaxed">Etiam euismod urna eu tincidunt</span>
                    </div>
                    <div className="flex items-center space-x-4 group cursor-pointer hover:text-pink-100 transition-colors duration-300">
                      <div className="w-3 h-3 bg-blue-300 rounded-full group-hover:bg-pink-300 transition-colors duration-300 shadow-sm"></div>
                      <span className="text-lg leading-relaxed">Pellentesque habitant morbi tristique senectus</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}