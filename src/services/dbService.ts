import { supabase } from '../supabase';
import { UserRole } from '../types/auth';
import { Student, Class, Attendance, Homework } from '../types/models';

export const dbService = {
  async addStudent(data: Omit<Student, 'id' | 'createdAt'>, userId: string, role: UserRole) {
    const { error } = await supabase.from('students').insert({
      email: data.email?.toLowerCase(),
      display_name: data.name,
      phone: data.phone,
      parent_name: data.parentName,
      entry_level: data.entryLevel,
      target_outcome: data.targetOutcome,
    });
    if (error) throw error;
  },

  async updateStudent(id: string, data: Partial<Student>, userId: string, role: UserRole) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.display_name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone) updateData.phone = data.phone;
    if (data.parentName) updateData.parent_name = data.parentName;
    if (data.entryLevel) updateData.entry_level = data.entryLevel;
    if (data.targetOutcome) updateData.target_outcome = data.targetOutcome;
    const { error } = await supabase.from('students').update(updateData).eq('id', id);
    if (error) throw error;
  },

  async deleteStudent(id: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  async addClass(data: Omit<Class, 'id'>, userId: string, role: UserRole) {
    const insertData: Record<string, unknown> = {
      name: data.name,
      total_sessions: data.totalSessions,
      sessions_per_week: data.sessionsPerWeek,
      start_date: data.startDate,
      class_days: data.classDays || [],
      start_time: data.startTime,
      end_time: data.endTime,
      lesson_plan: data.lessonPlan || [],
      exam_types: data.examTypes || [],
      notes: data.notes,
      target_outcome: data.targetOutcome,
      starting_level: data.startingLevel,
    };
    
    if (data.center && data.center.length === 36) {
      insertData.center_id = data.center;
    }
    if (data.teacher && data.teacher.length === 36) {
      insertData.teacher_id = data.teacher;
    }
    
    const { error } = await supabase.from('classes').insert(insertData);
    if (error) throw error;
  },

  async updateClass(id: string, data: Partial<Class>, userId: string, role: UserRole) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.center && data.center.length === 36) updateData.center_id = data.center;
    if (data.teacher && data.teacher.length === 36) updateData.teacher_id = data.teacher;
    if (data.totalSessions !== undefined) updateData.total_sessions = data.totalSessions;
    if (data.sessionsPerWeek !== undefined) updateData.sessions_per_week = data.sessionsPerWeek;
    if (data.startDate) updateData.start_date = data.startDate;
    if (data.classDays) updateData.class_days = data.classDays;
    if (data.startTime) updateData.start_time = data.startTime;
    if (data.endTime) updateData.end_time = data.endTime;
    if (data.lessonPlan) updateData.lesson_plan = data.lessonPlan;
    if (data.examTypes) updateData.exam_types = data.examTypes;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.targetOutcome !== undefined) updateData.target_outcome = data.targetOutcome;
    if (data.startingLevel !== undefined) updateData.starting_level = data.startingLevel;
    const { error } = await supabase.from('classes').update(updateData).eq('id', id);
    if (error) throw error;
  },

  async deleteClass(id: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
  },

  async enrollStudent(studentId: string, classId: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('student_classes').insert({
      student_id: studentId,
      class_id: classId,
      status: 'active',
    });
    if (error) throw error;
  },

  async unenrollStudent(enrollmentId: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('student_classes')
      .update({ status: 'dropped', dropped_at: new Date().toISOString() })
      .eq('id', enrollmentId);
    if (error) throw error;
  },

  async updateAttendance(studentId: string, classId: string, date: string, status: Attendance['status'], userId: string, role: UserRole) {
    const { data: existing } = await supabase.from('attendance')
      .select('id').eq('student_id', studentId).eq('class_id', classId).eq('date', date).single();

    if (existing) {
      const { error } = await supabase.from('attendance')
        .update({ status, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('attendance').insert({
        student_id: studentId, class_id: classId, date, status, recorded_by: userId,
      });
      if (error) throw error;
    }
  },

  async updateHomework(studentId: string, classId: string, date: string, status: Homework['status'], userId: string, role: UserRole, mark?: number, comments?: string) {
    const homeworkDate = date.includes('T') ? date : `${date}T00:00:00`;
    const { data: existingHomework } = await supabase.from('homework')
      .select('id').eq('class_id', classId).eq('due_date', homeworkDate).single();

    if (!existingHomework) {
      const { data: newHomework, error: hwError } = await supabase.from('homework').insert({
        class_id: classId,
        title: `Homework ${date}`,
        due_date: homeworkDate,
        created_by: userId,
      }).select('id').single();
      
      if (hwError) throw hwError;
      if (!newHomework) throw new Error('Failed to create homework record');
      
      const { error: subError } = await supabase.from('homework_submissions').upsert({
        homework_id: newHomework.id,
        student_id: studentId,
        points_earned: mark,
        feedback: comments,
        status: status === 'yes' ? 'graded' : status === 'no' ? 'submitted' : status === 'late' ? 'submitted' : 'submitted',
        graded_by: mark !== undefined ? userId : null,
        graded_at: mark !== undefined ? new Date().toISOString() : null,
      }, { onConflict: 'homework_id,student_id' });
      
      if (subError) throw subError;
    } else {
      const { data: existingSubmission } = await supabase.from('homework_submissions')
        .select('id').eq('homework_id', existingHomework.id).eq('student_id', studentId).single();

      const submissionData = {
        homework_id: existingHomework.id,
        student_id: studentId,
        points_earned: mark,
        feedback: comments,
        status: status === 'yes' ? 'graded' : status === 'no' ? 'submitted' : status === 'late' ? 'submitted' : 'submitted',
        graded_by: mark !== undefined ? userId : null,
        graded_at: mark !== undefined ? new Date().toISOString() : null,
      };

      if (existingSubmission) {
        const { error } = await supabase.from('homework_submissions').update(submissionData).eq('id', existingSubmission.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('homework_submissions').insert(submissionData);
        if (error) throw error;
      }
    }
  },

  async updateExamScore(studentId: string, examId: string, field: string, value: number, userId: string, role: UserRole) {
    const skillFields = ['writing', 'reading', 'speaking', 'listening'];
    
    const { data: existing } = await supabase.from('exam_scores')
      .select('id').eq('student_id', studentId).eq('exam_id', examId).single();

    const updateData: Record<string, unknown> = {
      student_id: studentId,
      exam_id: examId,
      graded_by: userId,
      graded_at: new Date().toISOString(),
    };

    if (skillFields.includes(field)) {
      updateData[field] = value;
    } else if (field === 'comment') {
      updateData.comments = value;
    } else {
      updateData.score = value;
    }

    if (existing) {
      const { error } = await supabase.from('exam_scores').update(updateData).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('exam_scores').insert(updateData);
      if (error) throw error;
    }
  },

  async addAnnouncement(title: string, content: string, target: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      sender_type: 'user',
      recipient_id: target === 'all' ? 'all' : target,
      recipient_type: target === 'all' ? 'all' : 'student',
      title, content, message_type: 'announcement',
    });
    if (error) throw error;
  },

  async deleteAnnouncement(id: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  },

  async addMessage(studentId: string, content: string, authorName: string, userId: string, role: UserRole, replyTo?: string) {
    const { error } = await supabase.from('messages').insert({
      sender_id: userId, sender_type: 'user', recipient_id: studentId,
      recipient_type: 'student', content, reply_to: replyTo || null,
    });
    if (error) throw error;
  },

  async deleteMessage(id: string, userId: string, role: UserRole) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  },

  async addLesson(data: { classId: string; sessionNumber: number; date: string; content: string; homework?: string; isExam?: boolean }, userId: string, role: UserRole) {
    const { error } = await supabase.from('sessions').insert({
      class_id: data.classId,
      title: `Session ${data.sessionNumber}`,
      content: data.content,
      session_date: data.date,
      notes: data.homework || null,
      created_by: userId,
    });
    if (error) throw error;
  }
};
