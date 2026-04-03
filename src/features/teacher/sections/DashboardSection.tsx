import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Target, 
  Clock 
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { motion } from 'motion/react';

import { StatCard } from '../../../components/common/StatCard';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { cn } from '../../../utils/cn';
import { 
  Student, 
  Class, 
  Enrollment, 
  Attendance, 
  Homework, 
  ExamScore 
} from '../../../types/models';

interface DashboardSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  homework: Homework[];
  exams: ExamScore[];
  onViewClass: (id: string) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  attendance, 
  homework, 
  exams, 
  onViewClass 
}) => {
  const [filterClassId, setFilterClassId] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (filterClassId === 'all') {
      return { 
        students, 
        classes, 
        attendance, 
        homework, 
        exams,
        enrollments 
      };
    }
    const classEnrollments = enrollments.filter(e => e.classId === filterClassId);
    const studentIds = classEnrollments.map(e => e.studentId);
    return {
      students: students.filter(s => studentIds.includes(s.id)),
      classes: classes.filter(c => c.id === filterClassId),
      attendance: attendance.filter(a => studentIds.includes(a.studentId)),
      homework: homework.filter(h => studentIds.includes(h.studentId)),
      exams: exams.filter(e => studentIds.includes(e.studentId)),
      enrollments: classEnrollments
    };
  }, [filterClassId, students, classes, enrollments, attendance, homework, exams]);

  const stats = useMemo(() => {
    const { students: s, classes: c, attendance: a, homework: h, exams: e } = filteredData;
    const totalStudents = s.length;
    const totalClasses = c.length;
    
    // Attendance Rate (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentAttendance = a.filter(att => parseISO(att.date) >= thirtyDaysAgo);
    const presentCount = recentAttendance.filter(att => att.status === 'present' || att.status === 'late').length;
    const attendanceRate = recentAttendance.length > 0 ? Math.round((presentCount / recentAttendance.length) * 100) : 0;

    // Homework Completion Rate
    const recentHomework = h.filter(hw => parseISO(hw.date) >= thirtyDaysAgo);
    const completedCount = recentHomework.filter(hw => hw.status === 'yes' || hw.status === 'late').length;
    const homeworkRate = recentHomework.length > 0 ? Math.round((completedCount / recentHomework.length) * 100) : 0;

    // Students at risk (attendance < 70% or avg score < 5.0)
    const atRisk = s.filter(student => {
      const sAtt = a.filter(att => att.studentId === student.id);
      const sAttRate = sAtt.length > 0 ? (sAtt.filter(att => att.status === 'present' || att.status === 'late').length / sAtt.length) : 1;
      
      const sExams = e.filter(exam => exam.studentId === student.id);
      const sAvgScore = sExams.length > 0 
        ? sExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / sExams.length
        : 10;

      return sAttRate < 0.7 || sAvgScore < 5.0;
    });

    // Progress Against Target Outcome
    const progressDistribution = {
      above: 0,
      onTrack: 0,
      behind: 0
    };

    s.forEach(student => {
      const studentEnrollment = enrollments.find(en => en.studentId === student.id);
      if (!studentEnrollment) return;
      
      const studentClass = classes.find(c => c.id === studentEnrollment.classId);
      if (!studentClass) return;

      const studentExams = e.filter(exam => exam.studentId === student.id);
      if (studentExams.length === 0) return;

      const avgScore = studentExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / studentExams.length;
      const target = studentClass.targetOutcome;

      if (avgScore > target) {
        progressDistribution.above++;
      } else if (avgScore >= target - 0.5) {
        progressDistribution.onTrack++;
      } else {
        progressDistribution.behind++;
      }
    });

    return { totalStudents, totalClasses, attendanceRate, homeworkRate, atRiskCount: atRisk.length, atRiskStudents: atRisk, progressDistribution };
  }, [filteredData, enrollments, classes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time metrics for Jaxtina English</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={filterClassId}
              onChange={e => setFilterClassId(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            {format(new Date(), 'MMM d, HH:mm')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats.totalStudents} icon={<Users className="w-6 h-6 text-indigo-600" />} trend="+4%" />
        <StatCard label="Active Classes" value={stats.totalClasses} icon={<BookOpen className="w-6 h-6 text-emerald-600" />} trend="Stable" />
        <StatCard label="Attendance Rate" value={`${stats.attendanceRate}%`} icon={<CheckCircle2 className="w-6 h-6 text-amber-600" />} trend="-2%" />
        <StatCard label="Students at Risk" value={stats.atRiskCount} icon={<HelpCircle className="w-6 h-6 text-rose-600" />} trend={stats.atRiskCount > 0 ? "Needs Attention" : "All Good"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Class Performance
          </h3>
          <div className="space-y-6">
            {filteredData.classes.map(c => {
              const classEnrollments = enrollments.filter(e => e.classId === c.id);
              const studentIds = classEnrollments.map(e => e.studentId);
              
              const classAttendance = filteredData.attendance.filter(a => studentIds.includes(a.studentId));
              const present = classAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
              const attRate = classAttendance.length > 0 ? Math.round((present / classAttendance.length) * 100) : 0;

              const classExams = filteredData.exams.filter(e => studentIds.includes(e.studentId));
              const avgScore = classExams.length > 0 
                ? Math.round(classExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / classExams.length * 10) / 10
                : 0;

              const classProgress = { above: 0, onTrack: 0, behind: 0 };
              classEnrollments.forEach(en => {
                const sExams = filteredData.exams.filter(ex => ex.studentId === en.studentId);
                if (sExams.length === 0) return;
                const sAvg = sExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / sExams.length;
                if (sAvg > c.targetOutcome) classProgress.above++;
                else if (sAvg >= c.targetOutcome - 0.5) classProgress.onTrack++;
                else classProgress.behind++;
              });

              return (
                <div key={c.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                      <span className="text-[10px] ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{c.center}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 mr-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`${classProgress.above} Above`} />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={`${classProgress.onTrack} On Track`} />
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" title={`${classProgress.behind} Behind`} />
                      </div>
                      <span className="text-xs font-bold text-indigo-600">{avgScore} avg</span>
                      <Button variant="ghost" className="p-1 h-6 w-6" onClick={() => onViewClass(c.id)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${attRate}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{classEnrollments.length} students</span>
                    <span className="text-[10px] text-gray-400">{attRate}% attendance</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-600" />
            Progress Against Target
          </h3>
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="flex items-end gap-2 h-32 w-full max-w-[200px]">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(stats.progressDistribution.above / (stats.totalStudents || 1)) * 100}%` }}
                    className="w-full bg-emerald-500 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[10px] font-bold text-gray-500">Above</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(stats.progressDistribution.onTrack / (stats.totalStudents || 1)) * 100}%` }}
                    className="w-full bg-indigo-500 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[10px] font-bold text-gray-500">On Track</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(stats.progressDistribution.behind / (stats.totalStudents || 1)) * 100}%` }}
                    className="w-full bg-rose-500 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[10px] font-bold text-gray-500">Behind</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <p className="text-lg font-bold text-emerald-700">{stats.progressDistribution.above}</p>
                <p className="text-[10px] text-emerald-600 uppercase font-bold">Above</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-center">
                <p className="text-lg font-bold text-indigo-700">{stats.progressDistribution.onTrack}</p>
                <p className="text-[10px] text-indigo-600 uppercase font-bold">On Track</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-center">
                <p className="text-lg font-bold text-rose-700">{stats.progressDistribution.behind}</p>
                <p className="text-[10px] text-rose-600 uppercase font-bold">Behind</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center italic">
              Based on average exam scores vs. class target outcomes.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {filteredData.attendance.slice(0, 5).map((a, i) => {
              const student = students.find(s => s.id === a.studentId);
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    "w-2 h-2 mt-1.5 rounded-full",
                    a.status === 'present' ? "bg-green-500" : a.status === 'absent' ? "bg-red-500" : "bg-yellow-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student?.name} marked as <span className="font-bold">{a.status}</span>
                    </p>
                    <p className="text-xs text-gray-500">{format(parseISO(a.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              );
            })}
            {filteredData.attendance.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent activity to show.
              </div>
            )}
          </div>
        </Card>
      </div>

      {stats.atRiskCount > 0 && (
        <Card className="p-6 border-l-4 border-rose-500">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            Students Needing Attention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.atRiskStudents.map(s => {
              const sAtt = attendance.filter(a => a.studentId === s.id);
              const sAttRate = sAtt.length > 0 ? Math.round((sAtt.filter(a => a.status === 'present' || a.status === 'late').length / sAtt.length) * 100) : 100;
              const sExams = exams.filter(e => e.studentId === s.id);
              const sAvgScore = sExams.length > 0 
                ? (sExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / sExams.length).toFixed(1)
                : 'N/A';

              return (
                <div key={s.id} className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className={cn(sAttRate < 70 ? "text-rose-600 font-bold" : "text-gray-500")}>
                      Att: {sAttRate}%
                    </span>
                    <span className={cn(sAvgScore !== 'N/A' && Number(sAvgScore) < 5.0 ? "text-rose-600 font-bold" : "text-gray-500")}>
                      Avg: {sAvgScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
