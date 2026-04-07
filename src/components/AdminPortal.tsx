import React, { useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { AppHeader, Sidebar, PageContainer } from './layout/LayoutComponents';
import {
  Users,
  Building2,
  BookOpen,
  BarChart3,
  FileSpreadsheet,
  Bell,
  LayoutDashboard,
} from 'lucide-react';

import { DashboardSection } from '../features/admin/sections/DashboardSection';
import { UsersSection } from '../features/admin/sections/UsersSection';
import { ClassesSection } from '../features/admin/sections/ClassesSection';
import { CentersSection } from '../features/admin/sections/CentersSection';
import { ReportsSection } from '../features/admin/sections/ReportsSection';
import { MessagingSection } from '../features/admin/sections/MessagingSection';
import { PerformanceSection } from '../features/admin/sections/PerformanceSection';

type AdminTab = 'dashboard' | 'users' | 'classes' | 'centers' | 'reports' | 'messaging' | 'analytics';

export const AdminPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    console.log('[Admin] Logging out...');
    try {
      await signOut();
      console.log('[Admin] SignOut completed, navigating to /');
      window.location.href = '/';
    } catch (error) {
      console.error('[Admin] Logout error:', error);
      window.location.href = '/';
    }
  }, [signOut]);

  const navItems = [
    { id: 'dashboard' as AdminTab, icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users' as AdminTab, icon: Users, label: 'Users', path: '/admin/users' },
    { id: 'classes' as AdminTab, icon: BookOpen, label: 'Classes', path: '/admin/classes' },
    { id: 'centers' as AdminTab, icon: Building2, label: 'Centers', path: '/admin/centers' },
    { id: 'analytics' as AdminTab, icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { id: 'reports' as AdminTab, icon: FileSpreadsheet, label: 'Reports', path: '/admin/reports' },
    { id: 'messaging' as AdminTab, icon: Bell, label: 'Messaging', path: '/admin/messaging' },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/classes')) return 'classes';
    if (path.includes('/admin/centers')) return 'centers';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/messaging')) return 'messaging';
    return 'dashboard';
  };

  const activeTab = getActiveTab() as AdminTab;

  const handleNavClick = (id: string) => {
    const item = navItems.find((n) => n.id === id);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        type="admin"
        userName={user?.user_metadata?.display_name || user?.email?.split('@')[0]}
        userEmail={user?.email}
        userAvatar={user?.user_metadata?.avatar_url}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar 
          items={navItems} 
          activeId={activeTab} 
          onItemClick={handleNavClick} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="dashboard" element={<DashboardSection />} />
            <Route path="users" element={<UsersSection />} />
            <Route path="classes" element={<ClassesSection />} />
            <Route path="centers" element={<CentersSection />} />
            <Route path="analytics" element={<PerformanceSection />} />
            <Route path="reports" element={<ReportsSection />} />
            <Route path="messaging" element={<MessagingSection />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
