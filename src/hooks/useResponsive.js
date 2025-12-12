/**
 * RESPONSIVE DETECTION HOOK
 *
 * Detects screen size breakpoints and returns responsive flags.
 * Consolidates screen size detection to avoid duplicate logic.
 *
 * Breakpoints:
 * - Mobile: < 640px (sm)
 * - Tablet: 640px - 1023px (md/lg)
 * - Desktop: >= 1024px (lg)
 *
 * Returns:
 * - isMobile: width < 640px
 * - isTablet: 640px <= width < 1024px
 * - isDesktop: width >= 1024px
 * - isMobileOrTablet: width < 1024px
 * - width: current window width
 *
 * Usage:
 * const { isDesktop, isMobileOrTablet } = useResponsive();
 */

import { useState, useEffect } from 'react';

// Breakpoint constants (matching Tailwind defaults)
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export default function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive flags based on current width
  const isMobile = width < BREAKPOINTS.sm;
  const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;
  const isMobileOrTablet = width < BREAKPOINTS.lg;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    // Expose breakpoints for custom logic
    breakpoints: BREAKPOINTS,
  };
}
