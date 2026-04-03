-- =============================================
-- Enable Realtime for Tables
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE classes;
ALTER PUBLICATION supabase_realtime ADD TABLE centers;
ALTER PUBLICATION supabase_realtime ADD TABLE student_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE homework;
ALTER PUBLICATION supabase_realtime ADD TABLE homework_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE exams;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- =============================================
-- Optional: Create trigger function for real-time sync
-- =============================================

-- Function to handle real-time events (optional logging)
CREATE OR REPLACE FUNCTION handle_realtime_event()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for logging or side effects
  -- For now, it's a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
