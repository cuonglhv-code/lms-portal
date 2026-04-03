-- =============================================
-- Row Level Security (RLS) Policies
-- Run this AFTER schema.sql
-- =============================================

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND role IN ('admin', 'teacher')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE auth_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is enrolled in a class
CREATE OR REPLACE FUNCTION is_enrolled_in_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_classes sc
    JOIN students s ON sc.student_id = s.id
    WHERE sc.class_id = class_uuid
    AND s.auth_id = auth.uid()
    AND sc.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is the teacher of a class
CREATE OR REPLACE FUNCTION is_teacher_of_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classes
    WHERE id = class_uuid
    AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS POLICIES
-- =============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

-- Teachers can view all users (for user management)
DROP POLICY IF EXISTS "Teachers can view all users" ON users;
CREATE POLICY "Teachers can view all users"
  ON users FOR SELECT
  USING (is_admin() OR is_teacher());

-- Admins can manage users
DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (is_admin());

-- Service role bypass (for migrations)
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- STUDENTS POLICIES
-- =============================================

-- Students can view own profile
DROP POLICY IF EXISTS "Students can view own profile" ON students;
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  USING (auth_id = auth.uid());

-- Teachers can view enrolled students
DROP POLICY IF EXISTS "Teachers can view enrolled students" ON students;
CREATE POLICY "Teachers can view enrolled students"
  ON students FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM student_classes sc
      JOIN classes c ON sc.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE sc.student_id = students.id
      AND u.auth_id = auth.uid()
      AND sc.status = 'active'
    )
  );

-- Teachers/Admins can manage students
DROP POLICY IF EXISTS "Teachers can manage students" ON students;
CREATE POLICY "Teachers can manage students"
  ON students FOR ALL
  USING (is_admin() OR is_teacher());

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage students" ON students;
CREATE POLICY "Service role can manage students"
  ON students FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- CENTERS POLICIES
-- =============================================

-- Authenticated users can view active centers
DROP POLICY IF EXISTS "View active centers" ON centers;
CREATE POLICY "View active centers"
  ON centers FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage centers
DROP POLICY IF EXISTS "Admins can manage centers" ON centers;
CREATE POLICY "Admins can manage centers"
  ON centers FOR ALL
  USING (is_admin());

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage centers" ON centers;
CREATE POLICY "Service role can manage centers"
  ON centers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- CLASSES POLICIES
-- =============================================

-- Authenticated users can view classes
DROP POLICY IF EXISTS "View classes" ON classes;
CREATE POLICY "View classes"
  ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Teachers can view their classes
DROP POLICY IF EXISTS "Teachers can view their classes" ON classes;
CREATE POLICY "Teachers can view their classes"
  ON classes FOR SELECT
  USING (teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR is_admin());

-- Teachers can manage their classes
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
CREATE POLICY "Teachers can manage their classes"
  ON classes FOR ALL
  USING (
    is_admin()
    OR teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage classes" ON classes;
CREATE POLICY "Service role can manage classes"
  ON classes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- ENROLLMENTS POLICIES
-- =============================================

-- Students can view their enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON student_classes;
CREATE POLICY "Students can view own enrollments"
  ON student_classes FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Teachers can view enrollments for their classes
DROP POLICY IF EXISTS "Teachers can view class enrollments" ON student_classes;
CREATE POLICY "Teachers can view class enrollments"
  ON student_classes FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Teachers can manage enrollments
DROP POLICY IF EXISTS "Teachers can manage enrollments" ON student_classes;
CREATE POLICY "Teachers can manage enrollments"
  ON student_classes FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage enrollments" ON student_classes;
CREATE POLICY "Service role can manage enrollments"
  ON student_classes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- HOMEWORK POLICIES
-- =============================================

-- Students can view homework for enrolled classes
DROP POLICY IF EXISTS "Students can view enrolled homework" ON homework;
CREATE POLICY "Students can view enrolled homework"
  ON homework FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_classes sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.class_id = homework.class_id
      AND s.auth_id = auth.uid()
      AND sc.status = 'active'
    )
  );

