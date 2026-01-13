/**
 * TOUCH DEVICE DETECTION HOOK
 *
 * Detects if the user is on a touch-primary device (mobile/tablet).
 * Returns true for touch devices, false for desktop/keyboard devices.
 *
 * Uses media queries to properly classify hybrid devices:
 * - iPad with keyboard = desktop (fine pointer + hover)
 * - Surface laptop with touchscreen = desktop (fine pointer + hover)
 * - Phone/tablet without keyboard = touch (coarse pointer or no hover)
 *
 * This is used to conditionally render native inputs on mobile
 * vs. keyboard-controlled divs on desktop.
 */

import { useState, useEffect } from 'react';

export default function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Primary check: pointer type and hover capability
    // Coarse pointer = touch-based (finger, not mouse)
    // No hover = touch-based (can't hover with finger)
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasNoHover = !window.matchMedia('(hover: hover)').matches;

    // Fallback for older browsers: check touch capability
    const hasTouchCapability = 'ontouchstart' in window ||
                               navigator.maxTouchPoints > 0 ||
                               navigator.msMaxTouchPoints > 0;

    // Consider it a touch device if:
    // 1. Primary pointer is coarse (finger/stylus), OR
    // 2. No hover capability, OR
    // 3. Touch capable AND small screen (likely phone/tablet, not hybrid laptop)
    const isSmallScreen = window.innerWidth < 768; // Below MD breakpoint
    const isTouchPrimary = hasCoarsePointer || hasNoHover || (hasTouchCapability && isSmallScreen);

    setIsTouchDevice(isTouchPrimary);
  }, []);

  return isTouchDevice;
}
