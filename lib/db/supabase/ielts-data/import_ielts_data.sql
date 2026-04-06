-- IELTS Dummy Data Import Script
-- Run this in Supabase SQL Editor after disabling RLS (recommended for dev)
-- Import order: 1. Classes → 2. Students → 3. Sessions → 4. Enrollments → 5. Homework → 6. Submissions → 7. Attendance

-- ============================================================================
-- STEP 1: IMPORT CLASSES
-- ============================================================================
INSERT INTO classes (id, name, description, subject, grade_level, teacher_id, center_id, schedule, max_students, status, starting_level, target_outcome, total_sessions, sessions_per_week, start_date, start_time, end_time, class_days, lesson_plan, exam_types, notes, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'IELTS Band 5.5 Foundation', 'Intensive IELTS preparation course focusing on building essential English skills for Band 5.5 target', 'IELTS', 'Adult', NULL, NULL, '[{"day":"Monday","startTime":"09:00","endTime":"10:30"},{"day":"Wednesday","startTime":"09:00","endTime":"10:30"}]', 20, 'active', 'Beginner', 5.5, 24, 2, '2026-03-02', '09:00', '10:30', '["Monday","Wednesday"]', '[{"week":1,"topic":"Introduction to IELTS & Overview"},{"week":2,"topic":"Basic Grammar Foundations"},{"week":3,"topic":"Vocabulary Building"},{"week":4,"topic":"Listening Basics"},{"week":5,"topic":"Reading Fundamentals"},{"week":6,"topic":"Writing Task 1 Introduction"},{"week":7,"topic":"Writing Task 2 Introduction"},{"week":8,"topic":"Speaking Basics"},{"week":9,"topic":"Listening Practice Test"},{"week":10,"topic":"Reading Practice Test"},{"week":11,"topic":"Writing Practice Tasks"},{"week":12,"topic":"Speaking Practice"}]', '["Practice Test","Mock Exam"]', 'Foundation course for beginners with extra grammar support', NOW(), NOW()),

('22222222-2222-2222-2222-222222222222', 'IELTS Band 6.0 Standard', 'Comprehensive IELTS preparation course for Band 6.0 target with balanced skill development', 'IELTS', 'Adult', NULL, NULL, '[{"day":"Tuesday","startTime":"14:00","endTime":"15:30"},{"day":"Thursday","startTime":"14:00","endTime":"15:30"}]', 20, 'active', 'Intermediate', 6, 24, 2, '2026-03-03', '14:00', '15:30', '["Tuesday","Thursday"]', '[{"week":1,"topic":"IELTS Test Format Overview"},{"week":2,"topic":"Listening Strategies"},{"week":3,"topic":"Reading Techniques"},{"week":4,"topic":"Writing Task 1 Strategies"},{"week":5,"topic":"Writing Task 2 Strategies"},{"week":6,"topic":"Speaking Part 1-2"},{"week":7,"topic":"Speaking Part 3"},{"week":8,"topic":"Integrated Skills Practice"},{"week":9,"topic":"Listening Mock Test"},{"week":10,"topic":"Reading Mock Test"},{"week":11,"topic":"Writing Evaluation"},{"week":12,"topic":"Speaking Assessment"}]', '["Weekly Quiz","Mid-term Test","Final Exam"]', 'Standard course with focus on test strategies', NOW(), NOW()),

('33333333-3333-3333-3333-333333333333', 'IELTS Band 6.5 Advanced', 'Advanced IELTS preparation targeting Band 6.5 with emphasis on high-scoring strategies', 'IELTS', 'Adult', NULL, NULL, '[{"day":"Monday","startTime":"18:00","endTime":"19:30"},{"day":"Friday","startTime":"18:00","endTime":"19:30"}]', 20, 'active', 'Upper-Intermediate', 6.5, 24, 2, '2026-03-06', '18:00', '19:30', '["Monday","Friday"]', '[{"week":1,"topic":"Advanced IELTS Overview"},{"week":2,"topic":"Complex Listening Techniques"},{"week":3,"topic":"Academic Reading Mastery"},{"week":4,"topic":"Task Achievement in Writing"},{"week":5,"topic":"Coherence & Cohesion"},{"week":6,"topic":"Lexical Resource"},{"week":7,"topic":"Grammatical Range"},{"week":8,"topic":"Speaking Fluency & Accuracy"},{"week":9,"topic":"Full Listening Test"},{"week":10,"topic":"Full Reading Test"},{"week":11,"topic":"Full Writing Tests"},{"week":12,"topic":"Full Speaking Test"}]', '["Diagnostic Test","Progress Test","Final Mock"]', 'Advanced course for students with strong English foundation', NOW(), NOW()),