-- Teachers can manage homework
DROP POLICY IF EXISTS "Teachers can manage homework" ON homework;
CREATE POLICY "Teachers can manage homework"
  ON homework FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage homework" ON homework;
CREATE POLICY "Service role can manage homework"
  ON homework FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- HOMEWORK SUBMISSIONS POLICIES
-- =============================================

-- Students can manage own submissions
DROP POLICY IF EXISTS "Students can manage own submissions" ON homework_submissions;
CREATE POLICY "Students can manage own submissions"
  ON homework_submissions FOR ALL
  USING (
    student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Teachers can manage submissions for their classes
DROP POLICY IF EXISTS "Teachers can manage class submissions" ON homework_submissions;
CREATE POLICY "Teachers can manage class submissions"
  ON homework_submissions FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes c
      JOIN homework h ON h.class_id = c.id
      WHERE h.id = homework_id
      AND c.teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage submissions" ON homework_submissions;
CREATE POLICY "Service role can manage submissions"
  ON homework_submissions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- EXAMS POLICIES
-- =============================================

-- Students can view exams for enrolled classes
DROP POLICY IF EXISTS "Students can view enrolled exams" ON exams;
CREATE POLICY "Students can view enrolled exams"
  ON exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_classes sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.class_id = exams.class_id
      AND s.auth_id = auth.uid()
    )
  );

-- Teachers can manage exams
DROP POLICY IF EXISTS "Teachers can manage exams" ON exams;
CREATE POLICY "Teachers can manage exams"
  ON exams FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage exams" ON exams;
CREATE POLICY "Service role can manage exams"
  ON exams FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- EXAM SCORES POLICIES
-- =============================================

-- Students can view own scores
DROP POLICY IF EXISTS "Students can view own scores" ON exam_scores;
CREATE POLICY "Students can view own scores"
  ON exam_scores FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Teachers can manage scores
DROP POLICY IF EXISTS "Teachers can manage scores" ON exam_scores;
CREATE POLICY "Teachers can manage scores"
  ON exam_scores FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes c
      JOIN exams e ON e.class_id = c.id
      WHERE e.id = exam_id
      AND c.teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage scores" ON exam_scores;
CREATE POLICY "Service role can manage scores"
  ON exam_scores FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- ATTENDANCE POLICIES
-- =============================================

-- Students can view own attendance
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Teachers can manage attendance
DROP POLICY IF EXISTS "Teachers can manage attendance" ON attendance;
CREATE POLICY "Teachers can manage attendance"
  ON attendance FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage attendance" ON attendance;
CREATE POLICY "Service role can manage attendance"
  ON attendance FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- SESSIONS POLICIES
-- =============================================

-- Students can view sessions for enrolled classes
DROP POLICY IF EXISTS "Students can view enrolled sessions" ON sessions;
CREATE POLICY "Students can view enrolled sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_classes sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.class_id = sessions.class_id
      AND s.auth_id = auth.uid()
    )
  );

-- Teachers can manage sessions
DROP POLICY IF EXISTS "Teachers can manage sessions" ON sessions;
CREATE POLICY "Teachers can manage sessions"
  ON sessions FOR ALL
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes WHERE id = class_id AND teacher_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;
CREATE POLICY "Service role can manage sessions"
  ON sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- MESSAGES POLICIES
-- =============================================

-- Users can view messages where they are sender or recipient
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR recipient_type = 'all'
    OR recipient_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Users can send messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR is_admin()
    OR auth.jwt()->>'role' = 'service_role'
  );

-- Users can update own messages
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR is_admin()
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role can manage messages" ON messages;
CREATE POLICY "Service role can manage messages"
  ON messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- AUDIT LOGS POLICIES
-- =============================================

-- Only service role can view audit logs
DROP POLICY IF EXISTS "Service role can view audit logs" ON audit_logs;
CREATE POLICY "Service role can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Service role can insert audit logs
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
