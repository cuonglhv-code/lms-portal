import { useSubscribe } from './useSubscribe';
import { ExamScore } from '../types/models';

export function useExams() {
  return useSubscribe<ExamScore>({ table: 'exams' });
}
