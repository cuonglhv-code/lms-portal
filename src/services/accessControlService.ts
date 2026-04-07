import { supabase } from '../supabase';
import { UserRole } from '../types/auth';
import { Permission, Resource, PermissionString } from '../types/permissions';

const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    { resource: 'user', action: 'read', scope: 'all' },
    { resource: 'user', action: 'create', scope: 'all' },
    { resource: 'user', action: 'update', scope: 'all' },
    { resource: 'user', action: 'delete', scope: 'all' },
    { resource: 'student', action: 'read', scope: 'all' },
    { resource: 'student', action: 'create', scope: 'all' },
    { resource: 'student', action: 'update', scope: 'all' },
    { resource: 'student', action: 'delete', scope: 'all' },
    { resource: 'class', action: 'read', scope: 'all' },
    { resource: 'class', action: 'create', scope: 'all' },
    { resource: 'class', action: 'update', scope: 'all' },
    { resource: 'class', action: 'delete', scope: 'all' },
    { resource: 'homework', action: 'read', scope: 'all' },
    { resource: 'homework', action: 'create', scope: 'all' },
    { resource: 'homework', action: 'update', scope: 'all' },
    { resource: 'homework', action: 'delete', scope: 'all' },
    { resource: 'exam', action: 'read', scope: 'all' },
    { resource: 'exam', action: 'create', scope: 'all' },
    { resource: 'exam', action: 'update', scope: 'all' },
    { resource: 'exam', action: 'delete', scope: 'all' },
    { resource: 'attendance', action: 'read', scope: 'all' },
    { resource: 'attendance', action: 'update', scope: 'all' },
    { resource: 'report', action: 'export', scope: 'all' },
  ],
  
  [UserRole.Teacher]: [
    { resource: 'class', action: 'read', scope: 'class' },
    { resource: 'class', action: 'update', scope: 'class' },
    { resource: 'student', action: 'read', scope: 'class' },
    { resource: 'student', action: 'update', scope: 'class' },
    { resource: 'homework', action: 'read', scope: 'class' },
    { resource: 'homework', action: 'create', scope: 'class' },
    { resource: 'homework', action: 'update', scope: 'class' },
    { resource: 'exam', action: 'read', scope: 'class' },
    { resource: 'exam', action: 'create', scope: 'class' },
    { resource: 'exam', action: 'update', scope: 'class' },
    { resource: 'attendance', action: 'read', scope: 'class' },
    { resource: 'attendance', action: 'update', scope: 'class' },
    { resource: 'report', action: 'export', scope: 'class' },
  ],
  
  [UserRole.Student]: [
    { resource: 'homework', action: 'read', scope: 'own' },
    { resource: 'homework', action: 'update', scope: 'own' },
    { resource: 'exam', action: 'read', scope: 'own' },
    { resource: 'attendance', action: 'read', scope: 'own' },
    { resource: 'class', action: 'read', scope: 'own' },
  ],
};

export interface AccessContext {
  userId: string;
  email: string;
  role: UserRole;
}

export class AccessControlService {
  static hasPermission(ctx: AccessContext, permission: PermissionString): boolean {
    const permissions = PERMISSION_MATRIX[ctx.role] || [];
    
    const [resource, action, scope] = permission.split(':') as [Resource, string, string | undefined];
    
    return permissions.some(p => 
      p.resource === resource && 
      p.action === action && 
      (p.scope === scope || p.scope === 'all')
    );
  }

  static hasAnyPermission(ctx: AccessContext, permissions: PermissionString[]): boolean {
    return permissions.some(p => this.hasPermission(ctx, p));
  }

  static hasAllPermissions(ctx: AccessContext, permissions: PermissionString[]): boolean {
    return permissions.every(p => this.hasPermission(ctx, p));
  }

  static async canAccessResource(
    ctx: AccessContext,
    resource: Resource,
    resourceId: string
  ): Promise<boolean> {
    if (ctx.role === UserRole.Admin) return true;
    
    if (ctx.role === UserRole.Teacher) {
      if (resource === 'class') {
        const { data } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', resourceId)
          .single();
        return data?.teacher_id === ctx.userId;
      }
      if (resource === 'homework' || resource === 'exam' || resource === 'attendance') {
        const table = resource === 'homework' ? 'homework' : resource === 'exam' ? 'exams' : 'attendance';
        const { data } = await supabase
          .from(table)
          .select('class_id')
          .eq('id', resourceId)
          .single();
        if (data?.class_id) {
          const { data: classData } = await supabase
            .from('classes')
            .select('teacher_id')
            .eq('id', data.class_id)
            .single();
          return classData?.teacher_id === ctx.userId;
        }
      }
    }
    
    if (ctx.role === UserRole.Student) {
      if (resource === 'homework' || resource === 'exam' || resource === 'attendance') {
        const { data: enrollment } = await supabase
          .from('student_classes')
          .select('id')
          .eq('student_id', ctx.userId)
          .single();
        return !!enrollment;
      }
    }
    
    return false;
  }

  static getPermissions(role: UserRole): Permission[] {
    return PERMISSION_MATRIX[role] || [];
  }
}