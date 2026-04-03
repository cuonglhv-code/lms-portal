import { supabaseAdmin } from '../supabase';

export interface ClassData {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  teacher_id?: string;
  center_id?: string;
  schedule: ClassSchedule[];
  max_students: number;
  status: 'active' | 'archived' | 'draft';
  created_at: string;
  updated_at: string;
  teacher?: { id: string; display_name: string; email: string };
  center?: { id: string; name: string };
  student_count?: number;
}

export interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface CreateClassParams {
  name: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  teacher_id?: string;
  center_id?: string;
  schedule: ClassSchedule[];
  max_students?: number;
}

export interface UpdateClassParams {
  name?: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  teacher_id?: string;
  center_id?: string;
  schedule?: ClassSchedule[];
  max_students?: number;
  status?: 'active' | 'archived' | 'draft';
}

export const classService = {
  async listClasses(options: {
    centerId?: string;
    teacherId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const { centerId, teacherId, status, search, page = 1, pageSize = 20 } = options;

    let query = supabaseAdmin
      .from('classes')
      .select(`
        *,
        teacher:users!classes_teacher_id_fkey (id, display_name, email),
        center:centers!classes_center_id_fkey (id, name)
      `, { count: 'exact' });

    if (centerId) query = query.eq('center_id', centerId);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const classesWithCount = await Promise.all(
      (data || []).map(async (c) => {
        const { count: studentCount } = await supabaseAdmin
          .from('student_classes')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', c.id)
          .eq('status', 'active');
        return { ...c, student_count: studentCount || 0 };
      })
    );

    return {
      classes: classesWithCount as ClassData[],
      total: count || 0,
      page,
      pageSize,
    };
  },

  async getClass(id: string): Promise<ClassData | null> {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select(`
        *,
        teacher:users!classes_teacher_id_fkey (id, display_name, email),
        center:centers!classes_center_id_fkey (id, name)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as ClassData;
  },

  async createClass(params: CreateClassParams): Promise<ClassData> {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        name: params.name,
        description: params.description,
        subject: params.subject,
        grade_level: params.grade_level,
        teacher_id: params.teacher_id,
        center_id: params.center_id,
        schedule: params.schedule,
        max_students: params.max_students || 30,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as ClassData;
  },

  async updateClass(id: string, params: UpdateClassParams): Promise<void> {
    const { error } = await supabaseAdmin
      .from('classes')
      .update(params)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteClass(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('classes').delete().eq('id', id);
    if (error) throw error;
  },

  async getClassStudents(classId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('student_classes')
      .select(`
        *,
        student:students!student_classes_student_id_fkey (*)
      `)
      .eq('class_id', classId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  },

  async enrollStudent(classId: string, studentId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('student_classes')
      .insert({
        class_id: classId,
        student_id: studentId,
        status: 'active',
      });

    if (error) throw error;
  },

  async unenrollStudent(enrollmentId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('student_classes')
      .update({ status: 'dropped', dropped_at: new Date().toISOString() })
      .eq('id', enrollmentId);

    if (error) throw error;
  },
};
