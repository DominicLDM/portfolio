import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useState, useEffect, useRef } from "react"
import { X, RotateCcw } from "lucide-react"
import * as THREE from 'three'
import { useMemo } from 'react'

import LowPolyPlanetEarth from './models/LowPolyPlanetEarth'
import { useGLTF } from '@react-three/drei'

// Goose model
function Goose(props: any) {
  const { scene } = useGLTF('/models/Goose.glb')
  // Tilt the goose: pitch (x), yaw (y), roll (z)
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
// Blackhole model
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
      rotation={[0, Math.PI * 0.5, Math.PI * 0.18]}
      {...props}
    />
  )
}
function Galaxy(props: any) {
  const { scene } = useGLTF('/models/galaxy.glb')
  return (
    <primitive
      object={scene}
      position={[-12, 20, -60]}
      scale={[5, 5, 5]}
      rotation={[0, Math.PI * 0.2, 0]}
      {...props}
    />
  )
}

// Minimal Asteroids
function Asteroids() {
  // Generate asteroid positions once to avoid popping
  type Asteroid = {
    position: [number, number, number]
    scale: number
    rotation: [number, number, number]
  }
  const asteroids = useMemo(() => {
    const arr: Asteroid[] = []
    let tries = 0
    while (arr.length < 40 && tries < 400) {
      // Spherical shell distribution
      const r = 18 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      // Avoid spawning too close to center
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

// Multi-layered subtle stars

function StarsPoints({ count = 1200 }) {
  // Smaller, more numerous, more colorful stars
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
      // Color: random pastel or bright
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

// Loading screen component
interface LoadingScreenProps {
  isVisible: boolean;
}
function LoadingScreen({ isVisible }: LoadingScreenProps) {
  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center">
        {/* Animated planet loading icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-purple-600/30 border-t-purple-400 animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-pink-500/30 border-b-pink-400 animate-spin animate-reverse m-auto"></div>
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 m-auto animate-pulse"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Loading Universe...
        </h2>
        
        {/* Progress dots */}
        <div className="flex space-x-2 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SpacePortfolio() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const interactionTimeout = useRef<number | null>(null)
  const controlsRef = useRef<any>(null)

  // Listen for 'r' key to trigger camera reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        handleCameraReset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Simulate loading time
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setIsLoaded(true), 100)
    }, 2000) // 2 second loading time

    return () => clearTimeout(loadingTimer)
  }, [])

  useEffect(() => {
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
      const endPos = { x: 0, y: 0, z: 7 }
      const startTarget = controls.target.clone()
      const endTarget = { x: 0, y: 0, z: 0 }
      let t = 0
      const duration = 1.2 // seconds
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
    }, 3000) // Resume after 3 seconds of inactivity
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Loading screen always above everything */}
      <LoadingScreen isVisible={isLoading} />
      {/* Header always on top, above modals and main content */}
      <header className={`fixed top-0 left-0 w-full z-[101] bg-[#2a1d4d]/80 backdrop-blur-sm transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}> 
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Wordmark */}
            <div className="relative group">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-300 tracking-wider transition-all duration-500 cursor-default select-none mt-2 mb-2"
                   style={{ 
                     fontFamily: "'PlanetoidX', 'Orbitron', 'Montserrat', 'Poppins', sans-serif"
                   }}>
                Dominic
              </div>
            </div>

            {/* Desktop nav only */}
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

            {/* Mobile menu button only */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 group hover:scale-110 transition-transform duration-300 cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                <span
                  className={`w-6 h-0.5 bg-purple-200 transition-all duration-500 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`w-6 h-0.5 bg-purple-200 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`w-6 h-0.5 bg-purple-200 transition-all duration-500 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

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

      {/* Floating camera reset button */}
      <button
        onClick={handleCameraReset}
        className="fixed top-21 right-2 z-30 cursor-pointer p-3 bg-purple-600/20 hover:bg-purple-500/30 border border-purple-400/30 hover:border-purple-300/50 rounded-xl transition-all duration-300 group text-purple-200 hover:text-purple-100 backdrop-blur-md shadow-lg"
        title="Reset Camera View"
      >
        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {/* Main 3D content */}
      <main className="fixed inset-0 z-10 w-full h-full transition-all duration-1000">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 55 }}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[12, 18, 8]} intensity={1.3} color="#aee" castShadow />
          <directionalLight position={[-8, -12, -10]} intensity={0.7} color="#7e8bf5" />
          {/* Dark space ambient with purple tint */}
          <ambientLight intensity={0.3} color="#1a0b2e" />
          

          {/* Intense purple galaxy glows */}
          <pointLight position={[-12, 20, -60]} intensity={2.2} color="#9d4edd" distance={80} decay={1.5} />
          <pointLight position={[36, -12, 80]} intensity={1.7} color="#7209b7" distance={70} decay={1.5} />
          
          {/* Blackhole purple rim */}
          <pointLight position={[0, -65, 5]} intensity={3.0} color="#c77dff" distance={40} decay={1.8} />
          
          {/* Earth cyan glow */}
          <pointLight position={[0, -2.7, 0]} intensity={1.1} color="#4cc9f0" distance={12} decay={2} />
          
          {/* Purple fill lights */}
          <directionalLight position={[-15, -8, -12]} intensity={0.3} color="#9d4edd" />
          <directionalLight position={[8, -15, 8]} intensity={0.2} color="#6a4c93" />
          <spotLight
            position={[0, 8, 6]}
            angle={0.45}
            penumbra={0.7}
            intensity={2.2}
            color="#fff8e1"
            distance={18}
            castShadow
            target-position={[0, -2.7, 0]}
          />
          {/* Minimal depth elements */}
          <Stars radius={100} depth={60} count={1800} factor={4} saturation={0} fade speed={0.5} />
          <StarsPoints count={2200} />
          <Galaxy />
          <Galaxy2 />
          <Asteroids />
          <Blackhole />
          <Goose />
          <LowPolyPlanetEarth position={[0, -2.7, 0]} scale={[2.2, 2.2, 2.2]} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            maxDistance={10}
            minDistance={2}
            onStart={handleInteractionStart}
            onEnd={handleInteractionEnd}
          />
          // ...existing code...
        </Canvas>
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