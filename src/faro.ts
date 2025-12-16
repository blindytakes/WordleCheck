// src/faro.ts
import { getWebInstrumentations, initializeFaro, Faro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

/**
 * Faro instance singleton
 *
 * LIFECYCLE ASSUMPTION:
 * - initFaro() is called exactly once in main.jsx before React renders
 * - getFaro() is only called after initialization is complete
 * - This instance persists for the entire application lifecycle
 */
let faroInstance: Faro | null = null;

export function initFaro() {
  const faro = initializeFaro({
    url: 'https://faro-collector-prod-us-east-3.grafana.net/collect/9314a56f03836fe03ec857e0505d5898',

    app: {
      name: 'wordle-wordcloud',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: 'production',
    },

    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
        captureErrors: true,
        captureWebVitals: true,
        captureInteractions: true,
      }),
      new TracingInstrumentation(),
    ],
  });

  // 📍 Geo lookup (already working)
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      if (data.city && faro.api) {
        faro.api.pushEvent('geo_ip_resolved', {
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    })
    .catch(() => {});

  // ⏱ TOTAL TIME SPENT ON PAGE (ADD THIS)
  const pageStart = performance.now();

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const durationMs = Math.round(performance.now() - pageStart);

      faro.api.pushEvent('page_time_spent', {
        duration_ms: durationMs,
      });
    }
  });

  faroInstance = faro;
  return faro;
}

export function getFaro(): Faro | null {
  return faroInstance;
}
