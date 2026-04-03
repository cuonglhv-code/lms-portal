import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

interface ExamScoreData {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | null;
  percentage: number | null;
  grade: string | null;
  comments: string | null;
  graded_at: string | null;
  exam: {
    id: string;
    title: string;
    exam_date: string;
    exam_type: string;
    class_id: string;
    class?: { name: string };
  };
}

export function useStudentExams(studentId: string | null) {
  const [exams, setExams] = useState<ExamScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setExams([]);
      setLoading(false);
      return;
    }

    const fetchExams = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('exam_scores')
          .select(`
            *,
            exam:exams!exam_scores_exam_id_fkey (
              id,
              title,
              exam_date,
              exam_type,
              class_id,
              class:classes!exams_class_id_fkey (name)
            )
          `)
          .eq('student_id', studentId)
          .order('graded_at', { ascending: false });

        if (fetchError) throw fetchError;
        setExams(data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [studentId]);

  return { exams, loading, error };
}
