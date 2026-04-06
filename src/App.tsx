import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/common/SharedComponents';

// Context & Providers
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

// Portals
import { AdminPortal } from './components/AdminPortal';
import { TeacherApp } from './features/teacher/TeacherApp';
import { StudentApp } from './features/student/StudentApp';

// Components
import { LoginView } from './features/auth/LoginView';
import { Unauthorized } from './components/Unauthorized';

// Types
import { UserRole } from './types/auth';

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === UserRole.Admin) {
    return <Navigate to="/admin" replace />;
  }
  
  if (role === UserRole.Teacher) {
    return <Navigate to="/teacher" replace />;
  }
  
  if (role === UserRole.Student) {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const AuthWrapper = () => {
  const { user, signIn } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <LoginView onEmailLogin={signIn} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<AuthWrapper />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AdminPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
              <TeacherApp />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={[UserRole.Student]}>
              <StudentAppWrapper />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Simple wrapper to bridge the specific props StudentApp formally expected from App.tsx
function StudentAppWrapper() {
  const { user, signOut } = useAuth();
  
  const handleLogout = React.useCallback(async () => {
    console.log('[Auth] Logging out...');
    try {
      await signOut();
    } catch (error) {
      console.error('[Auth] signOut error:', error);
    }
    window.location.href = '/';
  }, [signOut]);

  if (!user) return null;

  return <StudentApp user={user} onLogout={handleLogout} />;
}