import { useSubscribe } from './useSubscribe';
import { Attendance } from '../types/models';

export function useAttendance() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<Attendance>({
    table: 'attendance',
    orderBy: { column: 'date', ascending: false }
  });

  // Transform DB data to match frontend Attendance model
  const transformedData = data?.map(att => ({
    id: att.id,
    studentId: att.student_id,
    classId: att.class_id,
    date: att.date,
    status: att.status,
    notes: att.notes || '',
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}