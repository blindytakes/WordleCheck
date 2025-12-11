/**
 * TOUCH DEVICE DETECTION HOOK
 *
 * Detects if the user is on a touch device (mobile/tablet).
 * Returns true for touch devices, false for desktop.
 *
 * This is used to conditionally render native inputs on mobile
 * vs. keyboard-controlled divs on desktop.
 */

import { useState, useEffect } from 'react';

export default function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch support
    const hasTouch = 'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0 ||
                     navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(hasTouch);
  }, []);

  return isTouchDevice;
}
