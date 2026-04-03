import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useStudentEnrollments } from './useStudentData';

interface ClassData {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  schedule: Array<{ day: string; startTime: string; endTime: string; room?: string }>;
  teacher_id: string;
  teacher?: { display_name: string; email: string };
  max_students: number;
  status: string;
  created_at: string;
}

export function useStudentClasses(studentId: string | null) {
  const { enrollments, loading: enrollmentsLoading } = useStudentEnrollments(studentId);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (enrollmentsLoading || enrollments.length === 0) {
      if (enrollmentsLoading) return;
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
            )
          `)
          .in('id', classIds)
          .eq('status', 'active');

        if (fetchError) throw fetchError;
        setClasses(data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [enrollments, enrollmentsLoading]);

  return { classes, loading: loading || enrollmentsLoading, error };
}

export function useClassById(classId: string | null) {
  const [classObj, setClassObj] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!classId) {
      setClassObj(null);
      setLoading(false);
      return;
    }

    const fetchClass = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select(`
            *,
            teacher:users!classes_teacher_id_fkey (
              display_name,
              email
            )
          `)
          .eq('id', classId)
          .single();

        if (fetchError) throw fetchError;
        setClassObj(data);
      } catch (err) {
        console.error('Error fetching class:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId]);

  return { classObj, loading, error };
}
