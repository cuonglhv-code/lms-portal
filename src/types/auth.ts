export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export type UserStatus = 'active' | 'suspended' | 'invited' | 'archived';

export interface UserRecord {
  id: string; // Firestore document ID
  authUid?: string; // Firebase Auth UID
  email: string;
  displayName: string;
  role: UserRole;
  status?: UserStatus;
  createdAt: number; // Unix timestamp for easier Firestore sorting
  updatedAt?: number;
  lastLoginAt?: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}
