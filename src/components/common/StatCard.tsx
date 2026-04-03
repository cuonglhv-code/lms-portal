import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, className }) => (
  <Card className={cn("flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95", className)}>
    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        {trend && <span className="text-xs font-bold text-emerald-500">{trend}</span>}
      </div>
    </div>
  </Card>
);
