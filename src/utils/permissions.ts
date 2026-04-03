import { UserRole } from '../types/auth';

export type Permission =
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  | 'classes.view'
  | 'classes.create'
  | 'classes.edit'
  | 'classes.delete'
  | 'students.view'
  | 'students.create'
  | 'students.edit'
  | 'students.delete'
  | 'attendance.mark'
  | 'attendance.view'
  | 'homework.view'
  | 'homework.grade'
  | 'homework.submit'
  | 'exams.view'
  | 'exams.grade'
  | 'exams.view_own'
  | 'announcements.view'
  | 'announcements.create'
  | 'announcements.delete'
  | 'messages.send'
  | 'messages.view_own'
  | 'data.export'
  | 'data.bulk_operations';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_roles',
    'classes.view',
    'classes.create',
    'classes.edit',
    'classes.delete',
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'attendance.mark',
    'attendance.view',
    'homework.view',
    'homework.grade',
    'homework.submit',
    'exams.view',
    'exams.grade',
    'exams.view_own',
    'announcements.view',
    'announcements.create',
    'announcements.delete',
    'messages.send',
    'messages.view_own',
    'data.export',
    'data.bulk_operations',
  ],
  [UserRole.Teacher]: [
    'classes.view',
    'classes.edit',
    'students.view',
    'attendance.mark',
    'attendance.view',
    'homework.view',
    'homework.grade',
    'homework.submit',
    'exams.view',
    'exams.grade',
    'announcements.view',
    'announcements.create',
    'messages.send',
    'messages.view_own',
  ],
  [UserRole.Student]: [
    'homework.submit',
    'homework.view',
    'exams.view_own',
    'exams.view',
    'announcements.view',
    'messages.send',
    'messages.view_own',
    'attendance.view',
  ],
};

export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole | null, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole | null, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function getPermissions(role: UserRole | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canManageUser(actorRole: UserRole | null, targetRole: UserRole): boolean {
  if (!actorRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.Admin]: 3,
    [UserRole.Teacher]: 2,
    [UserRole.Student]: 1,
  };
  
  return roleHierarchy[actorRole] > roleHierarchy[targetRole];
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.Admin]: 'Administrator',
    [UserRole.Teacher]: 'Teacher',
    [UserRole.Student]: 'Student',
  };
  return labels[role] ?? role;
}

export function getRoleColor(role: UserRole): { bg: string; text: string } {
  const colors: Record<UserRole, { bg: string; text: string }> = {
    [UserRole.Admin]: { bg: 'bg-purple-100', text: 'text-purple-800' },
    [UserRole.Teacher]: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    [UserRole.Student]: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  };
  return colors[role] ?? { bg: 'bg-gray-100', text: 'text-gray-800' };
}
