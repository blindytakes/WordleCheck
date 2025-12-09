/**
 * APPLICATION ENTRY POINT
 *
 * This is where the React app starts. It finds the 'root' div in index.html
 * and renders our App component into it.
 *
 * StrictMode helps catch potential problems during development by:
 * - Highlighting unsafe lifecycle methods
 * - Warning about deprecated APIs
 * - Detecting unexpected side effects
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount the React app to the DOM
// createRoot is the modern React 18+ way to initialize an app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
