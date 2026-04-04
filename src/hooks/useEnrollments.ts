import { useSubscribe } from './useSubscribe';
import { Enrollment } from '../types/models';

export function useEnrollments() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<Enrollment>({
    table: 'student_classes',
    orderBy: { column: 'enrolled_at', ascending: false }
  });

  // Transform DB data to match frontend Enrollment model
  const transformedData = data?.map(enrollment => ({
    id: enrollment.id,
    studentId: enrollment.student_id,
    classId: enrollment.class_id,
    enrolledAt: enrollment.enrolled_at,
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}