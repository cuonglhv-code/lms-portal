import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';

interface Announcement {
  id: string;
  title: string | null;
  content: string;
  message_type: string;
  class_id: string | null;
  created_at: string;
  sender?: { display_name: string };
  class?: { name: string };
}

interface Message {
  id: string;
  sender_id: string | null;
  sender_type: string;
  recipient_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  reply_to?: string;
  sender?: { display_name: string };
}

export function useStudentAnnouncements(studentId: string | null, classIds: string[] = []) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const conditions = ['message_type.eq.announcement', '(recipient_type.eq.all'];

        if (studentId) {
          conditions.push(`,recipient_type.eq.student,recipient_id.eq.${studentId}`);
        }

        if (classIds.length > 0) {
          conditions.push(`,class_id.in.(${classIds.join(',')})`);
        }

        conditions.push(')');

        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .or(conditions.join(','))
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {};
  }, [studentId, classIds.join(',')]);

  return { announcements, loading, error };
}

export function useStudentMessages(studentId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', studentId)
          .eq('recipient_type', 'student')
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) throw fetchError;
        if (isSubscribed) {
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        if (isSubscribed) {
          setError(err as Error);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isSubscribed = false;
    };
  }, [studentId]);

  return { messages, loading, error };
}
