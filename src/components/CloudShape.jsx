/**
 * CLOUD SHAPE COMPONENT
 *
 * Pure visual component that renders the fluffy cloud background.
 * Made of 13 overlapping gradient circles with blur effects.
 *
 * Features:
 * - Initial scale/fade-in animation
 * - Continuous floating animation (desktop only)
 * - Responsive sizing
 * - Drop shadow for depth
 * - Accepts children to display inside the cloud
 */

import { motion } from 'framer-motion';
import useResponsive from '../hooks/useResponsive';

export default function CloudShape({ isTouchDevice, children }) {
  const { isDesktop } = useResponsive();
  // Use lighter blur on mobile for better performance (blur-sm vs blur-lg)
  const blurClass = isTouchDevice ? 'blur-sm' : 'blur-lg';
  const shadowBlur = isTouchDevice ? 'blur-xl' : 'blur-3xl';

  // MOBILE CLOUD: SVG cloud shape with gradients
  if (!isDesktop) {
    return (
      <motion.div
        className="relative w-full h-auto flex items-start justify-center pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* SVG Cloud Shape - proper cloud silhouette */}
        <div className="relative w-[90vw] max-w-[600px] h-[420px]">
          {/* SVG Cloud with gradients */}
          <svg
            viewBox="0 0 400 180"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Light mode gradient */}
              <linearGradient id="cloudGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="30%" stopColor="#e9d5ff" />
                <stop offset="60%" stopColor="#fce7f3" />
                <stop offset="100%" stopColor="#bfdbfe" />
              </linearGradient>

              {/* Dark mode gradient */}
              <linearGradient id="cloudGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b21a8" />
                <stop offset="50%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>

              {/* Radial highlight overlay */}
              <radialGradient id="cloudHighlight" cx="35%" cy="35%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Main cloud path - fluffy cloud shape */}
            <path
              d="M 100,120
                 Q 80,110 80,90
                 Q 80,70 95,60
                 Q 100,40 120,35
                 Q 140,30 155,40
                 Q 170,25 190,25
                 Q 215,25 230,45
                 Q 250,35 270,40
                 Q 290,45 295,65
                 Q 310,70 315,85
                 Q 320,100 310,115
                 Q 305,130 285,135
                 L 115,135
                 Q 100,133 100,120 Z"
              className="fill-[url(#cloudGradientLight)] dark:fill-[url(#cloudGradientDark)]"
            />

            {/* Highlight overlay for depth */}
            <path
              d="M 100,120
                 Q 80,110 80,90
                 Q 80,70 95,60
                 Q 100,40 120,35
                 Q 140,30 155,40
                 Q 170,25 190,25
                 Q 215,25 230,45
                 Q 250,35 270,40
                 Q 290,45 295,65
                 Q 310,70 315,85
                 Q 320,100 310,115
                 Q 305,130 285,135
                 L 115,135
                 Q 100,133 100,120 Z"
              fill="url(#cloudHighlight)"
              className="opacity-60"
            />
          </svg>

          {/* Additional CSS gradient overlays for extra depth */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Diagonal shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/6 to-transparent dark:via-white/3"></div>

            {/* Bottom shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-300/8 dark:to-purple-950/15"></div>
          </div>

          {/* CONTENT: Children displayed inside the cloud */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8">
            {children}
          </div>
        </div>
      </motion.div>
    );
  }

  // DESKTOP CLOUD: Original complex cloud (unchanged)
  return (
    /* Outer container: Initial scale/fade-in animation (disabled on touch for scroll performance) */
    <motion.div
      className="relative w-full h-auto lg:h-full flex items-start justify-center overflow-visible"
      initial={isTouchDevice ? { y: 0, scale: 1, opacity: 1 } : { y: -20, scale: 0.9, opacity: 0 }}
      animate={{
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      transition={isTouchDevice ? { duration: 0 } : {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 1
      }}
    >
      {/*
        FLOATING ANIMATION - DESKTOP ONLY:

        Desktop (isTouchDevice = false):
        - Cloud gently floats up and down continuously
        - Adds visual interest and "alive" feeling to the UI
        - 4-second loop moving 15px up and back down

        Mobile (isTouchDevice = true):
        - Animation disabled (animate={}, transition={})
        - Why? Mobile devices often have:
          - Lower GPU power (animation can cause jank/stuttering)
          - Reduced battery life from continuous animations
          - Scrolling interactions that conflict with floating effects
        - Provides cleaner, more performant experience on phones/tablets
      */}
      <motion.div
        className="relative overflow-visible"
        animate={isTouchDevice ? {} : {
          y: [0, -15, 0], // Move up 15px, then back down
        }}
        transition={isTouchDevice ? {} : {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Cloud shape: Made of multiple overlapping gradient circles with blur (responsive sizing) */}
        <div className="relative w-[95vw] max-w-[700px] h-[55vw] max-h-[500px] sm:w-[70vw] sm:h-[50vw] md:w-[70vw] md:h-[52vw] lg:w-[1200px] lg:h-[865px] scale-x-[0.55] scale-y-[0.5] sm:scale-x-[0.6] sm:scale-y-[0.55] lg:scale-125 overflow-visible">
          {/* Main cloud body: 13 overlapping circles create the fluffy shape */}
          <div className="absolute top-16 inset-x-0 bottom-0 flex items-center justify-center overflow-visible" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))' }}>
            {/* Left puff */}
            <div className={`absolute left-4 top-1/4 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-95`}></div>

            {/* Center large puff - the main body */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-80 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 rounded-full ${blurClass}`}></div>

            {/* Right puff */}
            <div className={`absolute right-4 top-1/3 w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-95`}></div>

            {/* Top left puff */}
            <div className={`absolute left-28 top-20 w-60 h-60 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full ${blurClass}`}></div>

            {/* Top center puff */}
            <div className={`absolute left-1/2 -translate-x-1/2 top-24 w-56 h-56 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full ${blurClass}`}></div>

            {/* Top right puff */}
            <div className={`absolute right-28 top-24 w-52 h-52 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full ${blurClass}`}></div>

            {/* Additional puffs to fill gaps */}
            {/* Upper left fill */}
            <div className={`absolute left-48 top-20 w-56 h-56 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full ${blurClass} opacity-90`}></div>

            {/* Upper right fill */}
            <div className={`absolute right-48 top-24 w-52 h-52 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full ${blurClass} opacity-90`}></div>

            {/* Middle left fill */}
            <div className={`absolute left-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-85`}></div>

            {/* Middle right fill */}
            <div className={`absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-85`}></div>

            {/* Bottom puffs for fullness */}
            <div className={`absolute left-36 bottom-12 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-85`}></div>
            <div className={`absolute right-36 bottom-16 w-60 h-60 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-85`}></div>

            {/* Middle bottom puff for cloud shape */}
            <div className={`absolute left-1/2 -translate-x-1/2 bottom-20 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full ${blurClass} opacity-90`}></div>
          </div>

          {/* Soft drop shadow underneath cloud for depth */}
          <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-[500px] h-16 bg-blue-300/40 dark:bg-purple-900/40 rounded-full ${shadowBlur}`}></div>

          {/* CONTENT: Children displayed inside the cloud (responsive padding) */}
          <div className="absolute top-24 inset-x-0 bottom-0 flex flex-col items-center justify-center px-2 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-20 lg:py-24 overflow-visible">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
