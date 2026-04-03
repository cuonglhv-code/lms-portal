-- =============================================
-- Jaxtina Teacher Portal - Test Data Seed
-- Run this AFTER schema.sql in Supabase SQL Editor
-- =============================================

-- NOTE: Auth users must be created via Supabase Dashboard or CLI
-- These SQL inserts only populate the application tables

-- =============================================
-- CENTERS
-- =============================================
INSERT INTO centers (name, address, phone, email, status) VALUES
  ('Downtown Learning Center', '123 Main Street, Downtown', '555-0100', 'downtown@jaxtina.com', 'active'),
  ('Westside Academy', '456 West Avenue, Westside', '555-0200', 'westside@jaxtina.com', 'active'),
  ('North Hills Campus', '789 North Road, North Hills', '555-0300', 'north@jaxtina.com', 'active')
ON CONFLICT DO NOTHING;

-- =============================================
-- USERS (Teachers/Admins)
-- NOTE: Create auth users first, then link by auth_id
-- =============================================

-- Get center IDs
DO $$
DECLARE
  downtown_id UUID;
  westside_id UUID;
  north_id UUID;
BEGIN
  SELECT id INTO downtown_id FROM centers WHERE name = 'Downtown Learning Center';
  SELECT id INTO westside_id FROM centers WHERE name = 'Westside Academy';
  SELECT id INTO north_id FROM centers WHERE name = 'North Hills Campus';

  -- Insert users (manually set auth_id if you have them)
  INSERT INTO users (auth_id, email, display_name, role, status) VALUES
    (gen_random_uuid(), 'admin@jaxtina.com', 'Admin User', 'admin', 'active'),
    (gen_random_uuid(), 'sarah.chen@jaxtina.com', 'Sarah Chen', 'teacher', 'active'),
    (gen_random_uuid(), 'michael.johnson@jaxtina.com', 'Michael Johnson', 'teacher', 'active'),
    (gen_random_uuid(), 'emily.davis@jaxtina.com', 'Emily Davis', 'teacher', 'active'),
    (gen_random_uuid(), 'david.wilson@jaxtina.com', 'David Wilson', 'teacher', 'active')
  ON CONFLICT (email) DO NOTHING;

  -- =============================================
  -- CLASSES
  -- =============================================
  INSERT INTO classes (name, subject, grade_level, teacher_id, center_id, max_students, schedule, status)
  SELECT 
    c.name,
    c.subject,
    c.grade_level,
    u.id,
    CASE c.center_name
      WHEN 'Downtown Learning Center' THEN downtown_id
      WHEN 'Westside Academy' THEN westside_id
      ELSE north_id
    END,
    20,
    jsonb_build_array(
      jsonb_build_object('day', 'Monday', 'startTime', '09:00', 'endTime', '10:30'),
      jsonb_build_object('day', 'Wednesday', 'startTime', '09:00', 'endTime', '10:30')
    ),
    'active'
  FROM (VALUES
    ('Grade 3 Mathematics', 'Mathematics', 'Grade 3'),
    ('Grade 4 Mathematics', 'Mathematics', 'Grade 4'),
    ('Grade 5 Mathematics', 'Mathematics', 'Grade 5'),
    ('Grade 3 English', 'English', 'Grade 3'),
    ('Grade 4 English', 'English', 'Grade 4'),
    ('Grade 5 English', 'English', 'Grade 5'),
    ('Grade 3 Science', 'Science', 'Grade 3'),
    ('Grade 4 Science', 'Science', 'Grade 4'),
    ('Grade 5 Science', 'Science', 'Grade 5'),
    ('Grade 3 History', 'History', 'Grade 3'),
    ('Grade 4 History', 'History', 'Grade 4'),
    ('Grade 5 History', 'History', 'Grade 5')
  ) AS c(name, subject, grade_level)
  CROSS JOIN LATERAL (
    SELECT id FROM users WHERE role = 'teacher' LIMIT 1
  ) u
  CROSS JOIN LATERAL (
    SELECT id FROM centers LIMIT 1
  ) cent
  ON CONFLICT DO NOTHING;

END $$;

-- =============================================
-- STUDENTS
-- =============================================
DO $$
DECLARE
  student_ids UUID[];
