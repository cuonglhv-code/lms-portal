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
  | 'enroll'
  | 'submit'
  | 'grade'
  | 'export'
  | 'publish';

export interface Permission {
  resource: Resource;
  action: Action;
}

export type PermissionString = `${Resource}:${Action}`;

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
  CLASS_ENROLL: 'class:enroll' as PermissionString,
  
  HOMEWORK_READ: 'homework:read' as PermissionString,
  HOMEWORK_CREATE: 'homework:create' as PermissionString,
  HOMEWORK_UPDATE: 'homework:update' as PermissionString,
  HOMEWORK_DELETE: 'homework:delete' as PermissionString,
  HOMEWORK_SUBMIT: 'homework:submit' as PermissionString,
  HOMEWORK_GRADE: 'homework:grade' as PermissionString,
  
  EXAM_READ: 'exam:read' as PermissionString,
  EXAM_CREATE: 'exam:create' as PermissionString,
  EXAM_UPDATE: 'exam:update' as PermissionString,
  EXAM_DELETE: 'exam:delete' as PermissionString,
  EXAM_GRADE: 'exam:grade' as PermissionString,
  
  ATTENDANCE_READ: 'attendance:read' as PermissionString,
  ATTENDANCE_UPDATE: 'attendance:update' as PermissionString,
  
  REPORT_READ: 'report:read' as PermissionString,
  REPORT_EXPORT: 'report:export' as PermissionString,
  
  MESSAGE_READ: 'message:read' as PermissionString,
  MESSAGE_CREATE: 'message:create' as PermissionString,
  
  CENTER_READ: 'center:read' as PermissionString,
  CENTER_CREATE: 'center:create' as PermissionString,
  CENTER_UPDATE: 'center:update' as PermissionString,
  CENTER_DELETE: 'center:delete' as PermissionString,
} as const;

export const REQUIREMENTS = {
  PUBLISH_COURSE: { resource: 'class', action: 'publish' } as Permission,
  SUBMIT_GRADE: { resource: 'exam', action: 'grade' } as Permission,
  ENROLL_STUDENT: { resource: 'class', action: 'enroll' } as Permission,
  CREATE_HOMEWORK: { resource: 'homework', action: 'create' } as Permission,
  GRADE_HOMEWORK: { resource: 'homework', action: 'grade' } as Permission,
  VIEW_ALL_STUDENTS: { resource: 'student', action: 'read' } as Permission,
} as const;