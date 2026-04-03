import React from 'react';
import { cn } from '../../utils/cn';

interface StatusButtonProps {
  active: boolean;
  onClick: () => void;
  color: 'green' | 'red' | 'yellow' | 'gray';
  icon: React.ReactNode;
  label: string;
}

export const StatusButton: React.FC<StatusButtonProps> = ({ 
  active, 
  onClick, 
  color, 
  icon, 
  label 
}) => {
  const colors = {
    green: active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50',
    red: active ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50',
    yellow: active ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-yellow-50',
    gray: active ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        colors[color]
      )}
    >
      {icon}
      {label}
    </button>
  );
};
