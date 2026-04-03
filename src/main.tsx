import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import DemoApp from './DemoApp.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { isConfigured } from './supabase';

const useDemoMode = !isConfigured || import.meta.env.VITE_DEMO_MODE === 'true';

const RootApp = useDemoMode ? DemoApp : App;

console.log('[App] Starting in', useDemoMode ? 'demo' : 'production', 'mode');
console.log('[App] Supabase configured:', isConfigured);

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<LoadingFallback />}>
      <RootApp />
    </ErrorBoundary>
  </StrictMode>,
);
