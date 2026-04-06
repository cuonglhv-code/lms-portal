import { supabase } from '../supabase';
import { UserRecord, UserRole } from '../types/auth';

export const studentService = {
  async listStudents(options: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ students: UserRecord[]; total: number; hasMore: boolean }> {
    const { search, status, page = 1, pageSize = 20 } = options;

    try {
      let query = supabase
        .from('students')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const students: UserRecord[] = (data || []).map((s) => ({
        id: s.id,
        authUid: s.auth_id,
        email: s.email,
        displayName: s.display_name,
        role: UserRole.Student,
        status: s.status as 'active' | 'suspended' | 'invited' | 'archived',
        createdAt: new Date(s.created_at).getTime(),
        updatedAt: s.updated_at ? new Date(s.updated_at).getTime() : undefined,
        isActive: s.status === 'active',
      }));

      return {
        students,
        total: count || 0,
        hasMore: (count || 0) > page * pageSize,
      };
    } catch (error) {
      console.error('[StudentService] List students error:', error);
      return { students: [], total: 0, hasMore: false };
    }
  },

  async sendMessage(
    recipientId: string,
    content: string,
    authorId: string,
    authorType: 'user' | 'student' = 'user',
    replyTo?: string
  ) {
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: authorId,
        sender_type: authorType,
        recipient_id: recipientId,
        recipient_type: 'student',
        content,
        message_type: 'direct',
        reply_to: replyTo || null,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  },

  async sendAnnouncement(
    classId: string,
    title: string,
    content: string,
    attachments: Array<{ name: string; url: string; type?: string }> = []
  ) {
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: null,
        sender_type: 'system',
        recipient_id: classId,
        recipient_type: 'class',
        title,
        content,
        message_type: 'announcement',
        class_id: classId,
        attachments,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending announcement:', err);
      throw err;
    }
  },

  async markMessageAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking message as read:', err);
      throw err;
    }
  },

  async submitHomework(
    homeworkId: string,
    studentId: string,
    content: string,
    attachments: Array<{ name: string; url: string; type?: string }> = []
  ) {
    try {
      const { error } = await supabase.from('homework_submissions').upsert({
        homework_id: homeworkId,
        student_id: studentId,
        content,
        attachments,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      }, {
        onConflict: 'homework_id,student_id',
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error submitting homework:', err);
      throw err;
    }
  },

  async getHomeworkSubmission(homeworkId: string, studentId: string) {
    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('homework_id', homeworkId)
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Error getting homework submission:', err);
      return null;
    }
  },
};
