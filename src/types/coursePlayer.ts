export type ContentType = 'video' | 'reading' | 'quiz' | 'assignment';
export type LessonStatus = 'locked' | 'completed' | 'in_progress' | 'not_started';

export interface Lesson {
  id: string;
  title: string;
  contentType: ContentType;
  status: LessonStatus;
  estimatedMinutes: number;
  order: number;
  videoUrl?: string;
  content?: string;
  quizId?: string;
  isLocked: boolean;
  completedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  isLocked: boolean;
  isExpanded?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  instructor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  totalDuration: number;
  totalLessons: number;
  modules: Module[];
  progress: number;
  enrolledAt?: string;
  lastAccessedAt?: string;
}

export interface CoursePlayerState {
  currentModuleId: string | null;
  currentLessonId: string | null;
  sidebarOpen: boolean;
  activeTab: 'overview' | 'notes' | 'discussion' | 'resources';
}

export interface TabItem {
  id: 'overview' | 'notes' | 'discussion' | 'resources';
  label: string;
  icon: string;
}