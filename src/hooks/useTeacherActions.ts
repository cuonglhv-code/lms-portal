import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { dbService } from '../services/dbService';
import { Student, Class, Attendance, Homework } from '../types/models';
import { UserRole } from '../types/auth';

/**
 * Hook to provide pre-authenticated database actions for teachers and admins.
 */
export function useTeacherActions() {
  const { user, role } = useAuth();
  const userId = user?.uid || 'anonymous';
  const userRole = role as UserRole;

  const addStudent = useCallback((data: Omit<Student, 'id' | 'createdAt'>) => 
    dbService.addStudent(data, userId, userRole), [userId, userRole]);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => 
    dbService.updateStudent(id, data, userId, userRole), [userId, userRole]);

  const deleteStudent = useCallback((id: string) => 
    dbService.deleteStudent(id, userId, userRole), [userId, userRole]);

  const addClass = useCallback((data: Omit<Class, 'id'>) => 
    dbService.addClass(data, userId, userRole), [userId, userRole]);

  const updateClass = useCallback((id: string, data: Partial<Class>) => 
    dbService.updateClass(id, data, userId, userRole), [userId, userRole]);

  const deleteClass = useCallback((id: string) => 
    dbService.deleteClass(id, userId, userRole), [userId, userRole]);

  const enrollStudent = useCallback((studentId: string, classId: string) => 
    dbService.enrollStudent(studentId, classId, userId, userRole), [userId, userRole]);

  const unenrollStudent = useCallback((enrollmentId: string) => 
    dbService.unenrollStudent(enrollmentId, userId, userRole), [userId, userRole]);

  const updateAttendance = useCallback((studentId: string, classId: string, date: string, status: Attendance['status']) => 
    dbService.updateAttendance(studentId, classId, date, status, userId, userRole), [userId, userRole]);

  const updateHomework = useCallback((studentId: string, classId: string, date: string, status: Homework['status'], mark?: number, comments?: string) => 
    dbService.updateHomework(studentId, classId, date, status, userId, userRole, mark, comments), [userId, userRole]);

  const updateExamScore = useCallback((studentId: string, date: string, field: string, value: any) => 
    dbService.updateExamScore(studentId, date, field, value, userId, userRole), [userId, userRole]);

  const addAnnouncement = useCallback((title: string, content: string, target: string) => 
    dbService.addAnnouncement(title, content, target, userId, userRole), [userId, userRole]);

  const deleteAnnouncement = useCallback((id: string) => 
    dbService.deleteAnnouncement(id, userId, userRole), [userId, userRole]);

  const addMessage = useCallback((studentId: string, content: string, replyTo?: string) => 
    dbService.addMessage(studentId, content, user?.displayName || user?.email || 'Teacher', userId, userRole, replyTo), [userId, userRole, user]);

  const deleteMessage = useCallback((id: string) => 
    dbService.deleteMessage(id, userId, userRole), [userId, userRole]);

  const importStudentsBatch = useCallback(async (students: Array<{ name: string; email: string; phone?: string; entryLevel?: string; targetOutcome?: string }>) => {
    for (const s of students) {
      await dbService.addStudent(s, userId, userRole);
    }
  }, [userId, userRole]);

  const importClassesBatch = useCallback(async (classes: Array<{ name: string; center?: string; teacher?: string; totalSessions?: number; startingLevel?: string; startDate?: string; startTime?: string; endTime?: string; classDays?: string[]; targetOutcome?: number; sessionsPerWeek?: number }>) => {
    for (const c of classes) {
      await dbService.addClass({
        name: c.name,
        center: c.center || '',
        teacher: c.teacher || '',
        totalSessions: c.totalSessions || 30,
        startingLevel: c.startingLevel || '',
        startDate: c.startDate || '',
        startTime: c.startTime || '',
        endTime: c.endTime || '',
        classDays: c.classDays || [],
        sessionsPerWeek: c.sessionsPerWeek || 2,
        targetOutcome: c.targetOutcome || 0,
        lessonPlan: [],
        notes: '',
      }, userId, userRole);
    }
  }, [userId, userRole]);

  const importLessonsBatch = useCallback(async (lessons: Array<{ classId: string; sessionNumber: number; date: string; content: string; homework?: string; isExam?: boolean }>) => {
    for (const lesson of lessons) {
      await dbService.addLesson(lesson, userId, userRole);
    }
  }, [userId, userRole]);

  return {
    addStudent,
    updateStudent,
    deleteStudent,
    addClass,
    updateClass,
    deleteClass,
    enrollStudent,
    unenrollStudent,
    updateAttendance,
    updateHomework,
    updateExamScore,
    addAnnouncement,
    deleteAnnouncement,
    addMessage,
    deleteMessage,
    importStudentsBatch,
    importClassesBatch,
    importLessonsBatch,
  };
}