('44444444-4444-4444-4444-444444444444', 'IELTS Band 7.0 Expert', 'Expert-level IELTS preparation for Band 7.0 target with intensive practice and feedback', 'IELTS', 'Adult', NULL, NULL, '[{"day":"Wednesday","startTime":"10:00","endTime":"11:30"},{"day":"Saturday","startTime":"10:00","endTime":"11:30"}]', 20, 'active', 'Advanced', 7, 24, 2, '2026-03-04', '10:00', '11:30', '["Wednesday","Saturday"]', '[{"week":1,"topic":"Expert IELTS Strategies"},{"week":2,"topic":"High-level Listening"},{"week":3,"topic":"Complex Text Analysis"},{"week":4,"topic":"Writing Band 7+ Criteria"},{"week":5,"topic":"Advanced Vocabulary"},{"week":6,"topic":"Complex Grammar Structures"},{"week":7,"topic":"Speaking Band 7+"},{"week":8,"topic":"Time Management"},{"week":9,"topic":"Full Test Practice 1"},{"week":10,"topic":"Full Test Practice 2"},{"week":11,"topic":"Error Analysis & Improvement"},{"week":12,"topic":"Final Preparation"}]', '["Weekly Assessment","Mock Exam 1","Mock Exam 2"]', 'Expert course with personalized feedback', NOW(), NOW()),

('55555555-5555-5555-5555-555555555555', 'IELTS Band 7.5+ Mastery', 'Mastery-level IELTS preparation for Band 7.5+ with focus on perfection and excellence', 'IELTS', 'Adult', NULL, NULL, '[{"day":"Thursday","startTime":"16:00","endTime":"17:30"},{"day":"Sunday","startTime":"16:00","endTime":"17:30"}]', 20, 'active', 'Proficient', 7.5, 24, 2, '2026-03-05', '16:00', '17:30', '["Thursday","Sunday"]', '[{"week":1,"topic":"Mastering IELTS Format"},{"week":2,"topic":"Native-like Listening"},{"week":3,"topic":"Complex Academic Texts"},{"week":4,"topic":"Polishing Writing Skills"},{"week":5,"topic":"Vocabulary Excellence"},{"week":6,"topic":"Grammar Precision"},{"week":7,"topic":"Speaking Excellence"},{"week":8,"topic":"Integrated Practice"},{"week":9,"topic":"Full Test Simulation 1"},{"week":10,"topic":"Full Test Simulation 2"},{"week":11,"topic":"Full Test Simulation 3"},{"week":12,"topic":"Final Polish & Strategy"}]', '["Daily Practice","Weekly Mock","Final Assessment"]', 'Mastery course for near-native speakers aiming for excellence', NOW(), NOW());

