import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  GraduationCap, 
  Users, 
  Clock 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { cn } from '../../../utils/cn';
import { 
  Class, 
  Student, 
  Enrollment, 
  Attendance, 
  Homework, 
  ExamScore 
} from '../../../types/models';

interface ClassDetailSectionProps {
  classObj: Class;
  students: Student[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  homework: Homework[];
  exams: ExamScore[];
  onBack: () => void;
  setActiveTab: (tab: any) => void;
  setSelectedClassId: (id: string) => void;
  setSelectedDate: (date: Date) => void;
}

export const ClassDetailSection: React.FC<ClassDetailSectionProps> = ({ 
  classObj, 
  students, 
  enrollments, 
  attendance, 
  homework, 
  exams, 
  onBack,
  setActiveTab,
  setSelectedClassId,
  setSelectedDate
}) => {
  const [detailTab, setDetailTab] = useState<'overview' | 'lesson-plan'>('overview');
  const classEnrollments = enrollments.filter(e => e.classId === classObj.id);
  const classStudents = students.filter(s => classEnrollments.some(e => e.studentId === s.id));
  
  const classAttendance = attendance.filter(a => classStudents.some(s => s.id === a.studentId));
  const classHomework = homework.filter(h => classStudents.some(s => s.id === h.studentId));
  const classExams = exams.filter(e => classStudents.some(s => s.id === e.studentId));

  const stats = useMemo(() => {
    const presentCount = classAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attRate = classAttendance.length > 0 ? Math.round((presentCount / classAttendance.length) * 100) : 0;
    
    const completedHW = classHomework.filter(h => h.status === 'yes' || h.status === 'late').length;
    const hwRate = classHomework.length > 0 ? Math.round((completedHW / classHomework.length) * 100) : 0;
    
    const avgScore = classExams.length > 0 
      ? classExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / classExams.length
      : 0;

    return { attRate, hwRate, avgScore: avgScore.toFixed(1) };
  }, [classAttendance, classHomework, classExams]);

  const sessions = useMemo(() => {
    const dates = Array.from(new Set(classAttendance.map(a => a.date))).sort((a, b) => String(b).localeCompare(String(a)));
    return dates.map(date => {
      const dayAtt = classAttendance.filter(a => a.date === date);
      const present = dayAtt.filter(a => a.status === 'present' || a.status === 'late').length;
      return {
        date,
        present,
        total: classStudents.length,
        rate: Math.round((present / classStudents.length) * 100)
      };
    });
  }, [classAttendance, classStudents]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{classObj.name}</h2>
            <p className="text-gray-500 font-medium">{classObj.center} • Teacher: {classObj.teacher}</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setDetailTab('overview')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              detailTab === 'overview' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setDetailTab('lesson-plan')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              detailTab === 'lesson-plan' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Lesson Plan
          </button>
        </div>
      </div>

      {detailTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard label="Attendance Rate" value={`${stats.attRate}%`} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} />
            <StatCard label="HW Completion" value={`${stats.hwRate}%`} icon={<FileText className="w-6 h-6 text-indigo-600" />} />
            <StatCard label="Average Score" value={stats.avgScore} icon={<GraduationCap className="w-6 h-6 text-amber-600" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Students in Class
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold text-center">Attendance</th>
                        <th className="pb-3 font-semibold text-center">HW Rate</th>
                        <th className="pb-3 font-semibold text-center">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {classStudents.map(s => {
                        const sAtt = classAttendance.filter(a => a.studentId === s.id);
                        const sAttRate = sAtt.length > 0 ? Math.round((sAtt.filter(a => a.status === 'present' || a.status === 'late').length / sAtt.length) * 100) : 0;
                        
                        const sHW = classHomework.filter(h => h.studentId === s.id);
                        const sHWRate = sHW.length > 0 ? Math.round((sHW.filter(h => h.status === 'yes' || h.status === 'late').length / sHW.length) * 100) : 0;
                        
                        const sExams = classExams.filter(e => e.studentId === s.id);
                        const sAvg = sExams.length > 0 
                          ? (sExams.reduce((acc, curr) => acc + (curr.writing + curr.reading + curr.speaking + curr.listening) / 4, 0) / sExams.length).toFixed(1)
                          : 'N/A';

                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 font-medium text-gray-900">{s.name}</td>
                            <td className="py-4 text-center">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold",
                                sAttRate >= 80 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              )}>
                                {sAttRate}%
                              </span>
                            </td>
                            <td className="py-4 text-center text-gray-600">{sHWRate}%</td>
                            <td className="py-4 text-center font-bold text-indigo-600">{sAvg}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Recent Sessions
                </h3>
                <div className="space-y-4">
                  {sessions.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{format(parseISO(session.date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-gray-500">{session.present}/{session.total} students present</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{session.rate}%</p>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-center py-8 text-gray-500 text-sm italic">No sessions recorded yet.</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-indigo-600 text-white">
                <h3 className="text-lg font-bold mb-2">Class Info</h3>
                <p className="text-3xl font-black mb-4">{classObj.targetOutcome} Target</p>
                <div className="space-y-2 text-sm opacity-90">
                  <p>Schedule: {(classObj.classDays || []).join(', ')}, {classObj.startTime} - {classObj.endTime}</p>
                  <p>Sessions/Week: {classObj.sessionsPerWeek}</p>
                  <p>Starting Level: {classObj.startingLevel}</p>
                  <p>Total Sessions: {classObj.totalSessions}</p>
                  <p>Start Date: {format(parseISO(classObj.startDate), 'MMM d, yyyy')}</p>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classObj.lessonPlan?.map((session, idx) => (
            <Card key={idx} className="p-5 flex flex-col h-full border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                    Session {session.sessionNumber}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 font-medium">
                    {session.date ? format(parseISO(session.date), 'EEEE, MMM d') : 'No date'}
                  </span>
                </div>
                {session.isExam && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">Exam</span>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Contents</label>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{session.contents || 'No contents defined'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Homework</label>
                  <p className="text-sm text-gray-600 leading-snug">{session.homework || 'No homework assigned'}</p>
                  {session.deadline && (
                    <p className="text-[10px] text-indigo-500 mt-1 font-medium">
                      Deadline: {format(parseISO(session.deadline), 'MMM d, HH:mm')}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-xs h-8"
                  onClick={() => {
                    setSelectedClassId(classObj.id);
                    setSelectedDate(parseISO(session.date));
                    setActiveTab('attendance');
                  }}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Attendance
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-xs h-8"
                  onClick={() => {
                    setSelectedClassId(classObj.id);
                    setSelectedDate(parseISO(session.date));
                    setActiveTab('homework');
                  }}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Mark HW
                </Button>
              </div>
            </Card>
          ))}
          {(!classObj.lessonPlan || classObj.lessonPlan.length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-500 italic">
              No lesson plan defined for this class.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
