import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Github, ChevronLeft, ChevronRight } from 'lucide-react'
import { EffectComposer, Vignette, HueSaturation } from '@react-three/postprocessing'
import { Preload } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, Stars } from '@react-three/drei'
import { useThree } from "@react-three/fiber"
import { X, RotateCcw } from "lucide-react"
import * as THREE from 'three'
import { getSelectionRects } from 'troika-three-text'
import LowPolyPlanetEarth from './models/LowPolyPlanetEarth'

// Utility functions for coordinate conversion
const DEG_TO_RAD = Math.PI / 180;

declare global {
  interface Window {
    __typewriterInitialDelay?: number;
  }
}

const useImagePreloader = (imageUrls: string[]) => {
  const preloadImages = useCallback(() => {
    if (imageUrls.length === 0) return;
    
    // Silently preload all images
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url; // Just set the src, no callbacks needed
    });
  }, [imageUrls]);

  return { preloadImages };
};

// Hobby data types
type HobbyKey = 'music' | 'theatre' | 'photos' | 'cities' | 'gaming' | 'skiing';
type HobbyInfo = {
  title: string;
  images: string[];
  description: string;
  imageDescriptions?: string[];
};

const hobbyData: Record<HobbyKey, HobbyInfo> = {
  music: {
    title: 'Music',
    images: ['/music/phoneboy.jpg', '/music/boyphone.jpg', '/music/rob.jpg', '/music/valley.jpg', '/music/wrecks.jpg', '/music/goodkid.jpg', '/music/bwu.jpg', '/music/hey.jpg', '/music/alec.jpg'],
    description: "Check out my playlist or the concerts I've been to!",
    imageDescriptions: ['Phoneboy Heartbreak Designer in Toronto!', 'W', 'I saw a band called Valley <3', 'SE concert!!', 'The Wrecks in Montreal', 'Good Kid!!', 'BoyWithUke without the mask', 'Hey, Nothing', "Alec Benjamin"],
  },
  theatre: {
    title: 'Theatre',
    images: ['/bway/playbillwall.jpg', '/bway/hadestown2.jpg', '/bway/parade.jpg', '/bway/kimberly.jpg', '/bway/sweeney.jpg', '/bway/gaten.jpg', '/bway/strange loop.jpg', '/bway/comefromaway.jpg', '/bway/hadestown1.jpg', '/bway/mormon.jpg', '/bway/beetlejuice.jpg', '/bway/signedhadestown.jpg', '/bway/signedkim.jpg'],
    description: "I LOVE musical theatre! I've seen 9 shows on Broadway, and the magic never fades!",
    imageDescriptions: [
      'My Playbill wall!! My favs are Hadestown, Fun Home, and Amélie!',
      'My first time at Hadestown, jaw-droppingly good.',
      'Parade!! Ben Platt and Micaela Diamond are PHENOMENAL.',
      'Kimberly Akimbo, the only show to make me want to live in New Jersey.',
      'Sweeney Todd with the incredible Josh Groban! Absolutely stacked cast.',
      'Gaten Matarazzo signing my Playbill!!',
      'A Strange Loop. So strange, so powerful, so Broadway.',
      'Come From Away, so so so heartwarming!',
      'Hadestown again, (can you tell I love this show)',
      'I believeeee that the Book of Mormon is a tad silly.',
      'Beetlejuice Beetlejuice Beetlejuice.',
      'Signed Hadestown Playbill!!',
      'Signed Kimberly Akimbo Playbill!!'
      
    ]
  },
  photos: {
    title: 'Cool photos!',
    images: ['/pics/enoshima.jpg', '/pics/fuji.jpg', '/pics/arctic.jpg', '/pics/spike.jpg', '/pics/aurora.jpg', '/pics/swan.jpg', '/pics/shrine.jpg', '/pics/poutine.jpg', '/pics/island.jpg', '/pics/chow.jpg', '/pics/bamboo.jpg', '/pics/dp.jpg', '/pics/train.jpg', '/pics/tree.jpg', '/pics/goat.jpg', '/pics/nice.jpg', '/pics/lights.jpg', '/pics/speaker.jpg', '/pics/water.jpg', '/pics/turtle.jpg', '/pics/coolio.jpg', '/pics/night.jpg', '/pics/vibes.jpg', '/pics/taleng.jpg', '/pics/robot.jpg', '/pics/slush.jpg', '/pics/wall.png', '/pics/tower.jpg', '/pics/tori.jpg', '/pics/peace.jpg', '/pics/stairs.jpg', '/pics/me.jpg', '/pics/cool.jpg', '/pics/ice.jpg'],
    description: 'Fun memories and nice photos I\'ve taken over the years :)',
    imageDescriptions: [
      'Japanese sunset over Enoshima and Fuji',
      'Fujisan',
      'Iced over Georgian Bay',
      'Vieux Montreal',
      'Waterloo Aurora',
      'Swan let me get so close!',
      'So green',
      'POUTINE POUTINE POUTINE',
      'Pretty Japanese coastline',
      'Olivia Chow!',
      'Bamboo',
      'My fav building on campus',
      'Shinjuku Station',
      'Very natural tree',
      'Unreal',
      'Also unreal',
      'Chicago airport',
      'Speaker legend!',
      'Drifting',
      'Apparently this guy is famous??',
      'Columbia Lake',
      'DP at night',
      'Lake Fujikawaguchi',
      'Taleng',
      'FRC',
      'SLUSHIES!',
      'O-week',
      'Tokyo Tower',
      'The best Tori gate',
      'Middle of nowhere',
      'Stairs',
      'Spontaneous Japan trip was worth it',
      'neato',
      'a bit chilly'


    ]
  },
  cities: {
    title: 'Cities',
    images: ['/city/trono2.jpg', '/city/shibuya.jpg', '/city/mtl.jpg', '/city/edge.jpg', '/city/neon.jpg', '/city/one.jpg', '/city/shibuya2.jpg', '/city/swan.jpg', '/city/wtc.jpg', '/city/skytree.jpg', '/city/rain.jpg', '/city/large.jpg', '/city/glow.jpg', '/city/azubadai.jpg', '/city/endless.jpg', '/city/happy.jpg', '/city/harajuku.jpg', '/city/moon.jpg', '/city/oly.jpg', '/city/rock.jpg', '/city/yourname.jpg', '/city/trono.jpg', '/city/tall.jpg', '/city/nuns.jpg', '/city/doof.jpg', '/city/ike.jpg', '/city/market.jpg', '/city/rain2.jpg', '/city/rain3.jpg', '/city/rain4.jpg', '/city/shinjuku.jpg', '/city/square.jpg'],
    description: 'I\'m super into skylines, transit, and everything in between.',
    imageDescriptions: [
      'Toronto skyline is perfection',
      'Shibuya Sky!',
      'Mont Royal',
      'On the Edge',
      'Rainy Akhibara nights',
      'The One',
      'pretty colours',
      'swan!',
      'Beautiful building',
      'I swear it\'s the CN tower',
      'Asakusa streets',
      'Billionaire\'s Row',
      'purple',
      'Azabudai Hills',
      'New York core',
      'Top tier sunset',
      'Harajuku!',
      'Blood moon over Montreal',
      'Olympic Village',
      'Midtown',
      'Kimi no Na Wa',
      'colours',
      'Funky architecture',
      'Nun\'s Island',
      'Doofenschmirtz Evil Inc.',
      'Ikebukuro',
      'silly sign',
      'rain',
      'more rain',
      'can you tell I like rainy nights',
      'shinjuku',
      'scramble'

      
    ]
  },
  gaming: {
    title: 'Esports',
    images: ['/esports/fnatic.jpg', '/esports/toronto.jpg', '/esports/optic.jpg', '/esports/stage.jpg', '/esports/trophy.jpg', '/esports/benja.jpg', '/esports/shaiiko.jpg', '/esports/noaura.jpg', '/esports/w7m.jpg'],
    description: "Whether it's watching or playing, I'm a huge fan of competitive gaming.",
    imageDescriptions: [
      'Watching Fnatic at VCT Masters Toronto!',
      '7 hour train ride was worth it!',
      'COD Champs in Kitchener, the Green Wall made it entertaining!',
      'Rainbow Six Siege in Montreal, the atmosphere was incredible (and chilly)!',
      "Dope trophy",
      "Me with Benjamaster!",
      "Shaiiko after their unfortunate loss :(",
      "I need to go to more LANs",
      "w7m beating the home crowd was awesome!"
    ]
  },
  skiing: {
    title: 'Skiing',
    images: ['/skiing/omg.jpg', '/skiing/omd.jpg', '/skiing/pezants.jpg', '/skiing/trio.jpg', '/skiing/insane.jpg', '/skiing/massif.jpg', '/skiing/msa.jpg', '/skiing/sleepy.jpg', '/skiing/nice.jpg', '/skiing/river.jpg'],
    description: 'Fun fact: I\'ve skied since I was 2 years old!',
    imageDescriptions: [
      'Le Massif, the best day I\'ve ever skied',
      'Cheeky triple black',
      'Software Engineers go skiing!',
      'Sending it with friends',
      'Gorgeous view',
      'I lost my phone 10 minutes later',
      'Mont Saint Anne in the fog!',
      'Sleepy on the bunny hill',
      'Tremblant but make it Ontario',
      'Quebec > BC'
    ]
  }
}

