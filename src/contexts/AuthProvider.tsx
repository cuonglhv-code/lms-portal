import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isConfigured } from '../supabase';
import { UserRole } from '../types/auth';
import { hasPermission, Permission } from '../utils/permissions';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    role?: string;
    avatar_url?: string;
  };
  email_confirmed_at?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: any | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  hasPermission: () => false,
  refreshUser: async () => {},
});

const ADMIN_EMAILS = new Set([
  'cuonglhv@gmail.com',
  'cuonglhv@jaxtina.com',
  'lecuong.ueh@gmail.com',
]);

const AUTH_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    )
  ]).catch(() => fallback);
}

async function detectUserRole(supabaseUser: SupabaseUser): Promise<UserRole> {
  const email = supabaseUser.email?.toLowerCase() || '';
  
  if (ADMIN_EMAILS.has(email)) {
    return UserRole.Admin;
  }
  
  const metadataRole = supabaseUser.user_metadata?.role;
  if (metadataRole && Object.values(UserRole).includes(metadataRole as UserRole)) {
    return metadataRole as UserRole;
  }
  
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (student && !studentError) {
      return UserRole.Student;
    }
  } catch (error) {
    console.log('[Auth] Could not check students table:', error);
  }
  
  try {
    const { data: teacherUser, error: teacherError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', supabaseUser.id)
      .maybeSingle();
    
    if (teacherUser && !teacherError) {
      if (teacherUser.role === 'admin') return UserRole.Admin;
      if (teacherUser.role === 'teacher') return UserRole.Teacher;
    }
  } catch (error) {
    console.log('[Auth] Could not check users table:', error);
  }
  
  return UserRole.Teacher;
}

async function upsertUserRecord(supabaseUser: SupabaseUser, role: UserRole) {
  try {
    const displayName = supabaseUser.user_metadata?.display_name || 
      (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'User');
    
    const { error } = await supabase.from('users').upsert({
      auth_id: supabaseUser.id,
      email: supabaseUser.email,
      display_name: displayName,
      role: role === UserRole.Admin ? 'admin' : role === UserRole.Student ? 'student' : 'teacher',
      last_login: new Date().toISOString(),
      status: 'active',
    }, { onConflict: 'auth_id' });
    
    if (error && error.code !== '23505') {
      console.error('[Auth] Failed to upsert user record:', error);
    }
  } catch (error) {
    console.error('[Auth] Failed to upsert user record:', error);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const detectRole = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const detectedRole = await detectUserRole(supabaseUser);
      console.log('[Auth] Detected role for', supabaseUser.email, ':', detectedRole);
      setRole(detectedRole);
      
      if (detectedRole !== UserRole.Student) {
        await upsertUserRecord(supabaseUser, detectedRole);
      }
      
      return detectedRole;
    } catch (error) {
      console.error('[Auth] Error detecting role:', error);
      return UserRole.Teacher;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (supabase.auth.getSession()) {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        await detectRole(currentSession.user as SupabaseUser);
      }
    }
  }, [detectRole]);

  useEffect(() => {
    if (!isConfigured) {
      console.log('[Auth] Supabase not configured, skipping auth initialization');
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[Auth] Auth event:', event);
          
          if (session?.user) {
            console.log('[Auth] User signed in:', session.user.email);
            setUser(session.user as SupabaseUser);
            setSession(session);
            await detectRole(session.user as SupabaseUser);
          } else {
            console.log('[Auth] User signed out');
            setUser(null);
            setSession(null);
            setRole(null);
          }
          setLoading(false);
        });

        subscription = data.subscription;

        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          { data: { session: null }, error: null }
        );
        
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user as SupabaseUser);
          setSession(sessionData.session);
          await detectRole(sessionData.session.user as SupabaseUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[Auth] Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [detectRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }
    
    if (data.user) {
      setUser(data.user as SupabaseUser);
      setSession(data.session);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('[Auth] Sign out error (clearing local state anyway):', error);
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }
    
    if (data.user) {
      setUser(data.user as SupabaseUser);
      setSession(data.session);
    }
  }, []);

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      return hasPermission(role, permission);
    },
    [role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        signIn,
        signOut,
        signUp,
        hasPermission: checkPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function useRequireAuth(requiredRole?: UserRole) {
  const { user, role, loading } = useAuth();

  const isAuthorized = !requiredRole || role === requiredRole;

  return {
    user,
    role,
    loading,
    isAuthorized,
    isAuthenticated: !!user,
  };
}
