import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers, mockStudents, mockDashboardStats, mockMessages } from './mockData';

interface DemoUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'teacher' | 'student';
}

interface DemoAuthContext {
  user: DemoUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContext | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('demo_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, _password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Check admin/teacher users
    const teacherUser = mockUsers.find(u => u.email === email);
    if (teacherUser) {
      const demoUser: DemoUser = {
        id: teacherUser.id,
        email: teacherUser.email,
        displayName: teacherUser.display_name,
        role: teacherUser.role,
      };
      setUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      setLoading(false);
      return;
    }

    // Check student users
    const studentUser = mockStudents.find(s => s.email === email);
    if (studentUser) {
      const demoUser: DemoUser = {
        id: studentUser.id,
        email: studentUser.email,
        displayName: studentUser.display_name,
        role: 'student',
      };
      setUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      setLoading(false);
      return;
    }

    // For demo purposes, allow any email with teacher role
    const demoUser: DemoUser = {
      id: 'demo-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      role: 'teacher',
    };
    setUser(demoUser);
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return (
    <DemoAuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider');
  }
  return context;
}

// Export mock data for use in demo mode
export { mockDashboardStats, mockMessages };
