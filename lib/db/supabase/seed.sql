-- =============================================
-- Jaxtina Teacher Portal - Simple Seed Data
-- Run AFTER schema.sql
-- =============================================

-- Just run these simple INSERT statements

-- CENTERS
INSERT INTO centers (name, address, phone, email, status) VALUES
  ('Downtown Learning Center', '123 Main Street, Downtown', '555-0100', 'downtown@jaxtina.com', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO centers (name, address, phone, email, status) VALUES
  ('Westside Academy', '456 West Avenue, Westside', '555-0200', 'westside@jaxtina.com', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO centers (name, address, phone, email, status) VALUES
  ('North Hills Campus', '789 North Road, North Hills', '555-0300', 'north@jaxtina.com', 'active')
ON CONFLICT DO NOTHING;

-- USERS (Teachers)
INSERT INTO users (auth_id, email, display_name, role, status) VALUES
  (gen_random_uuid(), 'sarah.chen@jaxtina.com', 'Sarah Chen', 'teacher', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (auth_id, email, display_name, role, status) VALUES
  (gen_random_uuid(), 'michael.johnson@jaxtina.com', 'Michael Johnson', 'teacher', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (auth_id, email, display_name, role, status) VALUES
  (gen_random_uuid(), 'emily.davis@jaxtina.com', 'Emily Davis', 'teacher', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (auth_id, email, display_name, role, status) VALUES
  (gen_random_uuid(), 'david.wilson@jaxtina.com', 'David Wilson', 'teacher', 'active')
ON CONFLICT (email) DO NOTHING;

-- Get IDs
DO $$
DECLARE
  downtown_id UUID;
  westside_id UUID;
  north_id UUID;
  teacher1_id UUID;
  teacher2_id UUID;
BEGIN
  SELECT id INTO downtown_id FROM centers WHERE name = 'Downtown Learning Center' LIMIT 1;
  SELECT id INTO westside_id FROM centers WHERE name = 'Westside Academy' LIMIT 1;
  SELECT id INTO north_id FROM centers WHERE name = 'North Hills Campus' LIMIT 1;
  SELECT id INTO teacher1_id FROM users WHERE email = 'sarah.chen@jaxtina.com' LIMIT 1;
  SELECT id INTO teacher2_id FROM users WHERE email = 'michael.johnson@jaxtina.com' LIMIT 1;

  -- CLASSES
  INSERT INTO classes (name, subject, grade_level, teacher_id, center_id, max_students, schedule, status) VALUES
    ('Grade 3 Mathematics', 'Mathematics', 'Grade 3', teacher1_id, downtown_id, 20, '[{"day":"Monday","startTime":"09:00","endTime":"10:30"},{"day":"Wednesday","startTime":"09:00","endTime":"10:30"}]', 'active'),
    ('Grade 4 Mathematics', 'Mathematics', 'Grade 4', teacher1_id, downtown_id, 20, '[{"day":"Tuesday","startTime":"09:00","endTime":"10:30"},{"day":"Thursday","startTime":"09:00","endTime":"10:30"}]', 'active'),
    ('Grade 5 Mathematics', 'Mathematics', 'Grade 5', teacher2_id, westside_id, 20, '[{"day":"Monday","startTime":"11:00","endTime":"12:30"},{"day":"Wednesday","startTime":"11:00","endTime":"12:30"}]', 'active'),
    ('Grade 3 English', 'English', 'Grade 3', teacher2_id, westside_id, 20, '[{"day":"Monday","startTime":"13:00","endTime":"14:30"},{"day":"Wednesday","startTime":"13:00","endTime":"14:30"}]', 'active'),
    ('Grade 4 English', 'English', 'Grade 4', teacher1_id, north_id, 20, '[{"day":"Tuesday","startTime":"09:00","endTime":"10:30"},{"day":"Thursday","startTime":"09:00","endTime":"10:30"}]', 'active'),
    ('Grade 3 Science', 'Science', 'Grade 3', teacher2_id, north_id, 20, '[{"day":"Wednesday","startTime":"11:00","endTime":"12:30"},{"day":"Friday","startTime":"11:00","endTime":"12:30"}]', 'active')
  ON CONFLICT DO NOTHING;
END $$;

-- STUDENTS
INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'j.thompson@email.com', 'Alex Thompson', 'Jennifer Thompson', 'j.thompson@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'm.rodriguez@email.com', 'Emma Rodriguez', 'Maria Rodriguez', 'm.rodriguez@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'd.kim@email.com', 'James Kim', 'David Kim', 'd.kim@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'a.patel@email.com', 'Sophia Patel', 'Anita Patel', 'a.patel@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'c.martinez@email.com', 'Lucas Martinez', 'Carlos Martinez', 'c.martinez@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status) VALUES
  (gen_random_uuid(), 'l.brown@email.com', 'Olivia Brown', 'Lisa Brown', 'l.brown@email.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- ENROLLMENTS
DO $$
DECLARE
  s1_id UUID;
  s2_id UUID;
  s3_id UUID;
  c1_id UUID;
  c2_id UUID;
BEGIN
  SELECT id INTO s1_id FROM students WHERE email = 'j.thompson@email.com' LIMIT 1;
  SELECT id INTO s2_id FROM students WHERE email = 'm.rodriguez@email.com' LIMIT 1;
  SELECT id INTO s3_id FROM students WHERE email = 'd.kim@email.com' LIMIT 1;
  SELECT id INTO c1_id FROM classes WHERE name = 'Grade 3 Mathematics' LIMIT 1;
  SELECT id INTO c2_id FROM classes WHERE name = 'Grade 4 Mathematics' LIMIT 1;

  INSERT INTO student_classes (student_id, class_id, status) VALUES (s1_id, c1_id, 'active') ON CONFLICT DO NOTHING;
  INSERT INTO student_classes (student_id, class_id, status) VALUES (s1_id, c2_id, 'active') ON CONFLICT DO NOTHING;
  INSERT INTO student_classes (student_id, class_id, status) VALUES (s2_id, c1_id, 'active') ON CONFLICT DO NOTHING;
  INSERT INTO student_classes (student_id, class_id, status) VALUES (s3_id, c2_id, 'active') ON CONFLICT DO NOTHING;
END $$;

-- HOMEWORK
DO $$
DECLARE
  c_id UUID;
BEGIN
  SELECT id INTO c_id FROM classes WHERE name = 'Grade 3 Mathematics' LIMIT 1;
  
  INSERT INTO homework (class_id, title, description, due_date, total_points, status) VALUES
    (c_id, 'Chapter 1 Exercises', 'Complete exercises from chapter 1', NOW() + INTERVAL '7 days', 100, 'active')
  ON CONFLICT DO NOTHING;
  
  INSERT INTO homework (class_id, title, description, due_date, total_points, status) VALUES
    (c_id, 'Chapter 2 Practice', 'Practice problems from chapter 2', NOW() + INTERVAL '14 days', 100, 'active')
  ON CONFLICT DO NOTHING;
END $$;

-- Check results
SELECT 'Centers:' as info, COUNT(*) as count FROM centers
UNION ALL SELECT 'Users:', COUNT(*) FROM users
UNION ALL SELECT 'Students:', COUNT(*) FROM students
UNION ALL SELECT 'Classes:', COUNT(*) FROM classes
UNION ALL SELECT 'Enrollments:', COUNT(*) FROM student_classes
UNION ALL SELECT 'Homework:', COUNT(*) FROM homework;
