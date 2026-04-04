import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, GraduationCap, Users, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../common/Button';

interface AppHeaderProps {
  type: 'admin' | 'teacher' | 'student';
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  type,
  userName,
  userEmail,
  userAvatar,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
}) => {
  const icons = {
    admin: Shield,
    teacher: GraduationCap,
    student: Users,
  };

  const titles = {
    admin: 'Admin Portal',
    teacher: 'Teacher Portal',
    student: 'Student Portal',
  };

  const Icon = icons[type];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
            {titles[type]}
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
            )}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                {userName || 'User'}
              </p>
              {userEmail && (
                <p className="text-xs text-gray-500 line-clamp-1">{userEmail}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="p-2" aria-label="Sign out">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-red-600" />
          </Button>
        </div>
      </div>
    </header>
  );
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  items: NavItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onItemClick, mobileOpen, onClose }) => {
  return (
    <>
      {mobileOpen !== undefined && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
            />
          )}
        </AnimatePresence>
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 md:transform-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} role="navigation" aria-label="Main navigation">
        <nav className="flex md:flex-col gap-1 p-4 overflow-y-auto h-full">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => { onItemClick(item.id); onClose?.(); }}
                whileTap={{ scale: 0.98 }}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {children}
    </main>
  );
};

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