function MobileImageGallery({ 
  images, 
  descriptions, 
  title,
  shrink
}: {
  images: string[];
  descriptions: string[];
  title: string;
  shrink: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the simple preloader hook (same as desktop)
  const { preloadImages } = useImagePreloader(images);

  // Silently preload all images when component mounts (same as desktop)
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Preload adjacent images for smoother navigation (same as desktop)
  useEffect(() => {
    if (images.length <= 1) return;
    
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    [nextIndex, prevIndex].forEach(index => {
      const img = new Image();
      img.src = images[index];
    });
  }, [currentIndex, images]);

  const nextImage = () => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const prevImage = () => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Main image area with overlay navigation */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        {/* Navigation buttons */}
        <button
          onClick={prevImage}
          disabled={isTransitioning || images.length <= 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 
                     p-2 bg-black/60 hover:bg-black/80 
                     border border-white/20 hover:border-purple-300/50 
                     rounded-full text-white/80 hover:text-purple-200 
                     transition-all duration-200 backdrop-blur-sm
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:scale-105 disabled:hover:scale-100
                     shadow-md"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        <button
          onClick={nextImage}
          disabled={isTransitioning || images.length <= 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 
                     p-2 bg-black/60 hover:bg-black/80 
                     border border-white/20 hover:border-purple-300/50 
                     rounded-full text-white/80 hover:text-purple-200 
                     transition-all duration-200 backdrop-blur-sm
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:scale-105 disabled:hover:scale-100
                     shadow-md"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>

        {/* Maximized image container */}
        <div 
          ref={containerRef}
          className={`relative w-full h-full max-w-[calc(100vw-60px)]
                        flex items-center justify-center px-6 
                        ${shrink ? "max-h-[calc(75svh-100px)]" : "max-h-[calc(75svh-80px)]"}`}
        >
          {/* Main image with optimized sizing */}
          <div className="relative w-full h-full rounded-xl overflow-hidden
                         bg-gradient-to-br from-purple-900/15 to-indigo-900/15 
                         border border-purple-400/25">
            <img
              src={images[currentIndex]}
              alt={`${title} - ${descriptions[currentIndex] || "Image"}`}
              className={`w-full h-full object-contain transition-all duration-300 ${
                isTransitioning 
                  ? "opacity-0 scale-105" 
                  : "opacity-100 scale-100"
              }`}
            />

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 
                             bg-black/70 backdrop-blur-sm 
                             border border-white/15 rounded-lg 
                             px-2 py-1 text-white/90 text-xs font-medium
                             shadow-sm">
                {currentIndex + 1}/{images.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact description section */}
      <div className="flex-shrink-0 flex items-start justify-center px-2 pt-3 pb-3">
        <p className="text-purple-200/90 text-sm leading-snug 
                      text-center max-w-full break-words line-clamp-2">
          {descriptions[currentIndex] || `${title} image ${currentIndex + 1}`}
        </p>
      </div>
    </div>
  );
}

// Desktop Image Gallery Component
function DesktopImageGallery({ 
  images, 
  descriptions, 
  title,
  shrink
}: {
  images: string[];
  descriptions: string[];
  title: string;
  shrink: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the simple preloader hook
  const { preloadImages } = useImagePreloader(images);

  // Silently preload all images when component mounts
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Preload adjacent images for even smoother navigation
  useEffect(() => {
    if (images.length <= 1) return;
    
    // Silently preload next and previous images
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    [nextIndex, prevIndex].forEach(index => {
      const img = new Image();
      img.src = images[index];
    });
  }, [currentIndex, images]);

  // Get container dimensions
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        // Get the modal container
        const modal = containerRef.current.closest('[class*="max-w"]');
        let availableWidth = window.innerWidth * 0.9;
        let availableHeight = window.innerHeight * 0.9;
        
        if (modal) {
          const rect = modal.getBoundingClientRect();
          availableWidth = rect.width;
          availableHeight = rect.height;
        }
        
        // Reserve space for description and buttons
        const descriptionSpace = window.innerWidth < 768 ? 60 : 50;
        const buttonSpace = window.innerWidth < 768 ? 70 : 80;
        
        // FIXED: Account for navigation arrows taking up space
        const arrowSpace = window.innerWidth < 600 ? 100 : 120; // Space for left + right arrows + gaps
        
        setContainerSize({
          width: availableWidth - buttonSpace - arrowSpace, // Subtract arrow space
          height: availableHeight - descriptionSpace
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Load current image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = images[currentIndex];
  }, [images, currentIndex]);

  const nextImage = () => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const prevImage = () => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  // Calculate image size that fits in available space while preserving aspect ratio
  const imageSize = useMemo(() => {
    if (!imageDimensions || containerSize.width === 0 || containerSize.height === 0) {
      // FIXED: Much smaller fallback for mobile devices
      const fallbackWidth = window.innerWidth < 600 ? Math.min(250, window.innerWidth - 120) : 400;
      const fallbackHeight = window.innerWidth < 600 ? Math.min(188, window.innerHeight * 0.4) : 300;
      return { width: fallbackWidth, height: fallbackHeight };
    }
    
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const aspectRatio = imgWidth / imgHeight;
    
    // Calculate maximum dimensions based on container size
    const maxWidth = containerSize.width;
    const maxHeight = containerSize.height;
    
    // FIXED: Add minimum constraints for very small screens
    const minWidth = window.innerWidth < 600 ? 200 : 300;
    const minHeight = window.innerWidth < 600 ? 150 : 200;
    
    // Calculate size that fits while preserving aspect ratio
    let finalWidth = Math.max(minWidth, Math.min(maxWidth, imgWidth));
    let finalHeight = finalWidth / aspectRatio;
    
    if (finalHeight > maxHeight) {
      finalHeight = Math.max(minHeight, maxHeight);
      finalWidth = finalHeight * aspectRatio;
    }
    
    // FIXED: Ensure we don't exceed screen bounds even with minimums
    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = finalWidth / aspectRatio;
    }
    const scale = shrink ? 0.9 : 1;
    return {
      width: Math.floor(finalWidth * scale),
      height: Math.floor(finalHeight * scale)
    };
  }, [imageDimensions, containerSize]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center"
    >
      {/* Navigation and image container */}
      <div className="flex items-center justify-center gap-2 md:gap-4 w-full h-full">
        {/* Left Arrow */}
        <button
          onClick={prevImage}
          disabled={isTransitioning || images.length <= 1}
          className={`flex-shrink-0 p-2 md:p-2 bg-black/40 hover:bg-black/60 border border-white/20 hover:border-purple-300/50 rounded-full text-white/80 hover:text-purple-200 transition-all duration-300 backdrop-blur-sm z-10 ${
            isTransitioning || images.length <= 1 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110 cursor-pointer'
          }`}
        >
          <ChevronLeft size={20} className="md:w-5 md:h-5" />
        </button>

        {/* Image container - FIXED: Better responsive styling */}
        <div 
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-400/30 transition-all duration-500 flex items-center justify-center flex-shrink-0"
          style={{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
            // FIXED: Remove conflicting max constraints that could cause overflow
            minWidth: window.innerWidth < 600 ? '200px' : '300px',
            minHeight: window.innerWidth < 600 ? '150px' : '200px'
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - ${descriptions[currentIndex] || 'Image'}`}
            className={`w-full h-full object-contain transition-all duration-400 ease-in-out ${
              isTransitioning 
                ? 'opacity-0 scale-105' 
                : 'opacity-100 scale-100'
            }`}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-2 py-1 text-white/90 text-xs md:text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextImage}
          disabled={isTransitioning || images.length <= 1}
          className={`flex-shrink-0 p-2 md:p-2 bg-black/40 hover:bg-black/60 border border-white/20 hover:border-purple-300/50 rounded-full text-white/80 hover:text-purple-200 transition-all duration-300 backdrop-blur-sm z-10 ${
            isTransitioning || images.length <= 1 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110 cursor-pointer'
          }`}
        >
          <ChevronRight size={20} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* Image description */}
      <div className="mt-4 mb-4 md:mb-0 text-center px-2 w-full flex-shrink-0">
        <p className="text-purple-200/90 text-sm md:text-base leading-relaxed max-w-full mx-auto break-words">
          {descriptions[currentIndex] || `${title} image ${currentIndex + 1}`}
        </p>
      </div>
    </div>
  );
}

// Enhanced Spotify Embed Component
function SpotifyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeHeight, setIframeHeight] = useState('352px');

  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return;
      
      // Find the modal container
      const modal = containerRef.current.closest('[style*="max-height"]');
      if (!modal) return;
      
      // Get the actual modal height
      const modalRect = modal.getBoundingClientRect();
      const modalHeight = modalRect.height;
      
      // Find and measure the title section (h2 + p)
      const titleSection = modal.querySelector('h2');
      const descriptionSection = modal.querySelector('h2 + p');
      let titleHeight = 0;
      if (titleSection) titleHeight += titleSection.getBoundingClientRect().height;
      if (descriptionSection) titleHeight += descriptionSection.getBoundingClientRect().height;
      
      // Find and measure tab navigation
      const tabNavigation = modal.querySelector('[class*="bg-purple-800/30"]');
      const tabHeight = tabNavigation ? tabNavigation.getBoundingClientRect().height : 0;
      
      // Account for all the margins and padding
      const modalPadding = 64; // px-4 sm:px-6 md:px-8 lg:px-12 + vertical space
      const spotifyContainerPadding = 32; // p-4 on spotify container
      const spotifyInnerPadding = 40; // p-5 on inner container  
      const spotifyHeaderHeight = 52; // Music icon + title + mb-4
      const margins = 48; // Various margins between elements
      
      const totalUsedSpace = titleHeight + tabHeight + modalPadding + 
                            spotifyContainerPadding + spotifyInnerPadding + 
                            spotifyHeaderHeight + margins;
      
      // Calculate available height for iframe
      const availableHeight = modalHeight - totalUsedSpace;
      let finalHeight;
      if (window.innerWidth <= 375) {
        finalHeight = 250;
      } else if (window.innerWidth > 3000) {
        finalHeight = 750;
      } else if (window.innerWidth > 2560) {
        finalHeight = 500;
      } else {
        finalHeight = Math.max(352, Math.floor(availableHeight));
      }
      setIframeHeight(`${finalHeight}px`);
    };

    // Initial calculation
    setTimeout(calculateHeight, 100); // Small delay to ensure DOM is ready
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);
    
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  return (
    <div ref={containerRef} className="h-[(calc(70svh-100px))] md:max-w-[40vw] max-w-[90vw] w-full flex items-center justify-center py-4 pt-0">
      <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-2xl p-0 border border-green-400/30 backdrop-blur-sm">
        <div className="h-full w-full">
        <iframe
          src="https://open.spotify.com/embed/playlist/3u5OZuYxm9ACE873KRheVC?utm_source=generator"
          frameBorder="0"
          allow="encrypted-media"
          height={iframeHeight}
          width="100%"
          className="rounded-xl shadow-lg"
        />
        </div>
      </div>
    </div>
  );
}

// Main AdaptiveImageGallery component
function AdaptiveImageGallery({ 
  images, 
  descriptions, 
  title,
  shrink
}: {
  images: string[];
  descriptions: string[];
  title: string;
  shrink: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check both user agent and screen size
    const checkIfMobile = () => {
      const ua = window.navigator.userAgent;
      const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);
      const isSmallScreen = window.innerWidth < 768; // Common breakpoint for mobile
      
      setIsMobile(isMobileUA || isSmallScreen);
    };

    // Check initially
    checkIfMobile();
    
    // Add resize listener for responsive changes
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) {
    return <MobileImageGallery images={images} descriptions={descriptions} title={title} shrink={shrink} />;
  } else {
    return <DesktopImageGallery images={images} descriptions={descriptions} title={title} shrink={shrink} />;
  }
}

// HobbiesModal component
function HobbiesModal({ hobby }: { hobby: HobbyKey }) {
  const data = hobbyData[hobby];
  const [activeTab, setActiveTab] = useState<'gallery' | 'playlist'>('gallery');
  
  if (!data) return null;

  // Only show tabs for music hobby
  const showTabs = hobby === 'music';

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full h-full max-h-[calc(100svh-100px)] overflow-y-auto flex flex-col">
      <div className="space-y-6 flex-1 flex flex-col min-h-0">
        {/* Title section */}
        <div className="text-center flex-shrink-0 mb-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl pt-4 md:pt-0 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300">
            {data.title}
          </h2>
          <p className="text-purple-200/90 text-lg max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Tab navigation for music hobby */}
        {showTabs && (
          <div className="flex justify-center mb-4">
            <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-1 border border-purple-400/20">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'gallery' 
                    ? 'bg-purple-600/60 text-white shadow-md' 
                    : 'text-purple-200/80 hover:text-white hover:bg-purple-600/30'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-300 ${
                  activeTab === 'playlist' 
                    ? 'bg-green-200 text-black shadow-md' 
                    : 'text-green-200 hover:text-white hover:bg-green-200/80'
                }`}
              >
                Playlist
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {showTabs && activeTab === 'playlist' ? (
            <SpotifyEmbed />
          ) : (
            <AdaptiveImageGallery 
              images={data.images}
              descriptions={data.imageDescriptions || []}
              title={data.title}
              shrink={showTabs}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function latLonToPosition(
  lat: number, 
  lon: number, 
  radius: number = 2.2, 
  heightOffset: number = 0
): [number, number, number] {
  const phi = (90 - lat) * DEG_TO_RAD; // Convert to spherical coordinates
  const theta = (lon + 180) * DEG_TO_RAD;
  
  const actualRadius = radius + heightOffset;
  
  const x = actualRadius * Math.sin(phi) * Math.cos(theta);
  const y = actualRadius * Math.cos(phi);
  const z = actualRadius * Math.sin(phi) * Math.sin(theta);
  
  return [x, y, z];
}

function getSurfaceRotation(lat: number, lon: number): [number, number, number] {
  const phi = (90 - lat) * DEG_TO_RAD;
  const theta = (lon + 180) * DEG_TO_RAD;
  
  // Calculate rotation to align with surface normal
  const rotX = -phi + Math.PI / 2; // Tilt to match surface angle
  const rotY = theta; // Rotate around Y axis for longitude
  const rotZ = 0; // No roll needed for basic vertical alignment
  
  return [rotX, rotY, rotZ];
}

type RingConfig = {
  radius: number;
  tubeRadius: number;
  yOffset: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  roughness: number;
  metalness: number;
};

type LandmarkCoordinateData = {
  model: string;
  lat: number; // Latitude (-90 to 90)
  lon: number; // Longitude (-180 to 180)
  tab: string;
  scale?: number; // Uniform scale factor
  heightOffset?: number; // Additional height above surface
  customRotation?: [number, number, number]; // Custom rotation override in radians [x, y, z]
  ringConfig?: RingConfig; // Custom ring configuration
  globeRadius?: number; // Optional globe radius for landmark
};

// Landmark component with coordinate-based positioning and customizable rings
function CoordinateLandmark({ 
  model, 
  lat, 
  lon, 
  tab, 
  onClick, 
  scale = 1, 
  heightOffset = 0.3,
  customRotation,
  ringConfig,
  globeRadius = 2.2
}: {
  model: string,
  lat: number,
  lon: number,
  tab: string,
  onClick: (tab: string) => void,
  scale?: number,
  heightOffset?: number,
  customRotation?: [number, number, number],
  ringConfig?: RingConfig,
  globeRadius?: number
}) {
  const { scene } = useGLTF(model)
  const [hovered, setHovered] = useState(false)

  // Calculate position and rotation based on coordinates
  const position = useMemo(() => 
    latLonToPosition(lat, lon, globeRadius, heightOffset), 
    [lat, lon, globeRadius, heightOffset]
  );
  
  const rotation = useMemo(() => 
    customRotation || getSurfaceRotation(lat, lon), 
    [lat, lon, customRotation]
  );

  // Helper to clone the scene for highlight
  const highlightScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#ffe066',
          emissive: '#ffe066',
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.55,
          wireframe: true,
          depthWrite: false
        });
      }
    });
    return clone;
  }, [scene]);

  // Default ring configuration or use provided config
  const defaultRingConfig: RingConfig = {
    radius: 0.65,
    tubeRadius: 0.09,
    yOffset: -0.18,
    color: "#7e8bf5",
    emissive: "#7e8bf5",
    emissiveIntensity: 0.7,
    opacity: 0.82,
    roughness: 0.35,
    metalness: 0.45
  };

  // Use custom ring config or compute from bounding box if no custom config provided
  const [computedRingConfig, setComputedRingConfig] = useState(defaultRingConfig);

  useEffect(() => {
    if (ringConfig) {
      // Use custom ring configuration
      setComputedRingConfig(ringConfig);
    } else if (scene) {
      // Compute ring size from bounding box (original behavior)
      const bbox = new THREE.Box3().setFromObject(scene);
      const size = bbox.getSize(new THREE.Vector3());
      const maxXZ = Math.max(size.x, size.z);
      const center = bbox.getCenter(new THREE.Vector3());
      
      setComputedRingConfig({
        ...defaultRingConfig,
        radius: 0.5 + maxXZ * 0.55 * scale,
        tubeRadius: 0.09 * scale,
        yOffset: (bbox.min.y - center.y) * scale
      });
    }
  }, [scene, scale, ringConfig]);

  // Add a yellow point light for the spotlight landmark only
  const isSpotlight = model === '/models/spotlight.glb';
  return (
    <group position={position} rotation={rotation}>
      {/* Ring positioned relative to the landmark's local coordinate system */}
      <mesh position={[0, computedRingConfig.yOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[computedRingConfig.radius, computedRingConfig.tubeRadius, 32, 64]} />
        <meshStandardMaterial
          color={computedRingConfig.color}
          emissive={computedRingConfig.emissive}
          emissiveIntensity={computedRingConfig.emissiveIntensity}
          transparent
          opacity={computedRingConfig.opacity}
          roughness={computedRingConfig.roughness}
          metalness={computedRingConfig.metalness}
          depthWrite={false}
        />
      </mesh>
      {/* Add yellow point light for spotlight landmark */}
      {isSpotlight && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={1}
          color="#ffe066"
          distance={3.5}
          decay={1.2}
        />
      )}
      {/* Highlight mesh */}
      {hovered && highlightScene && (
        <primitive object={highlightScene.clone()} scale={scale * 1.05} />
      )}
      <primitive
        object={scene}
        scale={[scale, scale, scale]}
        onPointerOver={(e: React.PointerEvent) => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
          e.stopPropagation();
        }}
        onPointerOut={(e: React.PointerEvent) => {
          setHovered(false);
          document.body.style.cursor = '';
          e.stopPropagation();
        }}
        onClick={(e: React.PointerEvent) => { onClick(tab); e.stopPropagation(); }}
      />
    </group>
  )
}

