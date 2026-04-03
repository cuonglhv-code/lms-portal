import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from './Button';

type ConfirmType = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

const config: Record<ConfirmType, { icon: React.ReactNode; buttonClass: string }> = {
  danger: {
    icon: <AlertCircle className="w-6 h-6" />,
    buttonClass: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  info: {
    icon: <Info className="w-6 h-6" />,
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
  },
};

const colorClasses: Record<ConfirmType, string> = {
  danger: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-indigo-100 text-indigo-600',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const { icon, buttonClass } = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[type]}`}>
                {icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button 
                className={`flex-1 text-white ${buttonClass}`} 
                onClick={() => { onConfirm(); onClose(); }}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
