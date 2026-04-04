import { supabase } from '../supabase';
import { UserRecord, UserRole } from '../types/auth';

export type UserStatus = 'active' | 'suspended' | 'invited' | 'archived';

export interface CreateUserParams {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface UpdateUserParams {
  displayName?: string;
  role?: UserRole;
  status?: UserStatus;
}

class UserService {
  async createUser(params: CreateUserParams): Promise<{ user: UserRecord; authUid: string }> {
    const { email, password, displayName, role } = params;

    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          role: role === UserRole.Admin ? 'admin' : role === UserRole.Student ? 'student' : 'teacher',
        },
      });

      if (authError) {
        throw authError;
      }

      const authUid = authUser.user.id;

      try {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .insert({
            auth_id: authUid,
            email,
            display_name: displayName,
            role: role === UserRole.Admin ? 'admin' : 'teacher',
            status: 'active',
          })
          .select()
          .single();

        if (dbError) {
          console.warn('[UserService] Could not write to users table:', dbError.message);
        }

        return {
          user: {
            id: dbUser?.id || authUid,
            authUid,
            email,
            displayName,
            role,
            status: 'active',
            createdAt: Date.now(),
            isActive: true,
          },
          authUid,
        };
      } catch (dbError: any) {
        console.warn('[UserService] Could not write to users table:', dbError.message);
        return {
          user: {
            id: authUid,
            authUid,
            email,
            displayName,
            role,
            status: 'active',
            createdAt: Date.now(),
            isActive: true,
          },
          authUid,
        };
      }
    } catch (error: any) {
      console.error('[UserService] Create user error:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        authUid: data.auth_id,
        email: data.email,
        displayName: data.display_name,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : undefined,
        isActive: data.status === 'active',
      };
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        authUid: data.auth_id,
        email: data.email,
        displayName: data.display_name,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        createdAt: new Date(data.created_at).getTime(),
        isActive: data.status === 'active',
      };
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId: string, params: UpdateUserParams): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (params.displayName) {
        updateData.display_name = params.displayName;
      }
      if (params.role) {
        updateData.role = params.role === UserRole.Admin ? 'admin' : 'teacher';
      }
      if (params.status) {
        updateData.status = params.status;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('[UserService] Update user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', userId)
        .single();

      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) {
        throw dbError;
      }

      if (user?.auth_id) {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.auth_id);
        if (authError) {
          console.warn('[UserService] Could not delete auth user:', authError.message);
        }
      }
    } catch (error: any) {
      console.error('[UserService] Delete user error:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('[UserService] Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  async listUsers(options: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ users: UserRecord[]; total: number; hasMore: boolean }> {
    const { role, status, search, page = 1, pageSize = 20 } = options;

    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (role) {
        query = query.eq('role', role === UserRole.Admin ? 'admin' : role === UserRole.Student ? 'student' : 'teacher');
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const users: UserRecord[] = (data || []).map((u) => ({
        id: u.id,
        authUid: u.auth_id,
        email: u.email,
        displayName: u.display_name,
        role: u.role as UserRole,
        status: u.status as UserStatus,
        createdAt: new Date(u.created_at).getTime(),
        updatedAt: u.updated_at ? new Date(u.updated_at).getTime() : undefined,
        isActive: u.status === 'active',
      }));

      return {
        users,
        total: count || 0,
        hasMore: (count || 0) > page * pageSize,
      };
    } catch (error) {
      console.error('[UserService] List users error:', error);
      return { users: [], total: 0, hasMore: false };
    }
  }
}

export const userService = new UserService();
