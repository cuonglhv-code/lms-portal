import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';

export const AdminRoute: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role !== UserRole.Admin) {
    // Redirect non-admins to an unauthorized page or their respective portals
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the child routes if the user is an Admin
  return <Outlet />;
};
