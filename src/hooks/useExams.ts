import { useSubscribe } from './useSubscribe';
import { ExamScore } from '../types/models';

export function useExams() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<ExamScore>({
    table: 'exam_scores',
    orderBy: { column: 'graded_at', ascending: false }
  });

  // Transform DB data to match frontend ExamScore model
  const transformedData = data?.map(exam => ({
    id: exam.id,
    studentId: exam.student_id,
    date: exam.graded_at || exam.created_at,
    writing: exam.score || 0,
    reading: exam.score || 0,
    speaking: exam.score || 0,
    listening: exam.score || 0,
    comment: exam.comments || '',
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}