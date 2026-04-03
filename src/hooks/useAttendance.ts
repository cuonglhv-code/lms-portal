import { useSubscribe } from './useSubscribe';
import { Attendance } from '../types/models';

export function useAttendance() {
  return useSubscribe<Attendance>({ table: 'attendance' });
}
