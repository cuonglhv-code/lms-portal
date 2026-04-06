import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useStudentEnrollments } from './useStudentData';

export interface StudentClass {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  center?: string;
  teacher?: string;
  totalSessions?: number;
  startingLevel?: string;
  targetOutcome?: number;
  sessionsPerWeek?: number;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  classDays: string[];
  lessonPlan: Array<{ sessionNumber: number; date: string; contents: string; homework?: string; isExam?: boolean; deadline?: string }>;
  examTypes: string[];
  notes?: string;
  status: string;
  createdAt: string;
}

export function useStudentClasses(studentId: string | null) {
  const { enrollments, loading: enrollmentsLoading } = useStudentEnrollments(studentId);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (enrollmentsLoading) return;
    if (!enrollments || enrollments.length === 0) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const classIds = enrollments.map((e) => e.classId);

    const fetchClasses = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select(`
            *,
            teacher:users!classes_teacher_id_fkey (
              display_name,
              email
            ),
            center:centers!classes_center_id_fkey (
              name
            )
          `)
          .in('id', classIds)
          .eq('status', 'active');

        if (fetchError) throw fetchError;
        
        setClasses((data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          subject: c.subject,
          center: c.center?.name || '',
          teacher: c.teacher?.display_name || '',
          totalSessions: c.total_sessions,
          startingLevel: c.starting_level,
          targetOutcome: c.target_outcome,
          sessionsPerWeek: c.sessions_per_week,
          startDate: c.start_date,
          startTime: c.start_time,
          endTime: c.end_time,
          classDays: c.class_days || [],
          lessonPlan: c.lesson_plan || [],
          examTypes: c.exam_types || [],
          notes: c.notes,
          status: c.status,
          createdAt: c.created_at,
        })));
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [enrollments, enrollmentsLoading]);

  return { classes, loading, error };
}
