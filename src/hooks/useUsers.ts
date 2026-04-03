import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { UserRecord, UserRole } from '../types/auth';

const PAGE_SIZE = 20;

export const useUsers = (roleFilter?: UserRole) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const lastIdRef = useRef<string | null>(null);

  const fetchUsers = useCallback(async (isNextPage: boolean = false) => {
    if (loading || (!hasMore && isNextPage)) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (roleFilter) {
        const roleStr = roleFilter === UserRole.Admin ? 'admin' : roleFilter === UserRole.Student ? 'student' : 'teacher';
        query = query.eq('role', roleStr);
      }

      if (isNextPage && lastIdRef.current) {
        query = query.gt('id', lastIdRef.current);
      }

      const { data, error: fetchError, count } = await query
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (fetchError) throw fetchError;

      const fetchedUsers: UserRecord[] = (data || []).map(u => ({
        id: u.id,
        authUid: u.auth_id,
        email: u.email,
        displayName: u.display_name,
        role: u.role as UserRole,
        status: u.status,
        createdAt: new Date(u.created_at).getTime(),
        updatedAt: u.updated_at ? new Date(u.updated_at).getTime() : undefined,
        isActive: u.status === 'active',
      }));

      setUsers(prev => isNextPage ? [...prev, ...fetchedUsers] : fetchedUsers);
      lastIdRef.current = data?.[data.length - 1]?.id || null;
      setHasMore((count || 0) > PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, [roleFilter, hasMore, loading]);

  useEffect(() => {
    setUsers([]);
    lastIdRef.current = null;
    setHasMore(true);
    fetchUsers(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]); 

  const loadMore = () => fetchUsers(true);

  return { users, loading, error, hasMore, loadMore };
};
