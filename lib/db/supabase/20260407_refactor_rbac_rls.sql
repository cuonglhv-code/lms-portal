-- ============================================================
-- EduOS LMS RBAC v2 Migration
-- Date: 2026-04-07
-- Purpose: Replace messy RLS with permission-based policies
-- ============================================================

BEGIN;

-- ============================================================
-- SAFETY: Drop old policies by name (prevent overlapping policies)
-- ============================================================

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Teachers can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Students table
DROP POLICY IF EXISTS "Students can view own profile" ON students;
DROP POLICY IF EXISTS "Teachers can view enrolled students" ON students;
DROP POLICY IF EXISTS "Teachers can manage students" ON students;
DROP POLICY IF EXISTS "Service role can manage students" ON students;

-- Centers table
DROP POLICY IF EXISTS "View active centers" ON centers;
DROP POLICY IF EXISTS "Admins can manage centers" ON centers;
DROP POLICY IF EXISTS "Service role can manage centers" ON centers;

-- Classes table
DROP POLICY IF EXISTS "View classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
DROP POLICY IF EXISTS "Service role can manage classes" ON classes;

-- Enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON student_classes;
DROP POLICY IF EXISTS "Teachers can view class enrollments" ON student_classes;
DROP POLICY IF EXISTS "Teachers can manage enrollments" ON student_classes;
DROP POLICY IF EXISTS "Service role can manage enrollments" ON student_classes;

-- Homework
DROP POLICY IF EXISTS "Students can view enrolled homework" ON homework;
DROP POLICY IF EXISTS "Teachers can manage homework" ON homework;
DROP POLICY IF EXISTS "Service role can manage homework" ON homework;

-- Homework Submissions
DROP POLICY IF EXISTS "Students can manage own submissions" ON homework_submissions;
DROP POLICY IF EXISTS "Teachers can manage class submissions" ON homework_submissions;
DROP POLICY IF EXISTS "Service role can manage submissions" ON homework_submissions;

-- Exams
DROP POLICY IF EXISTS "Students can view enrolled exams" ON exams;
DROP POLICY IF EXISTS "Teachers can manage exams" ON exams;
DROP POLICY IF EXISTS "Service role can manage exams" ON exams;

-- Exam Scores
DROP POLICY IF EXISTS "Students can view own scores" ON exam_scores;
DROP POLICY IF EXISTS "Teachers can manage scores" ON exam_scores;
DROP POLICY IF EXISTS "Service role can manage scores" ON exam_scores;

-- Attendance
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Service role can manage attendance" ON attendance;

-- Sessions
DROP POLICY IF EXISTS "Students can view enrolled sessions" ON sessions;
DROP POLICY IF EXISTS "Teachers can manage sessions" ON sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;

-- Messages
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Service role can manage messages" ON messages;

-- Audit Logs
DROP POLICY IF EXISTS "Service role can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

-- ============================================================
-- Step 1: Create admins table (replaces hardcoded emails)
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role_name TEXT DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_email CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Insert current hardcoded admins
INSERT INTO admins (email, role_name, is_active) VALUES
  ('cuonglhv@gmail.com', 'super_admin', true),
  ('cuonglhv@jaxtina.com', 'super_admin', true),
  ('lecuong.ueh@gmail.com', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- ============================================================
-- Step 2: Optimized RLS Helper Functions
-- ============================================================

-- Get current authenticated user ID once per transaction
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT (SELECT auth.uid());
$$ LANGUAGE SQL STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = current_user_id() AND a.is_active)
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_user_id() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is teacher (includes admins)
CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin() OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_user_id() 
    AND role = 'teacher' 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is the teacher of a specific class
CREATE OR REPLACE FUNCTION is_class_teacher(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = class_uuid
    AND c.teacher_id = current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is enrolled in a class
CREATE OR REPLACE FUNCTION is_class_student(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_classes sc
    JOIN students s ON sc.student_id = s.id
    WHERE sc.class_id = class_uuid
    AND s.auth_id = (SELECT auth.uid())
    AND sc.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Step 3: Core RLS v2 Policies - Deny by Default
-- ============================================================

-- ======================
-- USERS TABLE
-- ======================

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth_id = current_user_id());

CREATE POLICY "admins_read_users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_manage_users" ON users
  FOR ALL USING (is_admin());

-- ======================
-- STUDENTS TABLE
-- ======================

CREATE POLICY "students_read_own" ON students
  FOR SELECT USING (email = (SELECT auth.jwt()->>'email'));

CREATE POLICY "teachers_read_students" ON students
  FOR SELECT USING (is_admin() OR is_teacher_or_admin());

CREATE POLICY "teachers_manage_students" ON students
  FOR ALL USING (is_admin() OR is_teacher_or_admin());

-- ======================
-- CENTERS TABLE
-- ======================

CREATE POLICY "centers_read_active" ON centers
  FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'active');

