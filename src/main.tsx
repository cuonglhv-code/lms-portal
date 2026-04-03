import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import DemoApp from './DemoApp.tsx';
import './index.css';
import { isConfigured } from './supabase';

const useDemoMode = !isConfigured || import.meta.env.VITE_DEMO_MODE === 'true';

const RootApp = useDemoMode ? DemoApp : App;

console.log('[App] Starting in', useDemoMode ? 'demo' : 'production', 'mode');
console.log('[App] Supabase configured:', isConfigured);

window.addEventListener('error', (e) => {
  console.error('[App] Uncaught error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[App] Unhandled rejection:', e.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
