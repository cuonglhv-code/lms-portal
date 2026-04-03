import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const demoMode = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_DEMO_MODE === 'true';

console.log('[App] Starting...');
console.log('[App] VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');
console.log('[App] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'NOT SET');
console.log('[App] Demo mode:', demoMode);

if (demoMode) {
  console.log('[App] Loading DemoApp...');
  import('./DemoApp.tsx').then(({ default: DemoApp }) => {
    console.log('[App] DemoApp loaded, rendering...');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <DemoApp />
      </StrictMode>,
    );
    console.log('[App] DemoApp rendered');
  }).catch((err) => {
    console.error('[App] Failed to load DemoApp:', err);
    document.getElementById('root')!.innerHTML = '<div style="padding:20px;color:red;">Failed to load app</div>';
  });
} else {
  console.log('[App] Loading App...');
  Promise.all([
    import('./App.tsx'),
    import('./components/ErrorBoundary.tsx'),
  ]).then(([{ default: App }, { ErrorBoundary }]) => {
    console.log('[App] App loaded, rendering...');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('[App] App rendered');
  }).catch((err) => {
    console.error('[App] Failed to load App:', err);
    document.getElementById('root')!.innerHTML = '<div style="padding:20px;color:red;">Failed to load app</div>';
  });
}
