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
  avatar_url?: string;
  status: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: string;
}

export function useStudentData(userEmail: string | null) {
  const [student, setStudent] = useState<StudentData | null>(null);
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
        setStudent(data);
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

export function useStudentEnrollments(studentId: string | null) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
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
        setEnrollments(data || []);
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
