import { useState, useEffect, useRef } from "react"
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import LowPolyPlanetEarth from './models/LowPolyPlanetEarth'
import { X } from "lucide-react"

export default function SpacePortfolio() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsLoaded(true)
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* cosmic background visuals */}
      <div className="absolute inset-0">
        {/* twinkling stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* purple galaxy blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/20 via-purple-400/30 to-indigo-600/20 blur-3xl animate-pulse" />
        </div>

        {/* extra space blobs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
      </div>

      <header className={`relative z-50 bg-[#1a1333] transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
  <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* wordmark */}
            <div className="relative group">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-300 tracking-wider transition-all duration-500 cursor-default select-none mt-2 mb-2"
                   style={{ 
                     fontFamily: "'PlanetoidX', 'Orbitron', 'Montserrat', 'Poppins', sans-serif"
                   }}>
                Dominic
              </div>
            </div>

            {/* desktop nav links */}
            <nav className="hidden md:flex space-x-8">
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

            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 group hover:scale-110 transition-transform duration-300 cursor-pointer"
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
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-300">
          {/* mobile menu overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300" onClick={toggleMobileMenu} />

          {/* mobile menu content */}
          <div className="absolute top-20 left-4 right-4 max-w-sm mx-auto animate-in slide-in-from-top-5 duration-500">
            <div className="bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-800/90 backdrop-blur-md border border-purple-400/20 rounded-2xl p-6 shadow-lg">
              {/* close menu button */}
              <button
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 text-purple-200 hover:text-purple-100 transition-all duration-300 hover:rotate-90 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* nav links for mobile */}
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

      {/* main content area - immersive 3D scene */}
      <main className="fixed inset-0 z-10 w-full h-full transition-all duration-1000">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 60 }}
          className="w-full h-full"
          style={{ background: '#000' }}
        >
          {/* Improved Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-5, -10, -7]} intensity={0.7} color="#7e8bf5" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          {/* Centered Model */}
          <LowPolyPlanetEarth position={[0, -2.6, 0]} scale={[2.2, 2.2, 2.2]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            maxDistance={10}
            minDistance={2}
            onStart={() => {
              setAutoRotate(false);
              if (interactionTimeout.current) {
                clearTimeout(interactionTimeout.current);
              }
            }}
            onEnd={() => {
              if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
              interactionTimeout.current = setTimeout(() => setAutoRotate(true), 3000) // 3 seconds
            }}
          />
        </Canvas>
      </main>

      {/* modal popups for sections */}
      {activeModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-500 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className={`bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-800/90 backdrop-blur-md border border-purple-400/20 rounded-2xl p-8 max-w-2xl w-full mx-4 relative shadow-lg transition-all duration-500 ${showModal ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            {/* close modal button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-purple-200 hover:text-purple-100 transition-all duration-300 hover:rotate-90 z-10 cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* modal content */}
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
                      <span className="text-lg leading-relaxed">Pellentesque habitant morbi tristique</span>
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