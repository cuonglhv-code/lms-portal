import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export interface StudentHomework {
  id: string;
  homeworkId: string;
  classId: string;
  className: string;
  title: string;
  description?: string;
  dueDate?: string;
  totalPoints: number;
  status: string;
  submittedAt?: string;
  pointsEarned?: number;
  feedback?: string;
  gradedAt?: string;
}

export function useStudentHomework(studentId: string | null) {
  const [homework, setHomework] = useState<StudentHomework[]>([]);
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
            homework:homework_id (
              id,
              title,
              description,
              due_date,
              total_points,
              class_id,
              class:classes!homework_class_id_fkey (name)
            )
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        setHomework((data || []).map((h: any) => ({
          id: h.id,
          homeworkId: h.homework?.id,
          classId: h.homework?.class_id,
          className: h.homework?.class?.name || '',
          title: h.homework?.title || '',
          description: h.homework?.description,
          dueDate: h.homework?.due_date,
          totalPoints: h.homework?.total_points || 0,
          status: h.status,
          submittedAt: h.submitted_at,
          pointsEarned: h.points_earned,
          feedback: h.feedback,
          gradedAt: h.graded_at,
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
