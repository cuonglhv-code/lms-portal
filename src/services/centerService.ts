import { supabaseAdmin } from '../supabase';

export interface Center {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateCenterParams {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCenterParams {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export const centerService = {
  async listCenters(): Promise<Center[]> {
    const { data, error } = await supabaseAdmin
      .from('centers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getCenter(id: string): Promise<Center | null> {
    const { data, error } = await supabaseAdmin
      .from('centers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Center;
  },

  async createCenter(params: CreateCenterParams): Promise<Center> {
    const { data, error } = await supabaseAdmin
      .from('centers')
      .insert({
        name: params.name,
        address: params.address,
        phone: params.phone,
        email: params.email,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Center;
  },

  async updateCenter(id: string, params: UpdateCenterParams): Promise<void> {
    const { error } = await supabaseAdmin
      .from('centers')
      .update(params)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCenter(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('centers').delete().eq('id', id);
    if (error) throw error;
  },

  async getCenterStats(id: string) {
    const { count: classCount } = await supabaseAdmin
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('center_id', id);

    const { count: teacherCount } = await supabaseAdmin
      .from('classes')
      .select('teacher_id', { count: 'exact', head: true })
      .eq('center_id', id);

    const { count: studentCount } = await supabaseAdmin
      .from('student_classes')
      .select(`
        class:classes!student_classes_class_id_fkey (center_id)
      `, { count: 'exact', head: true })
      .eq('classes.center_id', id)
      .eq('status', 'active');

    return {
      classCount: classCount || 0,
      teacherCount: teacherCount || 0,
      studentCount: studentCount || 0,
    };
  },
};
