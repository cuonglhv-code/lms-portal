import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import DemoApp from './DemoApp.tsx';
import './index.css';

const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
                  import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ||
                  import.meta.env.VITE_DEMO_MODE === 'true';

const RootApp = isDemoMode ? DemoApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
