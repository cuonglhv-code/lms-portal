import React from 'react';
import { cn } from '../../utils/cn';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ 
  active, 
  onClick, 
  icon, 
  label 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap md:w-full',
        active 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