BEGIN
  INSERT INTO students (auth_id, email, display_name, parent_name, parent_email, status)
  SELECT 
    gen_random_uuid(),
    s.parent_email,
    s.name,
    s.parent,
    s.parent_email,
    'active'
  FROM (VALUES
    ('Alex Thompson', 'Jennifer Thompson', 'j.thompson@email.com'),
    ('Emma Rodriguez', 'Maria Rodriguez', 'm.rodriguez@email.com'),
    ('James Kim', 'David Kim', 'd.kim@email.com'),
    ('Sophia Patel', 'Anita Patel', 'a.patel@email.com'),
    ('Lucas Martinez', 'Carlos Martinez', 'c.martinez@email.com'),
    ('Olivia Brown', 'Lisa Brown', 'l.brown@email.com'),
    ('Noah Garcia', 'Rosa Garcia', 'r.garcia@email.com'),
    ('Ava Lee', 'Kevin Lee', 'k.lee@email.com'),
    ('Ethan Wilson', 'Sarah Wilson', 's.wilson@email.com'),
    ('Isabella Nguyen', 'Hung Nguyen', 'h.nguyen@email.com'),
    ('Mason Taylor', 'Angela Taylor', 'a.taylor@email.com'),
    ('Mia Anderson', 'Mark Anderson', 'm.anderson@email.com'),
    ('Liam Thomas', 'Karen Thomas', 'k.thomas@email.com'),
    ('Charlotte Jackson', 'Robert Jackson', 'r.jackson@email.com'),
    ('Benjamin White', 'Patricia White', 'p.white@email.com'),
    ('Amelia Harris', 'James Harris', 'j.harris@email.com')
  ) AS s(name, parent, parent_email)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO student_ids;

  -- =============================================
  -- ENROLLMENTS
  -- =============================================
  INSERT INTO student_classes (student_id, class_id, status)
  SELECT 
    unnest(student_ids),
    c.id,
    'active'
  FROM classes c
  CROSS JOIN (SELECT unnest(student_ids) LIMIT 3) s
  ON CONFLICT DO NOTHING;

END $$;

-- =============================================
-- HOMEWORK
-- =============================================
DO $$
DECLARE
  hw_id UUID;
BEGIN
  FOR hw_id IN SELECT id FROM classes LIMIT 6 LOOP
    INSERT INTO homework (class_id, title, description, due_date, total_points, status) VALUES
      (hw_id, 'Chapter 1 Exercises', 'Complete all exercises from chapter 1. Show all work.', NOW() + INTERVAL '7 days', 100, 'active'),
      (hw_id, 'Chapter 2 Practice', 'Practice problems from chapter 2.', NOW() + INTERVAL '14 days', 100, 'active'),
      (hw_id, 'Chapter 3 Application', 'Real-world application problems.', NOW() + INTERVAL '21 days', 100, 'active')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =============================================
-- SESSIONS
-- =============================================
DO $$
DECLARE
  c_id UUID;
BEGIN
  FOR c_id IN SELECT id FROM classes LOOP
    INSERT INTO sessions (class_id, title, content, session_date, duration_minutes, notes) VALUES
      (c_id, 'Week 1: Introduction', 'Introduction to the course and key concepts.', NOW() - INTERVAL '21 days', 90, 'Covered all planned topics.'),
      (c_id, 'Week 2: Fundamentals', 'Core fundamentals and basic principles.', NOW() - INTERVAL '14 days', 90, 'Students engaged well.'),
      (c_id, 'Week 3: Practice', 'Hands-on practice session.', NOW() - INTERVAL '7 days', 90, 'Good participation.'),
      (c_id, 'Week 4: Review', 'Review and Q&A session.', NOW(), 90, 'Prepared for assessment.')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =============================================
-- ATTENDANCE
-- =============================================
DO $$
DECLARE
  s_id UUID;
  c_id UUID;
  d DATE;
BEGIN
  FOR s_id, c_id IN 
    SELECT sc.student_id, sc.class_id 
    FROM student_classes sc 
    CROSS JOIN generate_series(0, 19) AS i
  LOOP
    d := CURRENT_DATE - i;
    INSERT INTO attendance (student_id, class_id, date, status)
    VALUES (
      s_id, 
      c_id, 
      d, 
      CASE (RANDOM() * 5)::INT
        WHEN 0 THEN 'absent'
        WHEN 1 THEN 'late'
        ELSE 'present'
      END
    )
    ON CONFLICT (student_id, class_id, date) DO NOTHING;
  END LOOP;
END $$;

-- =============================================
-- ANNOUNCEMENTS
-- =============================================
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  
  INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, title, content, message_type) VALUES
    (admin_id, 'user', 'all', 'all', 'Welcome to Jaxtina Learning Portal!', 'Welcome to our education platform! We are excited to have you here. Please explore all the features and don''t hesitate to reach out if you have any questions.', 'announcement'),
    (admin_id, 'user', 'all', 'all', 'Important: Schedule Change Notice', 'Please note that there will be a schedule change next week due to the holiday. Classes will resume on Monday.', 'announcement'),
    (admin_id, 'user', 'all', 'all', 'New Learning Resources Available', 'We have added new learning resources to the portal. Check out the Materials section for supplementary materials.', 'announcement');
END $$;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Centers:' as info, COUNT(*) as count FROM centers
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Students:', COUNT(*) FROM students
UNION ALL
SELECT 'Classes:', COUNT(*) FROM classes
UNION ALL
SELECT 'Enrollments:', COUNT(*) FROM student_classes
UNION ALL
SELECT 'Homework:', COUNT(*) FROM homework
UNION ALL
SELECT 'Sessions:', COUNT(*) FROM sessions
UNION ALL
SELECT 'Attendance:', COUNT(*) FROM attendance
UNION ALL
SELECT 'Messages:', COUNT(*) FROM messages;
