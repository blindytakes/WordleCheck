// src/faro.ts
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export function initFaro() {
  initializeFaro({
    url: 'https://faro-collector-prod-us-east-3.grafana.net/collect/9314a56f03836fe03ec857e0505d5898',

    app: {
      name: 'wordle-wordcloud',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: 'production',
    },

    instrumentations: [
      ...getWebInstrumentations({
        // 🔥 Capture EVERYTHING
        captureConsole: true,        // console.log / warn / error
        captureErrors: true,         // JS errors + stack traces
        captureWebVitals: true,      // LCP, CLS, INP, etc.
        captureInteractions: true,   // clicks, navigation
      }),

      // End-to-end tracing (sessions, fetch/XHR, navigation)
      new TracingInstrumentation(),
    ],
  });
}
