/**
 * APPLICATION ENTRY POINT
 *
 * This is where the React app starts. It finds the 'root' div in index.html
 * and renders our App component into it.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initFaro } from './faro';

// 🔥 Initialize Grafana Faro BEFORE rendering the app
// This ensures page-loads, sessions, and early errors are captured
initFaro();

// Mount the React app to the DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

