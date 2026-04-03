import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './common/Button';

interface DemoBannerProps {
  onEnterDemo: () => void;
}

export function DemoBanner({ onEnterDemo }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('demo_banner_dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-amber-50 border-b border-amber-200"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Demo Mode - Supabase not configured
            </p>
            <p className="text-xs text-amber-700">
              Click "Use Demo" to explore with sample data, or configure Supabase for full functionality.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={onEnterDemo}>
            Use Demo
          </Button>
          <button
            onClick={() => {
              setDismissed(true);
              sessionStorage.setItem('demo_banner_dismissed', 'true');
            }}
            className="p-1 text-amber-600 hover:text-amber-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