const COORDINATE_LANDMARKS: LandmarkCoordinateData[] = [
  {
    model: '/models/House.glb',
    lat: 137.7128,
    lon: -103.0060,
    tab: 'about',
    scale: 0.8,
    heightOffset: -0.067,
    customRotation: [-0.65, 4,-0.06],
    ringConfig: {
      radius: 0.7,
      tubeRadius: 0.08,
      yOffset: -0.2,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.6,
      opacity: 0,
      roughness: 0.3,
      metalness: 0.5
    }
  },
  {
    model: '/models/Briefcase.glb',
    lat: 40.5074,
    lon: -10.1278,
    tab: 'experience',
    scale: 0.15,
    heightOffset: -0.1,
    customRotation: [1, -0.7, 1], 
    ringConfig: {
      radius: 0.55,
      tubeRadius: 0.06,
      yOffset: -0.15,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.8,
      opacity: 0,
      roughness: 0.4,
      metalness: 0.6
    }
  },
  {
    model: '/models/laptop.glb',
    lat: 52.7749,
    lon: -105.4194,
    tab: 'projects',
    scale: 0.3,
    heightOffset: -0.1,
    customRotation: [0.6, 0, -0.12], 
    ringConfig: {
      radius: 0.8,
      tubeRadius: 0.12,
      yOffset: -0.25,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 1.0,
      opacity: 0,
      roughness: 0.2,
      metalness: 0.7
    }
  },
  {
    model: '/models/skis.glb',
    lat: 85.8182,
    lon: 130.2275,
    tab: 'skiing',
    scale: 0.45,
    heightOffset: -0.2,
    customRotation: [-0.3, 0, 0], // Stand them upright with slight tilt
    ringConfig: {
      radius: 0.3,
      tubeRadius: 0.07,
      yOffset: -0.1,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.5,
      opacity: 0,
      roughness: 0.5,
      metalness: 0.3
    }
  },
  {
    model: '/models/camera.glb',
    lat: -32.6762,
    lon: -145.6503,
    tab: 'photos',
    scale: 1,
    heightOffset: 0.35,
    customRotation: [-0.8, 0, 0.9],
    ringConfig: {
      radius: 0.75,
      tubeRadius: 0.1,
      yOffset: -0.22,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.7,
      opacity: 0,
      roughness: 0.25,
      metalness: 0.8
    }
  },
  {
    model: '/models/controller.glb',
    lat: 5.8688,
    lon: -105.2093,
    tab: 'gaming',
    scale: 0.025,
    heightOffset: 0,
    customRotation: [1.3, 0, -0.3],
    ringConfig: {
      radius: 0.45,
      tubeRadius: 0.05,
      yOffset: -0.12,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.9,
      opacity: 0,
      roughness: 0.6,
      metalness: 0.2
    }
  },
  {
    model: '/models/esb.glb',
    lat: 15.7488,
    lon: -48.9857,
    tab: 'cities',
    scale: 0.035,
    heightOffset: 0,
    customRotation: [0.7, 0.5, 0.7],
    ringConfig: {
      radius: 0.5,
      tubeRadius: 0.08,
      yOffset: -0.4,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.4,
      opacity: 0,
      roughness: 0.8,
      metalness: 0.9
    }
  },
  {
    model: '/models/headphones.glb',
    lat: -20.7558,
    lon: 55.6173,
    tab: 'music',
    scale: 0.7,
    heightOffset: 0.2,
    customRotation: [-1.5, -0.5, 0.7],
    ringConfig: {
      radius: 0.85,
      tubeRadius: 0.11,
      yOffset: -0.18,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 0.6,
      opacity: 0,
      roughness: 0.3,
      metalness: 0.4
    }
  },
  {
    model: '/models/spotlight.glb',
    lat: -10.8566,
    lon: -25.3522,
    tab: 'theatre',
    scale: 0.2,
    heightOffset: 0.4,
    customRotation: [1.3, 0.6, 0.6], // Angle the spotlight down and around
    ringConfig: {
      radius: 0.6,
      tubeRadius: 0.09,
      yOffset: -0.16,
      color: "#7e8bf5",
      emissive: "#7e8bf5",
      emissiveIntensity: 1.1,
      opacity: 0,
      roughness: 0.15,
      metalness: 0.85
    }
  }
];

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
      // Wait for loading to finish, then 500ms
      if (window.__typewriterInitialDelay) {
        delay = window.__typewriterInitialDelay;
      } else {
        delay = 2000;
      }
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
  useEffect(() => {
    if (scene && props.onLoaded) {
      props.onLoaded();
    }
  }, [scene, props.onLoaded]);
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
      scale={[0.9, 0.9, 0.9]}
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
  React.useEffect(() => {
    const styleId = 'custom-scrollbar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .projects-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.6) rgba(139, 92, 246, 0.1);
        }
        .projects-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .projects-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          margin: 4px 0;
        }
        .projects-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8) 0%, rgba(168, 85, 247, 0.6) 100%);
          border-radius: 8px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
        }
        .projects-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 0.8) 100%);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }
        .projects-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 0.9) 100%);
        }
        .projects-scrollbar::-webkit-scrollbar-corner {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
        }
        @supports not selector(::-webkit-scrollbar) {
          .projects-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.8) rgba(139, 92, 246, 0.15);
          }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

