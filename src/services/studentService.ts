import { supabase } from '../supabase';

export const studentService = {
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
