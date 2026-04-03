import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

interface AttendanceData {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  class?: { name: string };
}

export function useStudentAttendance(studentId: string | null) {
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    let channel: any = null;

    const setupRealtime = () => {
      channel = supabase
        .channel('attendance-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'attendance',
            filter: `student_id=eq.${studentId}`,
          },
          () => {
            fetchAttendance();
          }
        )
        .subscribe();
    };

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
        setAttendance(data || []);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
    rate: 0,
  };

  if (attendance.length > 0) {
    stats.present = attendance.filter((a) => a.status === 'present').length;
    stats.absent = attendance.filter((a) => a.status === 'absent').length;
    stats.late = attendance.filter((a) => a.status === 'late').length;
    stats.rate = Math.round(((stats.present + stats.late) / attendance.length) * 100);
  }

  return stats;
}
