import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export function useStudentAttendance(studentId: string | null) {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('attendance')
          .select(`
            *,
            class:classes!attendance_class_id_fkey (name)
          `)
          .eq('student_id', studentId)
          .order('date', { ascending: false });

        if (fetchError) throw fetchError;
        
        setAttendance((data || []).map((a: any) => ({
          id: a.id,
          studentId: a.student_id,
          classId: a.class_id,
          className: a.class?.name || '',
          date: a.date,
          status: a.status,
          notes: a.notes,
        })));
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  return { attendance, loading, error };
}

export function useAttendanceStats(studentId: string | null) {
  const { attendance } = useStudentAttendance(studentId);

  const stats = {
    total: attendance.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    rate: 0,
  };

  if (attendance.length > 0) {
    stats.present = attendance.filter((a) => a.status === 'present').length;
    stats.absent = attendance.filter((a) => a.status === 'absent').length;
    stats.late = attendance.filter((a) => a.status === 'late').length;
    stats.excused = attendance.filter((a) => a.status === 'excused').length;
    stats.rate = Math.round(((stats.present + stats.late) / attendance.length) * 100);
  }

  return stats;
}
