-- ============================================================
-- EduOS LMS RBAC v3 - Normalized Permission Tables
-- Date: 2026-04-07
-- Purpose: Add lookup tables for role-based permissions
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Create lookup tables
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('teacher', 'Class and student management'),
  ('student', 'Own data access only')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  UNIQUE(resource, action)
);

-- Insert default permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- User permissions
  ('user', 'read', 'View user profiles'),
  ('user', 'create', 'Create new users'),
  ('user', 'update', 'Update user profiles'),
  ('user', 'delete', 'Delete users'),
  -- Student permissions
  ('student', 'read', 'View student records'),
  ('student', 'create', 'Create student records'),
  ('student', 'update', 'Update student records'),
  ('student', 'delete', 'Delete student records'),
  -- Class permissions
  ('class', 'read', 'View class information'),
  ('class', 'create', 'Create new classes'),
  ('class', 'update', 'Update class details'),
  ('class', 'delete', 'Delete classes'),
  ('class', 'enroll', 'Enroll students in classes'),
  -- Homework permissions
  ('homework', 'read', 'View homework'),
  ('homework', 'create', 'Create homework'),
  ('homework', 'update', 'Update homework'),
  ('homework', 'delete', 'Delete homework'),
  ('homework', 'submit', 'Submit homework'),
  ('homework', 'grade', 'Grade homework submissions'),
  -- Exam permissions
  ('exam', 'read', 'View exams'),
  ('exam', 'create', 'Create exams'),
  ('exam', 'update', 'Update exams'),
  ('exam', 'delete', 'Delete exams'),
  ('exam', 'grade', 'Grade exam scores'),
  -- Attendance permissions
  ('attendance', 'read', 'View attendance'),
  ('attendance', 'update', 'Mark attendance'),
  -- Report permissions
  ('report', 'read', 'View reports'),
  ('report', 'export', 'Export reports'),
  -- Message permissions
  ('message', 'read', 'View messages'),
  ('message', 'create', 'Send messages'),
  -- Center permissions
  ('center', 'read', 'View centers'),
  ('center', 'create', 'Create centers'),
  ('center', 'update', 'Update centers'),
  ('center', 'delete', 'Delete centers')
ON CONFLICT (resource, action) DO NOTHING;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- Step 2: Seed role_permissions (maps roles to permissions)
-- ============================================================

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'teacher'
AND p.resource IN ('class', 'student', 'homework', 'exam', 'attendance', 'report', 'message')
AND p.action IN ('read', 'create', 'update', 'enroll', 'grade', 'export', 'submit')
ON CONFLICT DO NOTHING;

-- Student permissions (read own, submit homework, view exams)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'student'
AND (
  (p.resource = 'homework' AND p.action IN ('read', 'submit'))
  OR (p.resource = 'exam' AND p.action = 'read')
  OR (p.resource = 'attendance' AND p.action = 'read')
  OR (p.resource = 'class' AND p.action = 'read')
  OR (p.resource = 'message' AND p.action IN ('read', 'create'))
  OR (p.resource = 'report' AND p.action = 'read')
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Step 3: Add role_id to users table (Safe Migration)
-- ============================================================

-- Only add if column doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);
  END IF;
END $$;

-- Update existing users with role_id based on their role column
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role = r.name
AND u.role_id IS NULL;

-- ============================================================
-- Step 4: Enable RLS on new tables
-- ============================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 5: High-Performance RLS Helper Function
-- ============================================================

DROP FUNCTION IF EXISTS user_has_permission(TEXT, TEXT);

CREATE OR REPLACE FUNCTION user_has_permission(requested_resource TEXT, requested_action TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN users u ON u.role_id = rp.role_id
    WHERE u.auth_id = auth.uid()
    AND p.resource = requested_resource
    AND p.action = requested_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional helper: Check if user is admin
CREATE OR REPLACE FUNCTION is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_permission('user', 'delete'); -- Admin has all permissions
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;