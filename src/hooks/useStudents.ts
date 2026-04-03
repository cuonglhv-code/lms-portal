import { useSubscribe } from './useSubscribe';
import { Student } from '../types/models';

export function useStudents() {
  return useSubscribe<Student>({ table: 'students', orderBy: { column: 'display_name', ascending: true } });
}
