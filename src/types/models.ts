export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  entryLevel: string;
  targetOutcome: string;
  parentName?: string;
  createdAt: any;
}

export type ExamType = 'mock' | 'midterm' | 'final' | 'actual' | 'others';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  mock: 'Mock Test',
  midterm: 'Mid-term Test',
  final: 'Final Test',
  actual: 'Actual Test',
  others: 'Others',
};

export interface Class {
  id: string;
  name: string;
  center: string;
  teacher: string;
  totalSessions: number;
  startingLevel: string;
  startDate: string;
  startTime: string;
  endTime: string;
  classDays: string[];
  notes?: string;
  targetOutcome: number;
  sessionsPerWeek: number;
  lessonPlan: LessonSession[];
  examTypes: ExamType[];
}

export interface LessonSession {
  sessionNumber: number;
  date: string;
  contents: string;
  homework: string;
  isExam: boolean;
  deadline?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrolledAt: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'not yet';
}

export interface Homework {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'yes' | 'no' | 'late' | 'not yet';
  mark?: number;
  comments?: string;
}

export interface ExamScore {
  id: string;
  studentId: string;
  date: string;
  writing: number;
  reading: number;
  speaking: number;
  listening: number;
  comment: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetStudentId: string; // 'all' or studentId
  createdAt: any;
}

export interface Message {
  id: string;
  studentId: string;
  authorName: string;
  content: string;
  replyTo?: string; // message ID
  createdAt: any;
}

export type Tab = 'dashboard' | 'classes' | 'students' | 'attendance' | 'homework' | 'exams' | 'communication' | 'reports' | 'profile' | 'export';
