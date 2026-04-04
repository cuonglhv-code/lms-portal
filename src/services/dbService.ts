import { supabase, supabaseAdmin } from '../supabase';
import { UserRole } from '../types/auth';
import { Student, Class, Enrollment, Attendance, Homework, ExamScore, Announcement, Message } from '../types/models';

export const dbService = {
  // Student Actions
  async addStudent(data: Omit<Student, 'id' | 'createdAt'>, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('students').insert({
      email: data.email?.toLowerCase(),
      display_name: data.name,
      phone: data.phone,
      parent_name: data.parentName,
      entry_level: data.entryLevel,
      target_outcome: data.targetOutcome,
    });

    if (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  async updateStudent(id: string, data: Partial<Student>, userId: string, role: UserRole) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.display_name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone) updateData.phone = data.phone;
    if (data.parentName) updateData.parent_name = data.parentName;
    if (data.entryLevel) updateData.entry_level = data.entryLevel;
    if (data.targetOutcome) updateData.target_outcome = data.targetOutcome;

    const { error } = await supabaseAdmin
      .from('students')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async deleteStudent(id: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('students').delete().eq('id', id);
    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Class Actions
  async addClass(data: Omit<Class, 'id'>, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('classes').insert({
      name: data.name,
      center: data.center,
      teacher: data.teacher,
      total_sessions: data.totalSessions,
      sessions_per_week: data.sessionsPerWeek,
      start_date: data.startDate,
      class_days: data.classDays || [],
      start_time: data.startTime,
      end_time: data.endTime,
      lesson_plan: data.lessonPlan || [],
      notes: data.notes,
      target_outcome: data.targetOutcome,
      starting_level: data.startingLevel,
    });

    if (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  },

  async updateClass(id: string, data: Partial<Class>, userId: string, role: UserRole) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.center) updateData.center = data.center;
    if (data.teacher) updateData.teacher = data.teacher;
    if (data.totalSessions) updateData.total_sessions = data.totalSessions;
    if (data.sessionsPerWeek) updateData.sessions_per_week = data.sessionsPerWeek;
    if (data.startDate) updateData.start_date = data.startDate;
    if (data.classDays) updateData.class_days = data.classDays;
    if (data.startTime) updateData.start_time = data.startTime;
    if (data.endTime) updateData.end_time = data.endTime;
    if (data.lessonPlan) updateData.lesson_plan = data.lessonPlan;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.targetOutcome) updateData.target_outcome = data.targetOutcome;
    if (data.startingLevel) updateData.starting_level = data.startingLevel;

    const { error } = await supabaseAdmin
      .from('classes')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  async deleteClass(id: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('classes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Enrollment Actions
  async enrollStudent(studentId: string, classId: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('student_classes').insert({
      student_id: studentId,
      class_id: classId,
      status: 'active',
    });

    if (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  },

  async unenrollStudent(enrollmentId: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin
      .from('student_classes')
      .update({ status: 'dropped', dropped_at: new Date().toISOString() })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  },

  // Attendance Actions
  async updateAttendance(studentId: string, classId: string, date: string, status: Attendance['status'], userId: string, role: UserRole) {
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .eq('date', date)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('attendance')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating attendance:', error);
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin.from('attendance').insert({
        student_id: studentId,
        class_id: classId,
        date,
        status,
        recorded_by: userId,
      });

      if (error) {
        console.error('Error creating attendance:', error);
        throw error;
      }
    }
  },

  // Homework Actions
  async updateHomework(studentId: string, classId: string, date: string, status: Homework['status'], userId: string, role: UserRole, mark?: number, comments?: string) {
    const { data: existing } = await supabaseAdmin
      .from('homework')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .eq('date', date)
      .single();

    const data = { student_id: studentId, class_id: classId, date, status, mark, comments };

    if (existing) {
      const { error } = await supabaseAdmin
        .from('homework')
        .update(data)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating homework:', error);
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin.from('homework').insert(data);
      if (error) {
        console.error('Error creating homework:', error);
        throw error;
      }
    }
  },

  // Exam Actions
  async updateExamScore(studentId: string, date: string, field: string, value: any, userId: string, role: UserRole) {
    const { data: existing } = await supabaseAdmin
      .from('exams')
      .select('id')
      .eq('student_id', studentId)
      .eq('date', date)
      .single();

    const data = { student_id: studentId, date, [field]: value };

    if (existing) {
      const { error } = await supabaseAdmin
        .from('exams')
        .update(data)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating exam score:', error);
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin.from('exams').insert(data);
      if (error) {
        console.error('Error creating exam score:', error);
        throw error;
      }
    }
  },

  // Communication Actions
  async addAnnouncement(title: string, content: string, target: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('messages').insert({
      sender_id: userId,
      sender_type: 'user',
      recipient_id: target === 'all' ? 'all' : target,
      recipient_type: target === 'all' ? 'all' : 'student',
      title,
      content,
      message_type: 'announcement',
    });

    if (error) {
      console.error('Error adding announcement:', error);
      throw error;
    }
  },

  async deleteAnnouncement(id: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('messages').delete().eq('id', id);
    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  async addMessage(studentId: string, content: string, authorName: string, userId: string, role: UserRole, replyTo?: string) {
    const { error } = await supabaseAdmin.from('messages').insert({
      sender_id: userId,
      sender_type: 'user',
      recipient_id: studentId,
      recipient_type: 'student',
      content,
      reply_to: replyTo || null,
    });

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  async deleteMessage(id: string, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('messages').delete().eq('id', id);
    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async addLesson(data: { classId: string; sessionNumber: number; date: string; content: string; homework?: string; isExam?: boolean }, userId: string, role: UserRole) {
    const { error } = await supabaseAdmin.from('sessions').insert({
      class_id: data.classId,
      title: `Session ${data.sessionNumber}`,
      content: data.content,
      session_date: data.date,
      notes: data.homework || null,
      created_by: userId,
    });

    if (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  }
};
