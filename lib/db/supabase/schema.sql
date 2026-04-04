-- =============================================
-- Jaxtina Teacher Portal - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- CENTERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS TABLE (Teachers)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'student')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- =============================================
-- STUDENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT,
  parent_name TEXT,
  parent_email TEXT,
  entry_level TEXT DEFAULT '',
  target_outcome TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive', 'graduated'))
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_auth_id ON students(auth_id);

-- =============================================
-- CLASSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  center_id UUID REFERENCES centers(id) ON DELETE SET NULL,
  schedule JSONB DEFAULT '[]',
  max_students INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  starting_level TEXT DEFAULT '',
  target_outcome INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 20,
  sessions_per_week INTEGER DEFAULT 2,
  start_date TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  class_days JSONB DEFAULT '[]',
  lesson_plan JSONB DEFAULT '[]',
  exam_types JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_center ON classes(center_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);

-- =============================================
-- STUDENT-CLASS ENROLLMENTS (Junction Table)
-- =============================================
CREATE TABLE IF NOT EXISTS student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  dropped_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(student_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_student ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_class ON student_classes(class_id);

-- =============================================
-- HOMEWORK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  due_date TIMESTAMPTZ,
  total_points INTEGER DEFAULT 100,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_due ON homework(due_date);

-- =============================================
-- HOMEWORK SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  points_earned INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  UNIQUE(homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON homework_submissions(student_id);

-- =============================================
-- EXAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_points INTEGER DEFAULT 100,
  exam_type TEXT DEFAULT 'test' CHECK (exam_type IN ('test', 'quiz', 'midterm', 'final', 'project')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);

-- =============================================
-- EXAM SCORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS exam_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score INTEGER,
  percentage DECIMAL(5,2),
  grade TEXT,
  comments TEXT,
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_exam ON exam_scores(exam_id);
CREATE INDEX IF NOT EXISTS idx_scores_student ON exam_scores(student_id);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- =============================================
-- SESSIONS (Lesson Planning)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  homework_id UUID REFERENCES homework(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_class ON sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID,
  sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'student', 'system')),
  recipient_id UUID NOT NULL,
  recipient_type TEXT DEFAULT 'student' CHECK (recipient_type IN ('student', 'class', 'all')),
  title TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'announcement', 'system')),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_class ON messages(class_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS students_updated_at ON students;
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS classes_updated_at ON classes;
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS centers_updated_at ON centers;
CREATE TRIGGER centers_updated_at BEFORE UPDATE ON centers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS homework_updated_at ON homework;
CREATE TRIGGER homework_updated_at BEFORE UPDATE ON homework FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS attendance_updated_at ON attendance;
CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
