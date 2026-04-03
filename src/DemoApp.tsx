import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  Download,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  LayoutDashboard,
  Building2,
} from 'lucide-react';
import { AppHeader, Sidebar, PageContainer } from './components/layout/LayoutComponents';
import { LoadingSpinner } from './components/common/SharedComponents';
import { Button } from './components/common/Button';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { DemoBanner } from './components/DemoBanner';
import { DemoAuthProvider, useDemoAuth } from './lib/demoAuth';
import { DemoTeacherApp } from './features/demo/DemoTeacherApp';
import { DemoStudentApp } from './features/demo/DemoStudentApp';
import { DemoAdminPortal } from './features/demo/DemoAdminPortal';
import { Tab } from './types/models';
import { UserRole } from './types/auth';
import './lib/mockData';

function LoginPage() {
  const { signIn } = useDemoAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Jaxtina Portal</h1>
          <p className="text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Any password works in demo"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-3">Quick access:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setEmail('admin@jaxtina.com')}
              className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              Admin
            </button>
            <button
              onClick={() => setEmail('sarah.chen@jaxtina.com')}
              className="px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              Teacher
            </button>
            <button
              onClick={() => setEmail('j.thompson@email.com')}
              className="px-3 py-2 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
            >
              Student
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DemoMainApp() {
  const { user, loading } = useDemoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'student') {
    return <DemoStudentApp user={user} />;
  }

  if (user.role === 'admin') {
    return <DemoAdminPortal user={user} />;
  }

  return <DemoTeacherApp user={user} />;
}

export default function DemoApp() {
  return (
    <DemoAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DemoMainApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DemoAuthProvider>
  );
}
