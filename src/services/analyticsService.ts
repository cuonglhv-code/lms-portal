import { supabaseAdmin } from '../supabase';

export interface StudentProgress {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  averageScore: number;
  totalExams: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendance: number;
  averageHomeworkCompletion: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number }[];
  attendanceByMonth: { month: string; rate: number }[];
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCenters: number;
  newStudentsThisMonth: number;
  newStudentsTrend: number;
  attendanceRate: number;
  homeworkCompletionRate: number;
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const [
      studentsResult,
      teachersResult,
      classesResult,
      centersResult,
      thisMonthResult,
      lastMonthResult,
      attendanceData,
      homeworkData,
    ] = await Promise.all([
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabaseAdmin.from('classes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('centers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth).lt('created_at', firstOfMonth),
      supabaseAdmin.from('attendance').select('status').eq('status', 'present'),
      supabaseAdmin.from('homework_submissions').select('status').eq('status', 'submitted'),
    ]);

    const totalStudents = studentsResult.count || 0;
    const totalTeachers = teachersResult.count || 0;
    const totalClasses = classesResult.count || 0;
    const totalCenters = centersResult.count || 0;
    const newThisMonth = thisMonthResult.count || 0;
    const newLastMonth = lastMonthResult.count || 0;

    const attendanceRate = attendanceData.data?.length || 0;
    const homeworkRate = homeworkData.data?.length || 0;

    const newStudentsTrend = newLastMonth 
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCenters,
      newStudentsThisMonth: newThisMonth,
      newStudentsTrend,
      attendanceRate,
      homeworkCompletionRate: homeworkRate,
    };
  },

  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    const { data: enrollments } = await supabaseAdmin
      .from('student_classes')
      .select('class_id, classes(name)')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (!enrollments) return [];

    const progressList: StudentProgress[] = [];

    for (const enrollment of enrollments) {
      const classId = enrollment.class_id;

      const [attendance, homework, exams] = await Promise.all([
        supabaseAdmin.from('attendance').select('status').eq('student_id', studentId).eq('class_id', classId),
        supabaseAdmin.from('homework_submissions').select('status').eq('student_id', studentId).eq('homework(class_id).class_id', classId),
        supabaseAdmin.from('exam_scores').select('score, percentage').eq('student_id', studentId).eq('exam_id', enrollment.class_id),
      ]);

      const totalAtt = attendance.data?.length || 0;
      const presentAtt = attendance.data?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      const totalHw = homework.data?.length || 0;
      const completedHw = homework.data?.filter(h => h.status === 'submitted' || h.status === 'graded').length || 0;
      const homeworkRate = totalHw > 0 ? Math.round((completedHw / totalHw) * 100) : 0;

      const scores = exams.data?.filter(e => e.percentage !== null).map(e => e.percentage) || [];
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + (b as number), 0) / scores.length)
        : 0;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (scores.length >= 3) {
        const recentAvg = scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + (b as number), 0) / (scores.length / 2);
        const olderAvg = scores.slice(Math.ceil(scores.length / 2)).reduce((a, b) => a + (b as number), 0) / (scores.length / 2);
        if (recentAvg > olderAvg + 5) trend = 'improving';
        else if (recentAvg < olderAvg - 5) trend = 'declining';
      }

      progressList.push({
        studentId,
        studentName: '',
        classId,
        className: (enrollment as any).classes?.name || 'Unknown',
        attendanceRate,
        homeworkCompletionRate: homeworkRate,
        averageScore,
        totalExams: scores.length,
        trend,
      });
    }

    return progressList;
  },

  async getClassAnalytics(classId: string): Promise<ClassAnalytics | null> {
    const { data: classData } = await supabaseAdmin
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single();

    if (!classData) return null;

    const { data: students } = await supabaseAdmin
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'active');

    const studentIds = students?.map(s => s.student_id) || [];

    const [attendance, homeworkSubmissions, examScores] = await Promise.all([
      supabaseAdmin.from('attendance').select('status').in('student_id', studentIds).eq('class_id', classId),
      supabaseAdmin.from('homework_submissions').select('*').in('student_id', studentIds),
      supabaseAdmin.from('exam_scores').select('percentage').in('student_id', studentIds),
    ]);

    const totalAtt = attendance.data?.length || 0;
    const presentAtt = attendance.data?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
    const averageAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    const totalHw = homeworkSubmissions.data?.length || 0;
    const completedHw = homeworkSubmissions.data?.filter(h => h.status === 'submitted' || h.status === 'graded').length || 0;
    const averageHomeworkCompletion = totalHw > 0 ? Math.round((completedHw / totalHw) * 100) : 0;

    const scores = examScores.data?.filter(e => e.percentage !== null).map(e => e.percentage as number) || [];
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const scoreDistribution = [
      { range: '0-50%', count: scores.filter(s => s < 50).length },
      { range: '50-70%', count: scores.filter(s => s >= 50 && s < 70).length },
      { range: '70-85%', count: scores.filter(s => s >= 70 && s < 85).length },
      { range: '85-100%', count: scores.filter(s => s >= 85).length },
    ];

    return {
      classId,
      className: classData.name,
      totalStudents: studentIds.length,
      averageAttendance,
      averageHomeworkCompletion,
      averageScore,
      scoreDistribution,
      attendanceByMonth: [],
    };
  },

  async getRecentActivity(limit = 20) {
    const { data: recentStudents } = await supabaseAdmin
      .from('students')
      .select('id, display_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: recentEnrollments } = await supabaseAdmin
      .from('student_classes')
      .select('id, created_at, student_id, class_id, classes(name), students(display_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    return {
      recentStudents: recentStudents || [],
      recentEnrollments: recentEnrollments || [],
    };
  },
};
