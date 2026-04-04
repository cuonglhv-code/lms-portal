import { useSubscribe } from './useSubscribe';
import { Student } from '../types/models';

export function useStudents() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<Student>({
    table: 'students',
    orderBy: { column: 'display_name', ascending: true }
  });

  // Transform DB data to match frontend Student model
  const transformedData = data?.map(student => ({
    id: student.id,
    name: student.display_name || '', // DB: display_name -> FE: name
    email: student.email || '',
    phone: student.phone || '',
    entryLevel: student.entry_level || '',
    targetOutcome: student.target_outcome || '',
    parentName: student.parent_name || '',
    createdAt: student.created_at,
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}