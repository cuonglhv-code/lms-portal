import { supabaseAdmin } from '../supabase';

export interface Session {
  id: string;
  class_id: string;
  title: string;
  content?: string;
  session_date: string;
  duration_minutes: number;
  homework_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  homework?: {
    id: string;
    title: string;
    due_date: string;
  };
}

export interface CreateSessionParams {
  class_id: string;
  title: string;
  content?: string;
  session_date: string;
  duration_minutes?: number;
  notes?: string;
  created_by?: string;
}

export interface UpdateSessionParams {
  title?: string;
  content?: string;
  session_date?: string;
  duration_minutes?: number;
  homework_id?: string;
  notes?: string;
}

export const sessionService = {
  async listSessionsByClass(classId: string): Promise<Session[]> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        homework:homework!sessions_homework_id_fkey (id, title, due_date)
      `)
      .eq('class_id', classId)
      .order('session_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getSession(id: string): Promise<Session | null> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        homework:homework!sessions_homework_id_fkey (id, title, due_date)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Session;
  },

  async createSession(params: CreateSessionParams): Promise<Session> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        class_id: params.class_id,
        title: params.title,
        content: params.content,
        session_date: params.session_date,
        duration_minutes: params.duration_minutes || 60,
        notes: params.notes,
        created_by: params.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  },

  async updateSession(id: string, params: UpdateSessionParams): Promise<void> {
    const { error } = await supabaseAdmin
      .from('sessions')
      .update(params)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('sessions').delete().eq('id', id);
    if (error) throw error;
  },

  async createHomeworkForSession(
    sessionId: string,
    title: string,
    dueDate: string,
    description?: string
  ): Promise<any> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const { data, error } = await supabaseAdmin
      .from('homework')
      .insert({
        class_id: session.class_id,
        title,
        description,
        due_date: dueDate,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    await this.updateSession(sessionId, { homework_id: data.id });
    return data;
  },
};
