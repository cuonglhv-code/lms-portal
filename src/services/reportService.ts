import { supabase } from '../supabase';

export interface ReportOptions {
  type: 'students' | 'classes' | 'attendance' | 'homework' | 'exams';
  format: 'csv' | 'json';
  filters?: {
    classId?: string;
    centerId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export const reportService = {
  async generateReport(options: ReportOptions) {
    const { type, format, filters } = options;

    switch (type) {
      case 'students':
        return this.generateStudentsReport(format, filters);
      case 'classes':
        return this.generateClassesReport(format, filters);
      case 'attendance':
        return this.generateAttendanceReport(format, filters);
      case 'homework':
        return this.generateHomeworkReport(format, filters);
      case 'exams':
        return this.generateExamsReport(format, filters);
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  },

  async generateStudentsReport(format: 'csv' | 'json', filters?: any) {
    let query = supabase
      .from('students')
      .select(`
        id,
        display_name,
        email,
        phone,
        parent_name,
        parent_email,
        status,
        created_at,
        student_classes:class_id (
          classes(name, center_id, centers(name))
        )
      `);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map(s => ({
      ID: s.id,
      'Student Name': s.display_name,
      Email: s.email,
      Phone: s.phone || '',
      'Parent Name': s.parent_name || '',
      'Parent Email': s.parent_email || '',
      Status: s.status,
      'Enrolled Classes': s.student_classes?.map((sc: any) => sc.classes?.name).join(', ') || '',
      'Created Date': new Date(s.created_at).toLocaleDateString(),
    }));

    return format === 'csv' ? this.convertToCSV(rows) : JSON.stringify(rows, null, 2);
  },

  async generateClassesReport(format: 'csv' | 'json', filters?: any) {
    let query = supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        subject,
        grade_level,
        status,
        max_students,
        schedule,
        teacher:users!classes_teacher_id_fkey (display_name, email),
        center:centers (name),
        student_classes (id)
      `);

    if (filters?.centerId) {
      query = query.eq('center_id', filters.centerId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map(c => ({
      ID: c.id,
      'Class Name': c.name,
      Subject: c.subject || '',
      'Grade Level': c.grade_level || '',
      'Teacher': (c.teacher as any)?.display_name || '',
      'Teacher Email': (c.teacher as any)?.email || '',
      Center: (c.center as any)?.name || '',
      Schedule: JSON.stringify(c.schedule || []),
      'Max Students': c.max_students,
      'Current Students': c.student_classes?.length || 0,
      Status: c.status,
    }));

    return format === 'csv' ? this.convertToCSV(rows) : JSON.stringify(rows, null, 2);
  },

  async generateAttendanceReport(format: 'csv' | 'json', filters?: any) {
    let query = supabase
      .from('attendance')
      .select(`
        id,
        date,
        status,
        notes,
        student:students!attendance_student_id_fkey (display_name, email),
        class:classes!attendance_class_id_fkey (name)
      `)
      .order('date', { ascending: false })
      .limit(1000);

    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map(a => ({
      ID: a.id,
      Date: a.date,
      Student: (a.student as any)?.display_name || '',
      StudentEmail: (a.student as any)?.email || '',
      Class: (a.class as any)?.name || '',
      Status: a.status,
      Notes: a.notes || '',
    }));

    return format === 'csv' ? this.convertToCSV(rows) : JSON.stringify(rows, null, 2);
  },

  async generateHomeworkReport(format: 'csv' | 'json', filters?: any) {
    let query = supabase
      .from('homework_submissions')
      .select(`
        *,
        student:students!homework_submissions_student_id_fkey (display_name, email),
        homework:homework!homework_submissions_homework_id_fkey (title, due_date, class_id),
        class:classes!homework_class_id_fkey (name)
      `)
      .order('submitted_at', { ascending: false })
      .limit(1000);

    if (filters?.classId) {
      query = query.eq('homework.class_id', filters.classId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map(h => ({
      ID: h.id,
      Student: (h.student as any)?.display_name || '',
      StudentEmail: (h.student as any)?.email || '',
      Class: (h.class as any)?.name || '',
      Homework: (h.homework as any)?.title || '',
      'Due Date': (h.homework as any)?.due_date ? new Date((h.homework as any).due_date).toLocaleDateString() : '',
      'Submitted At': h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : '',
      'Points Earned': h.points_earned ?? '',
      'Points Possible': h.homework?.total_points || 100,
      Status: h.status,
      Feedback: h.feedback || '',
    }));

    return format === 'csv' ? this.convertToCSV(rows) : JSON.stringify(rows, null, 2);
  },

  async generateExamsReport(format: 'csv' | 'json', filters?: any) {
    let query = supabase
      .from('exam_scores')
      .select(`
        *,
        student:students!exam_scores_student_id_fkey (display_name, email),
        exam:exams!exam_scores_exam_id_fkey (title, exam_date, exam_type, class_id),
        class:classes!exams_class_id_fkey (name)
      `)
      .order('graded_at', { ascending: false })
      .limit(1000);

    if (filters?.classId) {
      query = query.eq('exam.class_id', filters.classId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map(e => ({
      ID: e.id,
      Student: (e.student as any)?.display_name || '',
      StudentEmail: (e.student as any)?.email || '',
      Class: (e.class as any)?.name || '',
      Exam: (e.exam as any)?.title || '',
      'Exam Date': (e.exam as any)?.exam_date ? new Date((e.exam as any).exam_date).toLocaleDateString() : '',
      'Exam Type': (e.exam as any)?.exam_type || '',
      Score: e.score ?? '',
      Percentage: e.percentage ? `${e.percentage}%` : '',
      Grade: e.grade || '',
      Comments: e.comments || '',
    }));

    return format === 'csv' ? this.convertToCSV(rows) : JSON.stringify(rows, null, 2);
  },

  convertToCSV(data: Record<string, any>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ];

    return csvRows.join('\n');
  },

  downloadReport(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
