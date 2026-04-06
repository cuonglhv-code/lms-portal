import { useSubscribe } from './useSubscribe';
import { ExamScore } from '../types/models';

export function useExams() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<ExamScore>({
    table: 'exam_scores',
    orderBy: { column: 'graded_at', ascending: false }
  });

  const transformedData = data?.map(exam => ({
    id: exam.id,
    studentId: exam.student_id,
    examId: exam.exam_id,
    date: exam.graded_at || exam.created_at,
    writing: exam.writing ?? exam.score ?? 0,
    reading: exam.reading ?? exam.score ?? 0,
    speaking: exam.speaking ?? exam.score ?? 0,
    listening: exam.listening ?? exam.score ?? 0,
    comment: exam.comments || '',
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}