export type Resource = 
  | 'user' 
  | 'student' 
  | 'class' 
  | 'homework' 
  | 'exam' 
  | 'attendance' 
  | 'message' 
  | 'report'
  | 'center'
  | 'session';

export type Action = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'publish'
  | 'export';

export type Scope = 'own' | 'class' | 'all';

export interface Permission {
  resource: Resource;
  action: Action;
  scope?: Scope;
}

export type PermissionString = `${Resource}:${Action}` | `${Resource}:${Action}:${Scope}`;

export const PERMISSIONS = {
  USER_READ: 'user:read' as PermissionString,
  USER_CREATE: 'user:create' as PermissionString,
  USER_UPDATE: 'user:update' as PermissionString,
  USER_DELETE: 'user:delete' as PermissionString,
  
  STUDENT_READ: 'student:read' as PermissionString,
  STUDENT_CREATE: 'student:create' as PermissionString,
  STUDENT_UPDATE: 'student:update' as PermissionString,
  STUDENT_DELETE: 'student:delete' as PermissionString,
  
  CLASS_READ: 'class:read' as PermissionString,
  CLASS_CREATE: 'class:create' as PermissionString,
  CLASS_UPDATE: 'class:update' as PermissionString,
  CLASS_DELETE: 'class:delete' as PermissionString,
  
  HOMEWORK_READ: 'homework:read' as PermissionString,
  HOMEWORK_CREATE: 'homework:create' as PermissionString,
  HOMEWORK_UPDATE: 'homework:update' as PermissionString,
  
  EXAM_READ: 'exam:read' as PermissionString,
  EXAM_CREATE: 'exam:create' as PermissionString,
  EXAM_UPDATE: 'exam:update' as PermissionString,
  
  ATTENDANCE_READ: 'attendance:read' as PermissionString,
  ATTENDANCE_UPDATE: 'attendance:update' as PermissionString,
  
  REPORT_EXPORT: 'report:export' as PermissionString,
} as const;