CREATE POLICY "admins_manage_centers" ON centers
  FOR ALL USING (is_admin());

-- ======================
-- CLASSES TABLE
-- ======================

CREATE POLICY "classes_read_active" ON classes
  FOR SELECT USING (
    status = 'active' 
    AND (is_admin() OR is_teacher_or_admin() OR is_class_student(id))
  );

CREATE POLICY "teachers_manage_classes" ON classes
  FOR ALL USING (is_admin() OR teacher_id = current_user_id());

-- ======================
-- ENROLLMENTS TABLE
-- ======================

CREATE POLICY "students_view_enrollments" ON student_classes
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
  );

CREATE POLICY "teachers_view_enrollments" ON student_classes
  FOR SELECT USING (
    is_admin() OR is_teacher_or_admin()
  );

CREATE POLICY "teachers_manage_enrollments" ON student_classes
  FOR ALL USING (is_admin() OR is_teacher_or_admin());

-- ======================
-- HOMEWORK TABLE
-- ======================

CREATE POLICY "homework_read_access" ON homework
  FOR SELECT USING (
    is_admin() 
    OR is_teacher_or_admin()
    OR EXISTS (
      SELECT 1 FROM student_classes sc
      WHERE sc.class_id = homework.class_id
      AND sc.student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
    )
  );

CREATE POLICY "teachers_manage_homework" ON homework
  FOR ALL USING (is_admin() OR is_teacher_or_admin());

-- ======================
-- HOMEWORK SUBMISSIONS
-- ======================

CREATE POLICY "students_manage_submissions" ON homework_submissions
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
  );

CREATE POLICY "teachers_manage_submissions" ON homework_submissions
  FOR ALL USING (is_admin() OR is_teacher_or_admin());

-- ======================
-- EXAMS TABLE
-- ======================

CREATE POLICY "exams_read_access" ON exams
  FOR SELECT USING (
    is_admin() 
    OR is_teacher_or_admin()
    OR EXISTS (
      SELECT 1 FROM student_classes sc
      WHERE sc.class_id = exams.class_id
      AND sc.student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
    )
  );

CREATE POLICY "teachers_manage_exams" ON exams
  FOR ALL USING (is_admin() OR is_teacher_or_admin());

-- ======================
-- EXAM_SCORES TABLE (CRITICAL)
-- ======================

CREATE POLICY "students_read_own_scores" ON exam_scores
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
  );

CREATE POLICY "teachers_manage_scores" ON exam_scores
  FOR ALL USING (
    is_admin() 
    OR EXISTS (
      SELECT 1 FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE e.id = exam_id
      AND c.teacher_id = current_user_id()
    )
  );

-- ======================
-- ATTENDANCE TABLE
-- ======================

CREATE POLICY "students_read_attendance" ON attendance
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
  );

CREATE POLICY "teachers_manage_attendance" ON attendance
  FOR ALL USING (is_admin() OR is_class_teacher(class_id));

-- ======================
-- SESSIONS TABLE
-- ======================

CREATE POLICY "sessions_read_access" ON sessions
  FOR SELECT USING (
    is_admin() 
    OR is_teacher_or_admin()
    OR is_class_student(class_id)
  );

CREATE POLICY "teachers_manage_sessions" ON sessions
  FOR ALL USING (is_admin() OR is_class_teacher(class_id));

-- ======================
-- MESSAGES TABLE
-- ======================

CREATE POLICY "users_read_messages" ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = current_user_id())
    OR recipient_id IN (SELECT id FROM users WHERE auth_id = current_user_id())
    OR recipient_type = 'all'
    OR recipient_id IN (SELECT id FROM students WHERE auth_id = current_user_id())
  );

CREATE POLICY "users_insert_messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = current_user_id())
    OR is_admin()
  );

CREATE POLICY "users_update_messages" ON messages
  FOR UPDATE USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = current_user_id())
    OR is_admin()
  );

-- ======================
-- AUDIT LOGS (Service role only)
-- ======================

CREATE POLICY "service_role_audit_logs" ON audit_logs
  FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- ======================
-- ADMINS TABLE
-- ======================

CREATE POLICY "admins_read_all" ON admins
  FOR SELECT USING (is_admin());

CREATE POLICY "admins_manage_all" ON admins
  FOR ALL USING (is_admin());

COMMIT;