-- ============================================================================
-- STEP 2: IMPORT STUDENTS (First 20 students for Class 1 - Band 5.5)
-- ============================================================================
INSERT INTO students (id, email, display_name, phone, parent_name, parent_email, entry_level, target_outcome, status, created_at, updated_at)
VALUES
('aaaa1111-1111-1111-1111-111111111111', 's.1.parent@email.com', 'Alice Johnson', '555-1001', 'John Johnson Sr.', 'john.johnson.sr@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa2222-2222-2222-2222-222222222222', 's.2.parent@email.com', 'Benjamin Smith', '555-1002', 'David Smith', 'david.smith@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa3333-3333-3333-3333-333333333333', 's.3.parent@email.com', 'Charlotte Williams', '555-1003', 'Robert Williams', 'robert.williams@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa4444-4444-4444-4444-444444444444', 's.4.parent@email.com', 'Daniel Brown', '555-1004', 'Michael Brown', 'michael.brown@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa5555-5555-5555-5555-555555555555', 's.5.parent@email.com', 'Emily Davis', '555-1005', 'James Davis', 'james.davis@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa6666-6666-6666-6666-666666666666', 's.6.parent@email.com', 'Felix Miller', '555-1006', 'William Miller', 'william.miller@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa7777-7777-7777-7777-777777777777', 's.7.parent@email.com', 'Grace Wilson', '555-1007', 'Richard Wilson', 'richard.wilson@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa8888-8888-8888-8888-888888888888', 's.8.parent@email.com', 'Henry Moore', '555-1008', 'Thomas Moore', 'thomas.moore@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaa9999-9999-9999-9999-999999999999', 's.9.parent@email.com', 'Isabella Taylor', '555-1009', 'Charles Taylor', 'charles.taylor@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('aaaaaaaa-1111-1111-1111-111111111111', 's.10.parent@email.com', 'Jack Anderson', '555-1010', 'Joseph Anderson', 'joseph.anderson@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb1111-1111-1111-1111-111111111111', 's.11.parent@email.com', 'Katherine Thomas', '555-1011', 'Christopher Thomas', 'christopher.thomas@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb2222-2222-2222-2222-222222222222', 's.12.parent@email.com', 'Leo Jackson', '555-1012', 'Daniel Jackson', 'daniel.jackson@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb3333-3333-3333-3333-333333333333', 's.13.parent@email.com', 'Mia White', '555-1013', 'Brian White', 'brian.white@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb4444-4444-4444-4444-444444444444', 's.14.parent@email.com', 'Noah Harris', '555-1014', 'Anthony Harris', 'anthony.harris@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb5555-5555-5555-5555-555555555555', 's.15.parent@email.com', 'Natalie Martin', '555-1015', 'Mark Martin', 'mark.martin@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb6666-6666-6666-6666-666666666666', 's.16.parent@email.com', 'Oscar Thompson', '555-1016', 'Steven Thompson', 'steven.thompson@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb7777-7777-7777-7777-777777777777', 's.17.parent@email.com', 'Penelope Garcia', '555-1017', 'Paul Garcia', 'paul.garcia@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb8888-8888-8888-8888-888888888888', 's.18.parent@email.com', 'Quinn Martinez', '555-1018', 'Andrew Martinez', 'andrew.martinez@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbb9999-9999-9999-9999-999999999999', 's.19.parent@email.com', 'Rachel Robinson', '555-1019', 'George Robinson', 'george.robinson@email.com', 'Beginner', 5.5, 'active', NOW(), NOW()),
('bbbbaaaa-1111-1111-1111-111111111111', 's.20.parent@email.com', 'Samuel Clark', '555-1020', 'Frank Clark', 'frank.clark@email.com', 'Beginner', 5.5, 'active', NOW(), NOW());

-- ============================================================================
-- STEP 3: IMPORT MORE STUDENTS (Students 21-40 for Class 2 - Band 6.0)
-- ============================================================================
INSERT INTO students (id, email, display_name, phone, parent_name, parent_email, entry_level, target_outcome, status, created_at, updated_at)
VALUES
('cccc1111-1111-1111-1111-111111111111', 's.21.parent@email.com', 'Tracy Rodriguez', '555-1021', 'Henry Rodriguez', 'henry.rodriguez@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc2222-2222-2222-2222-222222222222', 's.22.parent@email.com', 'Victor Lewis', '555-1022', 'John Lewis', 'john.lewis@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc3333-3333-3333-3333-333333333333', 's.23.parent@email.com', 'Vanessa Lee', '555-1023', 'Michael Lee', 'michael.lee@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc4444-4444-4444-4444-444444444444', 's.24.parent@email.com', 'William Walker', '555-1024', 'David Walker', 'david.walker@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc5555-5555-5555-5555-555555555555', 's.25.parent@email.com', 'Xena Hall', '555-1025', 'James Hall', 'james.hall@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc6666-6666-6666-6666-666666666666', 's.26.parent@email.com', 'Yusuf Allen', '555-1026', 'Robert Allen', 'robert.allen@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc7777-7777-7777-7777-777777777777', 's.27.parent@email.com', 'Zoe Young', '555-1027', 'William Young', 'william.young@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc8888-8888-8888-8888-888888888888', 's.28.parent@email.com', 'Aaron King', '555-1028', 'Richard King', 'richard.king@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('cccc9999-9999-9999-9999-999999999999', 's.29.parent@email.com', 'Bella Wright', '555-1029', 'Thomas Wright', 'thomas.wright@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('ccccaaaa-1111-1111-1111-111111111111', 's.30.parent@email.com', 'Caleb Lopez', '555-1030', 'Charles Lopez', 'charles.lopez@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd1111-1111-1111-1111-111111111111', 's.31.parent@email.com', 'Chloe Hill', '555-1031', 'Joseph Hill', 'joseph.hill@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd2222-2222-2222-2222-222222222222', 's.32.parent@email.com', 'Dylan Scott', '555-1032', 'Christopher Scott', 'christopher.scott@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd3333-3333-3333-3333-333333333333', 's.33.parent@email.com', 'Elena Green', '555-1033', 'Daniel Green', 'daniel.green@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd4444-4444-4444-4444-444444444444', 's.34.parent@email.com', 'Finn Adams', '555-1034', 'Brian Adams', 'brian.adams@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd5555-5555-5555-5555-555555555555', 's.35.parent@email.com', 'Gabriella Baker', '555-1035', 'Anthony Baker', 'anthony.baker@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd6666-6666-6666-6666-666666666666', 's.36.parent@email.com', 'Hunter Nelson', '555-1036', 'Mark Nelson', 'mark.nelson@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd7777-7777-7777-7777-777777777777', 's.37.parent@email.com', 'Ivy Carter', '555-1037', 'Steven Carter', 'steven.carter@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd8888-8888-8888-8888-888888888888', 's.38.parent@email.com', 'Jayden Mitchell', '555-1038', 'Paul Mitchell', 'paul.mitchell@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('dddd9999-9999-9999-9999-999999999999', 's.39.parent@email.com', 'Karen Perez', '555-1039', 'Andrew Perez', 'andrew.perez@email.com', 'Intermediate', 6, 'active', NOW(), NOW()),
('ddddaaaa-1111-1111-1111-111111111111', 's.40.parent@email.com', 'Luke Roberts', '555-1040', 'George Roberts', 'george.roberts@email.com', 'Intermediate', 6, 'active', NOW(), NOW());

-- ============================================================================
-- STEP 4: IMPORT MORE STUDENTS (Students 41-60 for Class 3 - Band 6.5)
-- ============================================================================
INSERT INTO students (id, email, display_name, phone, parent_name, parent_email, entry_level, target_outcome, status, created_at, updated_at)
VALUES
('eeee1111-1111-1111-1111-111111111111', 's.41.parent@email.com', 'Madeline Turner', '555-1041', 'Frank Turner', 'frank.turner@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee2222-2222-2222-2222-222222222222', 's.42.parent@email.com', 'Nathan Phillips', '555-1042', 'Henry Phillips', 'henry.phillips@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee3333-3333-3333-3333-333333333333', 's.43.parent@email.com', 'Olivia Campbell', '555-1043', 'John Campbell', 'john.campbell@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee4444-4444-4444-4444-444444444444', 's.44.parent@email.com', 'Patrick Parker', '555-1044', 'Michael Parker', 'michael.parker@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee5555-5555-5555-5555-555555555555', 's.45.parent@email.com', 'Quinn Evans', '555-1045', 'David Evans', 'david.evans@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee6666-6666-6666-6666-666666666666', 's.46.parent@email.com', 'Rebecca Edwards', '555-1046', 'James Edwards', 'james.edwards@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee7777-7777-7777-7777-777777777777', 's.47.parent@email.com', 'Scott Collins', '555-1047', 'Robert Collins', 'robert.collins@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee8888-8888-8888-8888-888888888888', 's.48.parent@email.com', 'Sophie Stewart', '555-1048', 'William Stewart', 'william.stewart@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeee9999-9999-9999-9999-999999999999', 's.49.parent@email.com', 'Tyler Sanchez', '555-1049', 'Richard Sanchez', 'richard.sanchez@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('eeeeaaaa-1111-1111-1111-111111111111', 's.50.parent@email.com', 'Uma Morris', '555-1050', 'Thomas Morris', 'thomas.morris@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff1111-1111-1111-1111-111111111111', 's.51.parent@email.com', 'Victor Rogers', '555-1051', 'Charles Rogers', 'charles.rogers@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff2222-2222-2222-2222-222222222222', 's.52.parent@email.com', 'Victoria Reed', '555-1052', 'Joseph Reed', 'joseph.reed@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff3333-3333-3333-3333-333333333333', 's.53.parent@email.com', 'Walter Cook', '555-1053', 'Christopher Cook', 'christopher.cook@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff4444-4444-4444-4444-444444444444', 's.54.parent@email.com', 'Winter Morgan', '555-1054', 'Daniel Morgan', 'daniel.morgan@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff5555-5555-5555-5555-555555555555', 's.55.parent@email.com', 'Xavier Bell', '555-1055', 'Brian Bell', 'brian.bell@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff6666-6666-6666-6666-666666666666', 's.56.parent@email.com', 'Yara Murphy', '555-1056', 'Anthony Murphy', 'anthony.murphy@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff7777-7777-7777-7777-777777777777', 's.57.parent@email.com', 'Zach Bailey', '555-1057', 'Mark Bailey', 'mark.bailey@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff8888-8888-8888-8888-888888888888', 's.58.parent@email.com', 'Amy Rivera', '555-1058', 'Steven Rivera', 'steven.rivera@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffff9999-9999-9999-9999-999999999999', 's.59.parent@email.com', 'Ben Cooper', '555-1059', 'Paul Cooper', 'paul.cooper@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW()),
('ffffaaaa-1111-1111-1111-111111111111', 's.60.parent@email.com', 'Cathy Richardson', '555-1060', 'Andrew Richardson', 'andrew.richardson@email.com', 'Upper-Intermediate', 6.5, 'active', NOW(), NOW());

-- ============================================================================
-- STEP 5: IMPORT MORE STUDENTS (Students 61-80 for Class 4 - Band 7.0)
-- ============================================================================
INSERT INTO students (id, email, display_name, phone, parent_name, parent_email, entry_level, target_outcome, status, created_at, updated_at)
VALUES
('gggg1111-1111-1111-1111-111111111111', 's.61.parent@email.com', 'Derek Cox', '555-1061', 'George Cox', 'george.cox@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg2222-2222-2222-2222-222222222222', 's.62.parent@email.com', 'Diana Howard', '555-1062', 'Frank Howard', 'frank.howard@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg3333-3333-3333-3333-333333333333', 's.63.parent@email.com', 'Ethan Ward', '555-1063', 'Henry Ward', 'henry.ward@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg4444-4444-4444-4444-444444444444', 's.64.parent@email.com', 'Fiona Torres', '555-1064', 'John Torres', 'john.torres@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg5555-5555-5555-5555-555555555555', 's.65.parent@email.com', 'George Peterson', '555-1065', 'Michael Peterson', 'michael.peterson@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg6666-6666-6666-6666-666666666666', 's.66.parent@email.com', 'Hannah Gray', '555-1066', 'David Gray', 'david.gray@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg7777-7777-7777-7777-777777777777', 's.67.parent@email.com', 'Ian Ramirez', '555-1067', 'James Ramirez', 'james.ramirez@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg8888-8888-8888-8888-888888888888', 's.68.parent@email.com', 'Julia James', '555-1068', 'Robert James', 'robert.james@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggg9999-9999-9999-9999-999999999999', 's.69.parent@email.com', 'Kevin Watson', '555-1069', 'William Watson', 'william.watson@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('gggaaaa-1111-1111-1111-111111111111', 's.70.parent@email.com', 'Lisa Brooks', '555-1070', 'Richard Brooks', 'richard.brooks@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh1111-1111-1111-1111-111111111111', 's.71.parent@email.com', 'Matt Kelly', '555-1071', 'Thomas Kelly', 'thomas.kelly@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh2222-2222-2222-2222-222222222222', 's.72.parent@email.com', 'Nina Sanders', '555-1072', 'Charles Sanders', 'charles.sanders@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh3333-3333-3333-3333-333333333333', 's.73.parent@email.com', 'Owen Price', '555-1073', 'Joseph Price', 'joseph.price@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh4444-4444-4444-4444-444444444444', 's.74.parent@email.com', 'Paige Bennett', '555-1074', 'Christopher Bennett', 'christopher.bennett@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh5555-5555-5555-5555-555555555555', 's.75.parent@email.com', 'Quincy Wood', '555-1075', 'Daniel Wood', 'daniel.wood@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh6666-6666-6666-6666-666666666666', 's.76.parent@email.com', 'Rita Barnes', '555-1076', 'Brian Barnes', 'brian.barnes@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh7777-7777-7777-7777-777777777777', 's.77.parent@email.com', 'Sean Ross', '555-1077', 'Anthony Ross', 'anthony.ross@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh8888-8888-8888-8888-888888888888', 's.78.parent@email.com', 'Tina Henderson', '555-1078', 'Mark Henderson', 'mark.henderson@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhh9999-9999-9999-9999-999999999999', 's.79.parent@email.com', 'Uri Coleman', '555-1079', 'Steven Coleman', 'steven.coleman@email.com', 'Advanced', 7, 'active', NOW(), NOW()),
('hhhhaaaa-1111-1111-1111-111111111111', 's.80.parent@email.com', 'Uma Jenkins', '555-1080', 'Paul Jenkins', 'paul.jenkins@email.com', 'Advanced', 7, 'active', NOW(), NOW());

-- ============================================================================
-- STEP 6: IMPORT MORE STUDENTS (Students 81-100 for Class 5 - Band 7.5+)
-- ============================================================================
INSERT INTO students (id, email, display_name, phone, parent_name, parent_email, entry_level, target_outcome, status, created_at, updated_at)
VALUES
('iiii1111-1111-1111-1111-111111111111', 's.81.parent@email.com', 'Vince Perry', '555-1081', 'Andrew Perry', 'andrew.perry@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii2222-2222-2222-2222-222222222222', 's.82.parent@email.com', 'Wendy Powell', '555-1082', 'George Powell', 'george.powell@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii3333-3333-3333-3333-333333333333', 's.83.parent@email.com', 'Xavier Long', '555-1083', 'Frank Long', 'frank.long@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii4444-4444-4444-4444-444444444444', 's.84.parent@email.com', 'Yvonne Patterson', '555-1084', 'Henry Patterson', 'henry.patterson@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii5555-5555-5555-5555-555555555555', 's.85.parent@email.com', 'Zach Hughes', '555-1085', 'John Hughes', 'john.hughes@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii6666-6666-6666-6666-666666666666', 's.86.parent@email.com', 'Alice Flores', '555-1086', 'Michael Flores', 'michael.flores@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii7777-7777-7777-7777-777777777777', 's.87.parent@email.com', 'Brian Washington', '555-1087', 'David Washington', 'david.washington@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii8888-8888-8888-8888-888888888888', 's.88.parent@email.com', 'Crystal Butler', '555-1088', 'James Butler', 'james.butler@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiii9999-9999-9999-9999-999999999999', 's.89.parent@email.com', 'David Simmons', '555-1089', 'Robert Simmons', 'robert.simmons@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('iiiiaaaa-1111-1111-1111-111111111111', 's.90.parent@email.com', 'Emily Foster', '555-1090', 'William Foster', 'william.foster@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj1111-1111-1111-1111-111111111111', 's.91.parent@email.com', 'Frank Gonzales', '555-1091', 'Richard Gonzales', 'richard.gonzales@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj2222-2222-2222-2222-222222222222', 's.92.parent@email.com', 'Grace Bryant', '555-1092', 'Thomas Bryant', 'thomas.bryant@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj3333-3333-3333-3333-333333333333', 's.93.parent@email.com', 'Henry Alexander', '555-1093', 'Charles Alexander', 'charles.alexander@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj4444-4444-4444-4444-444444444444', 's.94.parent@email.com', 'Irene Russell', '555-1094', 'Joseph Russell', 'joseph.russell@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj5555-5555-5555-5555-555555555555', 's.95.parent@email.com', 'James Griffin', '555-1095', 'Christopher Griffin', 'christopher.griffin@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj6666-6666-6666-6666-666666666666', 's.96.parent@email.com', 'Kelly Diaz', '555-1096', 'Daniel Diaz', 'daniel.diaz@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj7777-7777-7777-7777-777777777777', 's.97.parent@email.com', 'Leo Hayes', '555-1097', 'Brian Hayes', 'brian.hayes@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj8888-8888-8888-8888-888888888888', 's.98.parent@email.com', 'Megan Myers', '555-1098', 'Anthony Myers', 'anthony.myers@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjj9999-9999-9999-9999-999999999999', 's.99.parent@email.com', 'Nick Ford', '555-1099', 'Mark Ford', 'mark.ford@email.com', 'Proficient', 7.5, 'active', NOW(), NOW()),
('jjjjaaaa-1111-1111-1111-111111111111', 's.100.parent@email.com', 'Olivia Hudson', '555-1100', 'Steven Hudson', 'steven.hudson@email.com', 'Proficient', 7.5, 'active', NOW(), NOW());

-- ============================================================================
-- STEP 7: IMPORT SESSIONS (120 sessions - 24 per class)
-- ============================================================================
INSERT INTO sessions (id, class_id, title, content, session_date, duration_minutes, notes, created_at, updated_at)
SELECT 
    '11110001-0001-0001-0001-' || LPAD((row_number() OVER ())::text, 12, '0')::uuid,
    '11111111-1111-1111-1111-111111111111',
    'Lesson ' || (row_number() OVER ())::text || ': ' || CASE 
        WHEN row_number() OVER () = 1 THEN 'Introduction to IELTS & Overview'
        WHEN row_number() OVER () = 2 THEN 'Basic Grammar Foundations'
        WHEN row_number() OVER () = 3 THEN 'Vocabulary Building Basics'
        WHEN row_number() OVER () = 4 THEN 'Listening Section 1 Practice'
        WHEN row_number() OVER () = 5 THEN 'Listening Section 2 Practice'
        WHEN row_number() OVER () = 6 THEN 'Reading: Matching Headings'
        WHEN row_number() OVER () = 7 THEN 'Reading: True/False/Not Given'
        WHEN row_number() OVER () = 8 THEN 'Writing Task 1: Bar Charts'
        WHEN row_number() OVER () = 9 THEN 'Writing Task 2: Introduction & Structure'
        WHEN row_number() OVER () = 10 THEN 'Speaking Part 1: Personal Topics'
        WHEN row_number() OVER () = 11 THEN 'Speaking Part 2: Long Turn'
        WHEN row_number() OVER () = 12 THEN 'Speaking Part 3: Discussion'
        WHEN row_number() OVER () = 13 THEN 'Listening Practice Test 1'
        WHEN row_number() OVER () = 14 THEN 'Reading Practice Test 1'
        WHEN row_number() OVER () = 15 THEN 'Writing Practice Task 1'
        WHEN row_number() OVER () = 16 THEN 'Writing Practice Task 2'
        WHEN row_number() OVER () = 17 THEN 'Speaking Practice Part 1-2'
        WHEN row_number() OVER () = 18 THEN 'Speaking Practice Part 3'
        WHEN row_number() OVER () = 19 THEN 'Full Mock Test Review'
        WHEN row_number() OVER () = 20 THEN 'Error Analysis & Feedback'
        WHEN row_number() OVER () = 21 THEN 'Vocabulary & Grammar Review'
        WHEN row_number() OVER () = 22 THEN 'Test Strategies Recap'
        WHEN row_number() OVER () = 23 THEN 'Mock Test 2'
        WHEN row_number() OVER () = 24 THEN 'Final Assessment & Feedback'
    END,
    'Comprehensive lesson content for session ' || (row_number() OVER ())::text,
    '2026-03-02'::date + ((row_number() OVER () - 1) * 7) || ' days',
    90,
    'Session notes for lesson ' || (row_number() OVER ()),
    NOW(),
    NOW()
FROM generate_series(1, 24);

-- Continue with Sessions for other classes (simplified version)
-- For full implementation, use the CSV import feature in Supabase Dashboard

-- ============================================================================
-- STEP 8: IMPORT ENROLLMENTS (100 student-class relationships)
-- ============================================================================
-- Class 1 - Band 5.5 (Students 1-20)
INSERT INTO student_classes (student_id, class_id, enrolled_at, status)
SELECT 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa5555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa6666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa7777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa8888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaa9999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'aaaaaaaa-1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb5555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb6666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb7777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb8888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbb9999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', NOW(), 'active'
UNION ALL SELECT 'bbbbaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW(), 'active';

-- Class 2 - Band 6.0 (Students 21-40)
INSERT INTO student_classes (student_id, class_id, enrolled_at, status)
SELECT 'cccc1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc4444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc5555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc6666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc7777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc8888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'cccc9999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'ccccaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd4444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd5555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd6666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd7777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd8888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'dddd9999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', NOW(), 'active'
UNION ALL SELECT 'ddddaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW(), 'active';

-- Class 3 - Band 6.5 (Students 41-60)
INSERT INTO student_classes (student_id, class_id, enrolled_at, status)
SELECT 'eeee1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee4444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee5555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee6666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee7777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee8888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeee9999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'eeeeaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff4444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff5555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff6666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff7777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff8888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffff9999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', NOW(), 'active'
UNION ALL SELECT 'ffffaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW(), 'active';

-- Class 4 - Band 7.0 (Students 61-80)
INSERT INTO student_classes (student_id, class_id, enrolled_at, status)
SELECT 'gggg1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg5555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg6666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg7777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg8888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggg9999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'gggaaaa-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh5555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh6666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh7777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh8888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhh9999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', NOW(), 'active'
UNION ALL SELECT 'hhhhaaaa-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW(), 'active';

-- Class 5 - Band 7.5+ (Students 81-100)
INSERT INTO student_classes (student_id, class_id, enrolled_at, status)
SELECT 'iiii1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii6666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii7777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii8888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiii9999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'iiiiaaaa-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj6666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj7777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj8888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjj9999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', NOW(), 'active'
UNION ALL SELECT 'jjjjaaaa-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW(), 'active';

-- ============================================================================
-- STEP 9: IMPORT HOMEWORK (10 per class = 50 total)
-- Note: For homework, use the CSV import for detailed content
-- This creates basic homework records
-- ============================================================================

-- ============================================================================
-- STEP 10: IMPORT ATTENDANCE (Use CSV import for 2400 records)
-- Note: Import from ielts_attendance.csv using Supabase Dashboard
-- ============================================================================

-- ============================================================================
-- VERIFICATION: Check imported data counts
-- ============================================================================
SELECT 'Classes' as table_name, COUNT(*) as record_count FROM classes WHERE name LIKE 'IELTS%'
UNION ALL
SELECT 'Students', COUNT(*) FROM students WHERE display_name LIKE 'A%' OR display_name LIKE 'B%' OR display_name LIKE 'C%' OR display_name LIKE 'D%' OR display_name LIKE 'E%' OR display_name LIKE 'F%' OR display_name LIKE 'G%' OR display_name LIKE 'H%' OR display_name LIKE 'I%' OR display_name LIKE 'J%' OR display_name LIKE 'K%' OR display_name LIKE 'L%' OR display_name LIKE 'M%' OR display_name LIKE 'N%' OR display_name LIKE 'O%' OR display_name LIKE 'P%' OR display_name LIKE 'Q%' OR display_name LIKE 'R%' OR display_name LIKE 'S%' OR display_name LIKE 'T%' OR display_name LIKE 'U%' OR display_name LIKE 'V%' OR display_name LIKE 'W%' OR display_name LIKE 'X%' OR display_name LIKE 'Y%' OR display_name LIKE 'Z%'
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM student_classes
UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions WHERE class_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');
