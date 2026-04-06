import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

interface StudentData {
  id: string;
  auth_id: string | null;
  email: string;
  display_name: string;
  phone?: string;
  parent_name?: string;
  parent_email?: string;
  entry_level?: string;
  target_outcome?: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

export interface TransformedStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  entryLevel?: string;
  targetOutcome?: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
}

export function useStudentData(userEmail: string | null) {
  const [student, setStudent] = useState<TransformedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setStudent(null);
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('email', userEmail.toLowerCase())
          .single();

        if (fetchError) throw fetchError;
        
        const raw = data as StudentData;
        setStudent({
          id: raw.id,
          name: raw.display_name,
          email: raw.email,
          phone: raw.phone,
          parentName: raw.parent_name,
          parentEmail: raw.parent_email,
          entryLevel: raw.entry_level,
          targetOutcome: raw.target_outcome,
          avatarUrl: raw.avatar_url,
          status: raw.status,
          createdAt: raw.created_at,
        });
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [userEmail]);

  return { student, loading, error };
}

export interface TransformedEnrollment {
  id: string;
  studentId: string;
  classId: string;
  enrolledAt: string;
  droppedAt?: string;
  status: string;
}

export function useStudentEnrollments(studentId: string | null) {
  const [enrollments, setEnrollments] = useState<TransformedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const fetchEnrollments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('student_classes')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'active');

        if (fetchError) throw fetchError;
        
        setEnrollments((data || []).map((e: any) => ({
          id: e.id,
          studentId: e.student_id,
          classId: e.class_id,
          enrolledAt: e.enrolled_at,
          droppedAt: e.dropped_at,
          status: e.status,
        })));
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [studentId]);

  return { enrollments, loading, error };
}
