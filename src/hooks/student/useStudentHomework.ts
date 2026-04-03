import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

interface HomeworkData {
  id: string;
  homework_id: string;
  class_id: string;
  title: string;
  description?: string;
  content?: string;
  due_date?: string;
  total_points: number;
  status: string;
  submitted_at?: string;
  points_earned?: number;
  feedback?: string;
  graded_at?: string;
  class_name?: string;
}

export function useStudentHomework(studentId: string | null) {
  const [homework, setHomework] = useState<HomeworkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setHomework([]);
      setLoading(false);
      return;
    }

    const fetchHomework = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('homework_submissions')
          .select(`
            *,
            homework:homework!homework_submissions_homework_id_fkey (
              id,
              title,
              description,
              due_date,
              class_id,
              class:classes!homework_class_id_fkey (name)
            )
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        setHomework((data || []).map((h) => ({
          ...h,
          homework_id: h.homework?.id,
          class_id: h.homework?.class_id,
          title: h.homework?.title,
          description: h.homework?.description,
          due_date: h.homework?.due_date,
          class_name: h.homework?.class?.name,
        })));
      } catch (err) {
        console.error('Error fetching homework:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [studentId]);

  return { homework, loading, error };
}

export function useHomeworkByClass(studentId: string | null, classId: string | null) {
  const [homework, setHomework] = useState<HomeworkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId || !classId) {
      setHomework([]);
      setLoading(false);
      return;
    }

    const fetchHomework = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('homework_submissions')
          .select(`
            *,
            homework:homework!homework_submissions_homework_id_fkey (
              id,
              title,
              description,
              due_date,
              class_id
            )
          `)
          .eq('student_id', studentId)
          .eq('homework.class_id', classId)
          .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        setHomework((data || []).map((h) => ({
          ...h,
          homework_id: h.homework?.id,
          class_id: h.homework?.class_id,
          title: h.homework?.title,
          description: h.homework?.description,
          due_date: h.homework?.due_date,
        })));
      } catch (err) {
        console.error('Error fetching class homework:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [studentId, classId]);

  return { homework, loading, error };
}
