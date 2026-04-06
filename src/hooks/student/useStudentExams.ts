import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export interface StudentExamScore {
  id: string;
  examId: string;
  studentId: string;
  examTitle: string;
  examDate: string;
  examType: string;
  className: string;
  writing: number | null;
  reading: number | null;
  speaking: number | null;
  listening: number | null;
  score: number | null;
  percentage: number | null;
  grade: string | null;
  comments: string | null;
  gradedAt: string | null;
}

export function useStudentExams(studentId: string | null) {
  const [exams, setExams] = useState<StudentExamScore[]>([]);
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
        
        setExams((data || []).map((e: any) => ({
          id: e.id,
          examId: e.exam_id,
          studentId: e.student_id,
          examTitle: e.exam?.title || '',
          examDate: e.exam?.exam_date,
          examType: e.exam?.exam_type,
          className: e.exam?.class?.name || '',
          writing: e.writing ?? e.score,
          reading: e.reading ?? e.score,
          speaking: e.speaking ?? e.score,
          listening: e.listening ?? e.score,
          score: e.score,
          percentage: e.percentage,
          grade: e.grade,
          comments: e.comments,
          gradedAt: e.graded_at,
        })));
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
