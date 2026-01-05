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

  // MOBILE CLOUD: Simple, contained, easy to control
  if (!isDesktop) {
    return (
      <motion.div
        className="relative w-full h-auto flex items-start justify-center pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Simple mobile cloud - Blue/Purple to match desktop - NO BLUR for performance */}
        <div className="relative w-[73vw] max-w-[390px] h-[292px]">
          {/* Main cloud body: Just 4 simple circles, fully contained */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center circle - largest */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full"></div>

            {/* Left circle */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full opacity-90"></div>

            {/* Right circle */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full opacity-90"></div>

            {/* Top circle */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8 w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full opacity-85"></div>
          </div>

          {/* CONTENT: Children displayed inside the mobile cloud */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8">
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
