import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';

export interface StudentAnnouncement {
  id: string;
  title: string | null;
  content: string;
  messageType: string;
  classId: string | null;
  createdAt: string;
  senderName?: string;
  className?: string;
}

export interface StudentMessage {
  id: string;
  senderId: string | null;
  senderType: string;
  recipientId: string;
  content: string;
  messageType: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  replyTo?: string;
  senderName?: string;
}

export function useStudentAnnouncements(studentId: string | null, classIds: string[] = []) {
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let query = supabase
          .from('messages')
          .select('*')
          .eq('message_type', 'announcement');

        if (studentId) {
          query = query.or(`recipient_type.eq.all,and(recipient_type.eq.student,recipient_id.eq.${studentId})`);
        } else {
          query = query.eq('recipient_type', 'all');
        }

        if (classIds.length > 0) {
          query = query.or(`class_id.in.(${classIds.join(',')}),recipient_type.eq.all`);
        }

        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;
        
        setAnnouncements((data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          messageType: a.message_type,
          classId: a.class_id,
          createdAt: a.created_at,
          senderName: a.sender_name,
          className: a.class_name,
        })));
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [studentId, classIds.join(',')]);

  return { announcements, loading, error };
}

export function useStudentMessages(studentId: string | null) {
  const [messages, setMessages] = useState<StudentMessage[]>([]);
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
          setMessages((data || []).map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            senderType: m.sender_type,
            recipientId: m.recipient_id,
            content: m.content,
            messageType: m.message_type,
            isRead: m.is_read,
            readAt: m.read_at,
            createdAt: m.created_at,
            replyTo: m.reply_to,
            senderName: m.sender_name,
          })));
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
