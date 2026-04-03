import { PostgrestError } from '@supabase/supabase-js';
import { UserRole } from '../types/auth';

export interface SupabaseOperationContext {
  operation: string;
  table?: string;
  userId?: string | null;
  userRole?: UserRole | null;
  errorMessage?: string;
  timestamp: string;
}

export async function handleSupabaseError(
  error: unknown,
  operation: string,
  table?: string,
  userId: string | null = null,
  userRole: UserRole | null = null
) {
  const postgrestError = error as PostgrestError;
  
  const errorContext: SupabaseOperationContext = {
    operation,
    table,
    userId: userId || 'unauthenticated',
    userRole,
    errorMessage: postgrestError?.message || String(error),
    timestamp: new Date().toISOString(),
  };

  console.error('Supabase Error Context:', JSON.stringify(errorContext, null, 2));
  console.error('Original Error:', error);
}
