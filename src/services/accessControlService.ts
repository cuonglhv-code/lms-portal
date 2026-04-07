import { supabase } from '../supabase';
import { UserRole } from '../types/auth';
import { Permission, Resource, PermissionString } from '../types/permissions';

const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'create' },
    { resource: 'user', action: 'update' },
    { resource: 'user', action: 'delete' },
    { resource: 'student', action: 'read' },
    { resource: 'student', action: 'create' },
    { resource: 'student', action: 'update' },
    { resource: 'student', action: 'delete' },
    { resource: 'class', action: 'read' },
    { resource: 'class', action: 'create' },
    { resource: 'class', action: 'update' },
    { resource: 'class', action: 'delete' },
    { resource: 'class', action: 'enroll' },
    { resource: 'homework', action: 'read' },
    { resource: 'homework', action: 'create' },
    { resource: 'homework', action: 'update' },
    { resource: 'homework', action: 'delete' },
    { resource: 'homework', action: 'grade' },
    { resource: 'exam', action: 'read' },
    { resource: 'exam', action: 'create' },
    { resource: 'exam', action: 'update' },
    { resource: 'exam', action: 'delete' },
    { resource: 'exam', action: 'grade' },
    { resource: 'attendance', action: 'read' },
    { resource: 'attendance', action: 'update' },
    { resource: 'report', action: 'read' },
    { resource: 'report', action: 'export' },
    { resource: 'message', action: 'read' },
    { resource: 'message', action: 'create' },
    { resource: 'center', action: 'read' },
    { resource: 'center', action: 'create' },
    { resource: 'center', action: 'update' },
    { resource: 'center', action: 'delete' },
  ],
  
  [UserRole.Teacher]: [
    { resource: 'class', action: 'read' },
    { resource: 'class', action: 'update' },
    { resource: 'class', action: 'enroll' },
    { resource: 'student', action: 'read' },
    { resource: 'student', action: 'update' },
    { resource: 'homework', action: 'read' },
    { resource: 'homework', action: 'create' },
    { resource: 'homework', action: 'update' },
    { resource: 'homework', action: 'grade' },
    { resource: 'exam', action: 'read' },
    { resource: 'exam', action: 'create' },
    { resource: 'exam', action: 'update' },
    { resource: 'exam', action: 'grade' },
    { resource: 'attendance', action: 'read' },
    { resource: 'attendance', action: 'update' },
    { resource: 'report', action: 'read' },
    { resource: 'report', action: 'export' },
    { resource: 'message', action: 'read' },
    { resource: 'message', action: 'create' },
  ],
  
  [UserRole.Student]: [
    { resource: 'homework', action: 'read' },
    { resource: 'homework', action: 'submit' },
    { resource: 'exam', action: 'read' },
    { resource: 'attendance', action: 'read' },
    { resource: 'class', action: 'read' },
    { resource: 'message', action: 'read' },
    { resource: 'message', action: 'create' },
    { resource: 'report', action: 'read' },
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
    
    const [resource, action] = permission.split(':') as [Resource, string];
    
    return permissions.some(p => 
      p.resource === resource && p.action === action
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
      if (resource === 'homework' || resource === 'exam' || resource === 'attendance' || resource === 'class') {
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

  static canPerform(userPermissions: Permission[], required: Permission): boolean {
    return userPermissions.some(
      (p) => p.resource === required.resource && p.action === required.action
    );
  }
}