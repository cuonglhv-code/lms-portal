// Supabase Database Types
// These match the Postgres schema in lib/db/supabase/schema.sql

export interface DbUser {
  id: string
  auth_id: string | null
  email: string
  display_name: string | null
  role: 'admin' | 'teacher' | 'student'
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_login: string | null
  status: 'active' | 'suspended' | 'invited' | 'archived'
}

export interface DbStudent {
  id: string
  auth_id: string | null
  email: string
  display_name: string
  phone: string | null
  parent_name: string | null
  parent_email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  status: 'active' | 'suspended' | 'inactive' | 'graduated'
}

export interface DbCenter {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface DbClass {
  id: string
  name: string
  description: string | null
  subject: string | null
  grade_level: string | null
  teacher_id: string | null
  center_id: string | null
  schedule: ClassSchedule[]
  max_students: number
  status: 'active' | 'archived' | 'draft'
  created_at: string
  updated_at: string
}

export interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
  room?: string
}

export interface DbStudentClass {
  id: string
  student_id: string
  class_id: string
  enrolled_at: string
  dropped_at: string | null
  status: 'active' | 'dropped' | 'completed'
}

export interface DbHomework {
  id: string
  class_id: string
  title: string
  description: string | null
  content: string | null
  attachments: FileAttachment[]
  due_date: string | null
  total_points: number
  created_by: string | null
  created_at: string
  updated_at: string
  status: 'active' | 'draft' | 'archived'
}

export interface FileAttachment {
  name: string
  url: string
  type?: string
}

export interface DbHomeworkSubmission {
  id: string
  homework_id: string
  student_id: string
  content: string | null
  attachments: FileAttachment[]
  submitted_at: string
  graded_at: string | null
  points_earned: number | null
  feedback: string | null
  graded_by: string | null
  status: 'submitted' | 'graded' | 'returned'
}

export interface DbExam {
  id: string
  class_id: string
  title: string
  description: string | null
  exam_date: string | null
  duration_minutes: number | null
  total_points: number
  exam_type: 'test' | 'quiz' | 'midterm' | 'final' | 'project'
  created_by: string | null
  created_at: string
  updated_at: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'archived'
}

export interface DbExamScore {
  id: string
  exam_id: string
  student_id: string
  score: number | null
  percentage: number | null
  grade: string | null
  comments: string | null
  graded_by: string | null
  graded_at: string | null
  created_at: string
}

export interface DbAttendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface DbSession {
  id: string
  class_id: string
  title: string
  content: string | null
  session_date: string
  duration_minutes: number
  homework_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  sender_id: string | null
  sender_type: 'user' | 'student' | 'system'
  recipient_id: string
  recipient_type: 'student' | 'class' | 'all'
  title: string | null
  content: string
  message_type: 'direct' | 'announcement' | 'system'
  class_id: string | null
  attachments: FileAttachment[]
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface DbAuditLog {
  id: string
  actor_id: string | null
  actor_email: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