function ProjectCard({ image, name, tech, description, links }: {
  image: string,
  name: string,
  tech: string[],
  description: string,
  links: { href: string, icon: string, label: string }[]
}) {
  return (
    <div className="bg-purple-700/25 border-2 border-pink-300/60 rounded-2xl p-0 hover:border-pink-300/80 hover:bg-purple-700/35 transition-all duration-300 group shadow-lg flex flex-col w-full md:bg-purple-800/20 md:border-2 md:border-purple-400/40 md:hover:border-pink-300/60 md:hover:bg-purple-700/25">
      <div className="w-full aspect-[16/9] overflow-hidden rounded-t-2xl">
        <img src={image} alt={name} className="w-full h-full object-cover rounded-t-2xl border-b-4 border-indigo-300/60 shadow-md" />
      </div>
      <div className="flex-1 flex flex-col justify-between h-full p-6">
        <div>
          <h3 className="text-2xl font-semibold text-pink-200 mb-1 group-hover:text-pink-100 transition-colors duration-300 md:text-purple-200 md:group-hover:text-pink-200">{name} <span className="text-purple-300/70 text-base font-normal ml-2"></span></h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tech.map((t, i) => (
              <span key={i} className="bg-indigo-400/20 text-indigo-200 px-2 py-1 rounded-lg text-xs font-medium tracking-wide">{t}</span>
            ))}
          </div>
          <p className="leading-relaxed text-white/90 text-sm mb-3">{description}</p>
        </div>
        <div className="flex gap-3 mt-2">
          {links.map((l, i) => (
            <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" title={l.label} className="text-indigo-200 hover:text-pink-300 transition-colors duration-300">
              {l.icon === 'globe' ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/></svg>
                : l.icon === 'github' ? <Github size={22} />
                : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
  // Hobbies state
  const hobbyTabs: HobbyKey[] = ['music', 'theatre', 'photos', 'cities', 'gaming', 'skiing']
  const [hobbyOrder, setHobbyOrder] = React.useState<HobbyKey[]>([])
  const [hobbyIndex, setHobbyIndex] = React.useState(0)
  const currentHobby = hobbyOrder.length > 0 ? hobbyOrder[hobbyIndex] : hobbyTabs[0]

  // Social links
  const socialLinks = [
    { href: 'https://instagram.com/dom_ldm', icon: 'instagram', label: 'Instagram' },
    { href: 'https://www.linkedin.com/in/dominic-ldm/', icon: 'linkedin', label: 'LinkedIn' },
    { href: 'mailto:dlemoine@uwaterloo.ca', icon: 'mail', label: 'Email' },
    { href: 'https://github.com/DominicLDM', icon: 'github', label: 'GitHub' },
  ];

// AboutMe component
function AboutMe() {
  return (
    <section className="px-2 sm:px-4 md:pr-6 md:pl-0 max-w-6xl w-full">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-center sm:items-start px-0 md:pr-4">
        {/* Image - shows on top for mobile, left side for desktop */}
        <div className="flex justify-center items-center w-full sm:w-1/2 xl:w-1/2 min-h-[160px] sm:min-h-[260px] order-1 sm:order-1 px-0 mt-2 sm:mt-0">
          <img
            src="/images/about me.jpg"
            alt="Dominic Lemoine de Martigny"
            className="w-full h-auto rounded-2xl object-contain shadow-[0_6px_32px_0_rgba(126,139,245,0.18)] bg-transparent"
            style={{ maxHeight: '320px', maxWidth: '100%' }}
          />
        </div>
        
        {/* Content - shows below image on mobile, right side on desktop */}
        <div className="flex-1 text-left order-2 sm:order-2 w-full sm:w-1/2 xl:w-1/2 px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 mb-3 sm:mb-4 md:mb-6">
            About me
          </h2>
          
          <div className="text-sm sm:text-base md:text-lg leading-relaxed text-white/90 mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-4">
            <p>
              Hi there! My name is Dominic Lemoine de Martigny. I'm a{' '}
              <span className="font-semibold text-purple-300">Software Engineering</span>{' '}
              student at the <span className="italic text-purple-200">University of Waterloo</span>.
            </p>
            
            <p>
              In my spare time, I also enjoy{' '}
              <span className="font-semibold text-purple-200">musical theatre</span>,{' '}
              <span className="font-semibold text-purple-200">e-sports</span>, and{' '}
              <span className="font-semibold text-purple-200">taking fun photos</span>!
            </p>
            
            <p>
              Feel free to contact me, and thanks for checking out my site :D
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex pb-2 sm:pb-0 justify-start gap-3 sm:gap-4 mt-2 sm:mt-4">
            {socialLinks.map(link => (
              <a
                key={link.icon}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="p-1.5 sm:p-2 rounded-full border border-white/20 text-white/80 hover:text-purple-300 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-300 group"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300">
                  {link.icon === 'instagram' && (
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                  )}
                  {link.icon === 'linkedin' && (
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.1-.9-2-2-2s-2 .9-2 2v5.5h-3v-10h3v1.25c.41-.59 1.36-1.25 2.5-1.25 2.21 0 4 1.79 4 4v6z"/></svg>
                  )}
                  {link.icon === 'mail' && (
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm-16 12V8.99l8 6.99 8-6.99V18H4z"/></svg>
                  )}
                  {link.icon === 'github' && (
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
  // Detect mobile device
  const isMobile = useMemo(() => {
    const ua = window.navigator.userAgent;
    return /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);
  }, []);
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
  }

  // Unmount Typewriter3D only after both explosion and camera zoom are finished
  React.useEffect(() => {
    if (explosionFinished && cameraZoomFinished) {
      setTypewriterDone(true)
    }
  }, [explosionFinished, cameraZoomFinished])

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
      setAutoRotate(false)
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current)
        interactionTimeout.current = null
      }
    } else {
      setShowModal(false)
      setAutoRotate(true)
    }
  }, [activeModal])

  // Get landmark position by tab name
  function getLandmarkPosition(tab: string) {
    const landmark = COORDINATE_LANDMARKS.find(lm => lm.tab === tab)
    if (!landmark) return null
    // Use landmark's globeRadius and heightOffset if available
    const globeRadius = landmark.globeRadius || 2.2
    const heightOffset = landmark.heightOffset || 0
    return latLonToPosition(landmark.lat, landmark.lon, globeRadius, heightOffset)
  }


// Animate camera to a position, then open modal
function flyToLandmarkAndOpenModal(section: string) {
  const pos = getLandmarkPosition(section)
  if (!pos) {
    // Handle hobby sections that might not have direct landmarks
    if (hobbyTabs.includes(section as HobbyKey)) {
      setActiveModal('hobbies')
    } else {
      setActiveModal(section)
    }
    setIsMobileMenuOpen(false)
    return
  }
  // Camera offset: move back along the vector from origin to landmark
  let offsetDistance = 3.2
  const norm = Math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2)
  const offset = [
    pos[0] / norm * offsetDistance,
    pos[1] / norm * offsetDistance,
    pos[2] / norm * offsetDistance,
  ]
  const endPos: [number, number, number] = [
    pos[0] + offset[0],
    pos[1] + offset[1],
    pos[2] + offset[2],
  ]
  // Get the actual camera position from Three.js
  let startPos: [number, number, number] = [0, 0, 0]
  if (controlsRef.current && controlsRef.current.object) {
    const cam = controlsRef.current.object
    startPos = [cam.position.x, cam.position.y, cam.position.z]
  } else {
    startPos = endPos // fallback if camera not available
  }
  const duration = 1.2
  const fps = 60
  const totalFrames = duration * fps
  let frame = 0
  function smoothstep(x: number): number { return x * x * (3 - 2 * x) }
  function animate() {
    frame++
    const linearAlpha = Math.min(1, frame / totalFrames)
    const alpha = smoothstep(linearAlpha)
    const newPos: [number, number, number] = [
      startPos[0] + (endPos[0] - startPos[0]) * alpha,
      startPos[1] + (endPos[1] - startPos[1]) * alpha,
      startPos[2] + (endPos[2] - startPos[2]) * alpha,
    ]
    setCameraPos(newPos)
    if (linearAlpha < 1) {
      requestAnimationFrame(animate)
    } else {
      setCameraPos(endPos)
      // Set the correct modal based on section type
      if (hobbyTabs.includes(section as HobbyKey)) {
        setActiveModal('hobbies')
      } else {
        setActiveModal(section)
      }
      setIsMobileMenuOpen(false)
    }
  }
  animate()
}

  const openModal = (section: string) => {
    const doOpen = () => {
      if (section === 'about') {
        flyToLandmarkAndOpenModal('about')
      } else if (section === 'experience') {
        flyToLandmarkAndOpenModal('experience')
      } else if (section === 'projects') {
        flyToLandmarkAndOpenModal('projects')
      } else if (section === 'hobbies') {
        if (hobbyOrder.length === 0) {
          const shuffled = [...hobbyTabs].sort(() => Math.random() - 0.5)
          setHobbyOrder(shuffled)
          setHobbyIndex(0)
          flyToLandmarkAndOpenModal(shuffled[0])
          return
        } else {
          const nextIndex = (hobbyIndex + 1) % hobbyOrder.length
          setHobbyIndex(nextIndex)
          flyToLandmarkAndOpenModal(hobbyOrder[nextIndex])
          return
        }
      } else if (hobbyTabs.includes(section as HobbyKey)) {
        // Always reset hobbyOrder to default order and set correct index, and fly to landmark
        setHobbyOrder([...hobbyTabs])
        const idx = hobbyTabs.indexOf(section as HobbyKey)
        setHobbyIndex(idx)
        flyToLandmarkAndOpenModal(section)
        setIsMobileMenuOpen(false)
      } else {
        setActiveModal(section)
        setIsMobileMenuOpen(false)
      }
    }
    if (activeModal) {
      setShowModal(false)
      setTimeout(() => {
        setActiveModal(null)
        doOpen()
      }, 300)
      return
    }
    doOpen()
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
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
      interactionTimeout.current = null
    }
    if (!activeModal) {
      interactionTimeout.current = setTimeout(() => {
        setAutoRotate(true)
        interactionTimeout.current = null
      }, 3000)
    }
  }

  const [earthLoaded, setEarthLoaded] = React.useState(false);
  const [galaxy2Loaded, setGalaxy2Loaded] = React.useState(false);

  React.useEffect(() => {
    if (earthLoaded && galaxy2Loaded) {
      setIsLoading(false);
    }
  }, [earthLoaded, galaxy2Loaded]);

  // Set typewriter initial delay after loading
  useEffect(() => {
    if (!isLoading) {
      window.__typewriterInitialDelay = 500;
    }
  }, [isLoading]);

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
                <div className="text-3xl font-black text-[#edeafd] hover:text-[#7e8bf5] tracking-wider transition-all duration-500 cursor-default select-none mt-2 mb-2"
                     style={{ 
                       fontFamily: "'PlanetoidX', 'Orbitron', 'Montserrat', 'Poppins', sans-serif"
                     }}>
                  Dominic LDM
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
              {/* @ts-ignore: Drei's EffectComposer types */}
              {(
                (!isMobile && !isLoading) ||
                (isMobile && showUI)
              ) && (
                <EffectComposer enableNormalPass={false} resolutionScale={0.7}>
                  <Vignette eskil={false} offset={0.18} darkness={0.38} />
                  <HueSaturation hue={0.0} saturation={0.1} />
                </EffectComposer>
              )}
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
              <LowPolyPlanetEarth
                position={[0, -2.7, 0]}
                scale={[2.2, 2.2, 2.2]}
                onLoaded={() => setEarthLoaded(true)}
              />
              {/* Render all landmarks using coordinate system */}
              {COORDINATE_LANDMARKS.map((lm, i) => (
                <CoordinateLandmark
                  key={i}
                  model={lm.model}
                  lat={lm.lat}
                  lon={lm.lon}
                  tab={lm.tab}
                  onClick={openModal}
                  scale={lm.scale}
                  heightOffset={lm.heightOffset}
                  customRotation={lm.customRotation}
                  ringConfig={lm.ringConfig}
                  globeRadius={2.2} // Match your Earth scale
                />
              ))}
              <Galaxy />
              <Galaxy2 onLoaded={() => setGalaxy2Loaded(true)} />
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
              {/* Improved lighting for vibrancy and brightness - brightened for earth */}
              <ambientLight intensity={0.82} color="#e0e7ff" />
              <directionalLight position={[18, 28, 18]} intensity={1.7} color="#aee" castShadow />
              <directionalLight position={[-18, -22, -18]} intensity={0.7} color="#7e8bf5" />
              <directionalLight position={[0, 12, 12]} intensity={1.45} color="#ffe066" />
              <directionalLight position={[0, -18, -12]} intensity={1.25} color="#ff6f91" />
              <ambientLight intensity={0.48} color="#b8c0ff" />
              {/* Soft fill light for the opposite side of the earth */}
              <directionalLight position={[0, -6, -22]} intensity={0.9} color="#e0e7ff" />
              <pointLight position={[-32, 40, -120]} intensity={1.0} color="#9d4edd" distance={180} decay={1.2} />
              <pointLight position={[72, -24, 160]} intensity={0.7} color="#7209b7" distance={180} decay={1.2} />
              <pointLight position={[0, -130, 10]} intensity={1.1} color="#c77dff" distance={120} decay={1.4} />
              <pointLight position={[0, -2.7, 0]} intensity={2.7} color="#4cc9f0" distance={22} decay={1.7} />
              <pointLight position={[0, 8, 0]} intensity={2.1} color="#ffe066" distance={18} decay={1.5} />
              <directionalLight position={[-30, -16, -24]} intensity={0.15} color="#9d4edd" />
              <directionalLight position={[16, -30, 16]} intensity={0.1} color="#6a4c93" />
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
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundColor: 'rgba(120, 110, 255, 0.08)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
        <div 
          className={`bg-[rgba(20,20,40,0.7)] border-[3px] mt-[76px] border-indigo-300/70 rounded-2xl p-0 ${
            activeModal === 'projects' || activeModal === 'hobbies' ? 'md:p-4 max-w-[95vw] md:max-w-[85vw]' : 'md:p-8 max-w-4xl'
          } w-full mx-2 relative shadow-lg shadow-indigo-500/30 transition-all duration-500 ${showModal ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
          style={{ 
            maxHeight: 'calc(100svh - 100px)',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-indigo-200 hover:text-indigo-100 transition-all duration-300 hover:rotate-90 z-10 cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className={`transition-all duration-700 delay-100 ${showModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}> 
              {activeModal === "about" && (
                <AboutMe />
              )}

            <div className="flex-1 overflow-y-auto">
              {activeModal === "hobbies" && (
                <HobbiesModal hobby={currentHobby} />
              )}
              {/* Other modal content */}
            </div>

              {activeModal === "experience" && (
                <div className="px-4 sm:px-8 md:px-12 lg:px-20 max-w-6xl sm:pt-2 w-full h-full overflow-y-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl pt-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">
                    Experience
                  </h2>
                  <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 items-stretch">
                    <div className="border-l-4 border-purple-400/60 pr-4 pl-6 sm:pl-8 py-4 sm:py-6 hover:border-pink-300/60 transition-all duration-300 group">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-200 group-hover:text-pink-200 transition-colors duration-300 mb-2">Software Engineer Intern</h3>
                      <p className="text-purple-300/90 text-sm sm:text-base md:text-lg mb-3 font-medium">ALS Geoanalytics • May 2025 - Aug 2025</p>
                      <p className="leading-relaxed text-white/90 text-sm sm:text-base">
                        Built a full-stack geoanalytics platform with AI-driven data processing, cloud-native architecture, and real-time dashboards, streamlining geoscience document analysis and cutting data labeling time from minutes to seconds.
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-400/60 pr-4 pl-6 sm:pl-8 py-4 sm:py-6 mb-6 hover:border-pink-300/60 transition-all duration-300 group">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-200 group-hover:text-pink-200 transition-colors duration-300 mb-2">Software Developer</h3>
                      <p className="text-purple-300/90 text-sm sm:text-base md:text-lg mb-3 font-medium">GCE Global • Jun 2024 - Aug 2024</p>
                      <p className="leading-relaxed text-white/90 text-sm sm:text-base">
                        Modernized a legacy website and built AI-powered tools to streamline legal research and document analysis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === "projects" && (
                <div className="px-4 sm:px-6 md:px-8 max-w-7xl w-full h-full flex flex-col">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 pb-4 sm:pb-6 md:pb-6 text-center md:pt-0 pt-4">
                    Projects
                  </h2>
                  <div className="flex-1 overflow-y-scroll max-h-[calc(90vh-160px)] pr-1 projects-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-4">
                      <ProjectCard
                        image="/images/preview.png"
                        name="uwGuessr"
                        tech={["Typescript", "Next.js", "GraphQL", "Supabase", "AWS", "Mapbox", "Auth0"]}
                        description="Waterloo's very own Geoguessr! uwGuessr is a geoguessing game with over 60,000 visits and 5,000 users. The platform features a real-time daily leaderboard, user-submitted image challenges, and robust security to ensure fair play."
                        links={[
                          { href: "https://github.com/DominicLDM/uwGuessr", icon: "github", label: "GitHub" }, 
                          { href: "https://uwguessr.com", icon: "globe", label: "Website" }
                        ]}
                      />
                      <ProjectCard
                        image="/images/globefolio.png"
                        name="Globefolio"
                        tech={["React + Vite", "Three.js", "Typescript", "Tailwind"]}
                        description="My personal globefolio!"
                        links={[
                          { href: "https://github.com/DominicLDM/portfolio", icon: "github", label: "GitHub" }, 
                          { href: "https://dominic.earth", icon: "globe", label: "Website" }
                        ]}
                      />
                      <ProjectCard
                        image="/images/glasses.jpg"
                        name="GLASSES"
                        tech={["Python", "JFlask", "React Native ", "Javascript", "Raspberry Pi"]}
                        description="The Graphical Light Assisted Sound Sensor Eyewear System (GLASSES) is a wearable pair of glasses with built in song recognition and lyric display. Made in collaboration with Nathan L, Nur I, Peizhe G, Kiersten E, and Jennifer Y!"
                        links={[
                          { href: "https://github.com/DominicLDM/GLASSES", icon: "github", label: "GitHub" }, 
                        ]}
                      />
                      <ProjectCard
                        image="/images/RemberU.png"
                        name="RememberU"
                        tech={["Flutter", "Firebase", "Python", "Flask", "OpenCV", "Gemini", "Raspberry Pi"]}
                        description="RememberU is a wearable AI device designed to help users recall conversations at busy networking events. By combining lip-reading, facial recognition, and Gemini AI, it delivers real-time, context-aware summaries directly to your mobile app. "
                        links={[
                          { href: "https://github.com/Rosnaky/RemberU-Pi", icon: "github", label: "GitHub" }, 
                          { href: "https://devpost.com/software/orientu", icon: "globe", label: "Website" }
                        ]}
                      />
                      <ProjectCard
                        image="/images/V3-Project.png"
                        name="V3"
                        tech={["Python", "Matplotlib", "Tkinter"]}
                        description="Tanner Slutsken and I developed V³, a physics simulator designed to help students learn physics fundamentals. The project won first place in Engineering & Computer Science and placed fourth overall at our school's science fair!"
                        links={[
                          { href: "https://github.com/DominicLDM/science-fair-2023", icon: "github", label: "GitHub" }, 
                        ]}
                      />
                      <ProjectCard
                        image="/images/Worldle-Project.png"
                        name="Worldle"
                        tech={["Python", "Matplotlib", "Tkinter"]}
                        description="My version of Worldle, a geography-themed wordle game by Teuteuf. Made for my Secondary 4 computer science class (and to practice my own geography knowledge)."
                        links={[
                          { href: "https://github.com/DominicLDM/worldle-pygame", icon: "github", label: "GitHub" }, 
                        ]}
                      />
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