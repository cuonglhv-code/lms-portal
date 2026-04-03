import { useSubscribe } from './useSubscribe';
import { Enrollment } from '../types/models';

export function useEnrollments() {
  return useSubscribe<Enrollment>({ table: 'student_classes', orderBy: { column: 'enrolled_at', ascending: false } });
}
