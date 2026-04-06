import { supabase } from '../supabase';

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
      totalAttendanceResult,
      presentAttendanceResult,
      totalHomeworkResult,
      completedHomeworkResult,
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('centers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('students').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
      supabase.from('students').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth).lt('created_at', firstOfMonth),
      supabase.from('attendance').select('id', { count: 'exact', head: true }),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'present'),
      supabase.from('homework').select('id', { count: 'exact', head: true }),
      supabase.from('homework_submissions').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'graded']),
    ]);

    const totalStudents = studentsResult.count || 0;
    const totalTeachers = teachersResult.count || 0;
    const totalClasses = classesResult.count || 0;
    const totalCenters = centersResult.count || 0;
    const newThisMonth = thisMonthResult.count || 0;
    const newLastMonth = lastMonthResult.count || 0;

    const totalAttendance = totalAttendanceResult.count || 0;
    const presentAttendance = presentAttendanceResult.count || 0;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    const totalHomework = totalHomeworkResult.count || 0;
    const completedHomework = completedHomeworkResult.count || 0;
    const homeworkCompletionRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;

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
      homeworkCompletionRate,
    };
  },

  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    const { data: enrollments } = await supabase
      .from('student_classes')
      .select('class_id, classes(name)')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (!enrollments) return [];

    const progressList: StudentProgress[] = [];

    for (const enrollment of enrollments) {
      const classId = enrollment.class_id;
      const className = (enrollment as any).classes?.name || 'Unknown';

      const [attendance, homeworkSubmissions, homeworkTotal, exams] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', studentId).eq('class_id', classId),
        supabase.from('homework_submissions').select('status').eq('student_id', studentId).in('homework_id', 
          (await supabase.from('homework').select('id').eq('class_id', classId)).data?.map((h: any) => h.id) || []
        ),
        supabase.from('homework').select('id', { count: 'exact', head: true }).eq('class_id', classId),
        supabase.from('exam_scores').select('score, percentage').eq('student_id', studentId).in('exam_id',
          (await supabase.from('exams').select('id').eq('class_id', classId)).data?.map((e: any) => e.id) || []
        ),
      ]);

      const totalAtt = attendance.data?.length || 0;
      const presentAtt = attendance.data?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      const totalHw = homeworkSubmissions.data?.length || 0;
      const completedHw = homeworkSubmissions.data?.filter(h => h.status === 'submitted' || h.status === 'graded').length || 0;
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
    const { data: classData } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single();

    if (!classData) return null;

    const { data: students } = await supabase
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'active');

    const studentIds = students?.map(s => s.student_id) || [];

    const [attendance, homeworkSubmissions, homework, examScores] = await Promise.all([
      supabase.from('attendance').select('status').in('student_id', studentIds).eq('class_id', classId),
      supabase.from('homework_submissions').select('*').in('student_id', studentIds),
      supabase.from('homework').select('id').eq('class_id', classId),
      supabase.from('exam_scores').select('percentage').in('student_id', studentIds),
    ]);

    const totalAtt = attendance.data?.length || 0;
    const presentAtt = attendance.data?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
    const averageAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    const totalHw = homework.data?.length || 0;
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
    const { data: recentStudents } = await supabase
      .from('students')
      .select('id, display_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: recentEnrollments } = await supabase
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
