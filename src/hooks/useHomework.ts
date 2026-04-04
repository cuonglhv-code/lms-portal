import { useSubscribe } from './useSubscribe';
import { Homework } from '../types/models';

export function useHomework() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<Homework>({
    table: 'homework',
    orderBy: { column: 'due_date', ascending: false }
  });

  // Transform DB data to match frontend Homework model
  const transformedData = data?.map(hw => ({
    id: hw.id,
    studentId: hw.student_id,
    classId: hw.class_id,
    date: hw.due_date,
    status: hw.status,
    mark: hw.points_earned,
    comments: hw.feedback,
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}