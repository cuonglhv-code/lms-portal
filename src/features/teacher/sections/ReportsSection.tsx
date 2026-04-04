import React, { useState, useMemo } from 'react';
import { Printer } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { motion } from 'motion/react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { cn } from '../../../utils/cn';
import { 
  Student, 
  Class, 
  Enrollment, 
  Attendance, 
  Homework, 
  ExamScore 
} from '../../../types/models';

interface ReportsSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  homework: Homework[];
  exams: ExamScore[];
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  attendance, 
  homework, 
  exams 
}) => {
  const [reportType, setReportType] = useState<'student' | 'class'>('student');
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportClassId, setReportClassId] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const reportData = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (reportType === 'student') {
      if (!reportStudentId) return null;
      const student = students.find(s => s.id === reportStudentId);
      if (!student) return null;

      const filteredAttendance = attendance.filter(a => 
        a.studentId === reportStudentId && 
        parseISO(a.date) >= start && 
        parseISO(a.date) <= end
      );

      const filteredHomework = homework.filter(h => 
        h.studentId === reportStudentId && 
        parseISO(h.date) >= start && 
        parseISO(h.date) <= end
      );

      const filteredExams = exams.filter(e => 
        e.studentId === reportStudentId && 
        parseISO(e.date) >= start && 
        parseISO(e.date) <= end
      );

      const latestExam = filteredExams.length > 0 
        ? filteredExams.reduce((prev, current) => (parseISO(prev.date) > parseISO(current.date)) ? prev : current)
        : null;

      return {
        type: 'student' as const,
        student,
        attendance: {
          total: filteredAttendance.length,
          present: filteredAttendance.filter(a => a.status === 'present').length,
          absent: filteredAttendance.filter(a => a.status === 'absent').length,
          late: filteredAttendance.filter(a => a.status === 'late').length,
        },
        homework: {
          total: filteredHomework.length,
          submitted: filteredHomework.filter(h => h.status === 'yes').length,
          no: filteredHomework.filter(h => h.status === 'no').length,
          late: filteredHomework.filter(h => h.status === 'late').length,
        },
        exams: filteredExams.sort((a, b) => b.date.localeCompare(a.date)),
        latestExam
      };
    } else {
      if (!reportClassId) return null;
      const classObj = classes.find(c => c.id === reportClassId);
      if (!classObj) return null;

      const classEnrollments = enrollments.filter(e => e.classId === reportClassId);
      const studentIds = classEnrollments.map(e => e.studentId);

      const filteredAttendance = attendance.filter(a => 
        studentIds.includes(a.studentId) && 
        parseISO(a.date) >= start && 
        parseISO(a.date) <= end
      );

      const filteredHomework = homework.filter(h => 
        studentIds.includes(h.studentId) && 
        parseISO(h.date) >= start && 
        parseISO(h.date) <= end
      );

      const filteredExams = exams.filter(e => 
        studentIds.includes(e.studentId) && 
        parseISO(e.date) >= start && 
        parseISO(e.date) <= end
      );

      const studentPerformance = studentIds.map(sid => {
        const s = students.find(st => st.id === sid);
        const sAtt = filteredAttendance.filter(a => a.studentId === sid);
        const sExams = filteredExams.filter(e => e.studentId === sid);
        const sAvg = sExams.length > 0 
          ? sExams.reduce((acc, curr) => acc + ((curr.writing ?? 0) + (curr.reading ?? 0) + (curr.speaking ?? 0) + (curr.listening ?? 0)) / 4, 0) / sExams.length
          : 0;
        
        return {
          name: s?.name || 'Unknown',
          attendanceRate: sAtt.length > 0 ? (sAtt.filter(a => a.status === 'present' || a.status === 'late').length / sAtt.length) * 100 : 0,
          avgScore: sAvg
        };
      });

      return {
        type: 'class' as const,
        classObj,
        studentCount: studentIds.length,
        attendance: {
          total: filteredAttendance.length,
          present: filteredAttendance.filter(a => a.status === 'present').length,
          absent: filteredAttendance.filter(a => a.status === 'absent').length,
          late: filteredAttendance.filter(a => a.status === 'late').length,
        },
        homework: {
          total: filteredHomework.length,
          submitted: filteredHomework.filter(h => h.status === 'yes').length,
          no: filteredHomework.filter(h => h.status === 'no').length,
          late: filteredHomework.filter(h => h.status === 'late').length,
        },
        studentPerformance
      };
    }
  }, [reportType, reportStudentId, reportClassId, startDate, endDate, students, classes, enrollments, attendance, homework, exams]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Automated Reporting System</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setReportType('student')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              reportType === 'student' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Student Report
          </button>
          <button
            onClick={() => setReportType('class')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              reportType === 'class' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Class Report
          </button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              {reportType === 'student' ? 'Select Student' : 'Select Class'}
            </label>
            {reportType === 'student' ? (
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.entryLevel} → {s.targetOutcome})</option>
                ))}
              </select>
            ) : (
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={reportClassId}
                onChange={(e) => setReportClassId(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.center})</option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-white shadow-xl border-0 overflow-hidden" id="report-content">
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-indigo-900">
                  {reportData.type === 'student' ? 'Student Performance Report' : 'Class Performance Report'}
                </h1>
                <p className="text-gray-500 mt-1">
                  Period: {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">Jaxtina English Center</p>
                <p className="text-sm text-gray-500">Official Academic Record</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-indigo-500 pl-3">
                  {reportData.type === 'student' ? 'Student Information' : 'Class Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {reportData.type === 'student' ? (
                    <>
                      <p className="text-gray-500">Name:</p><p className="font-medium">{reportData.student.name}</p>
                      <p className="text-gray-500">Entry Level:</p><p className="font-medium">{reportData.student.entryLevel}</p>
                      <p className="text-gray-500">Target Outcome:</p><p className="font-medium text-indigo-600 font-bold">{reportData.student.targetOutcome}</p>
                      <p className="text-gray-500">Student ID:</p><p className="font-medium">{reportData.student.id}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500">Class Name:</p><p className="font-medium">{reportData.classObj.name}</p>
                      <p className="text-gray-500">Center:</p><p className="font-medium">{reportData.classObj.center}</p>
                      <p className="text-gray-500">Teacher:</p><p className="font-medium">{reportData.classObj.teacher}</p>
                      <p className="text-gray-500">Student Count:</p><p className="font-medium">{reportData.studentCount}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-emerald-500 pl-3">Summary Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="text-gray-500">Attendance Rate:</p>
                  <p className="font-bold text-emerald-600">
                    {reportData.attendance.total > 0 
                      ? Math.round(((reportData.attendance.present + reportData.attendance.late) / reportData.attendance.total) * 100)
                      : 100}%
                  </p>
                  <p className="text-gray-500">HW Completion:</p>
                  <p className="font-bold text-indigo-600">
                    {reportData.homework.total > 0 
                      ? Math.round(((reportData.homework.submitted + reportData.homework.late) / reportData.homework.total) * 100)
                      : 100}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {reportData.type === 'student' ? (
                <>
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Exam Performance Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600">
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-center">Writing</th>
                            <th className="px-4 py-2 text-center">Reading</th>
                            <th className="px-4 py-2 text-center">Speaking</th>
                            <th className="px-4 py-2 text-center">Listening</th>
                            <th className="px-4 py-2 text-center font-bold">Average</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {reportData.exams.map((e, idx) => {
                            const scores = [e.writing, e.reading, e.speaking, e.listening].filter(s => s !== undefined) as number[];
                            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                            return (
                              <tr key={idx}>
                                <td className="px-4 py-3">{format(parseISO(e.date), 'MMM d, yyyy')}</td>
                                <td className="px-4 py-3 text-center">{e.writing ?? '-'}</td>
                                <td className="px-4 py-3 text-center">{e.reading ?? '-'}</td>
                                <td className="px-4 py-3 text-center">{e.speaking ?? '-'}</td>
                                <td className="px-4 py-3 text-center">{e.listening ?? '-'}</td>
                                <td className="px-4 py-3 text-center font-bold text-indigo-600">{avg.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                          {reportData.exams.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">No exam records found for this period.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Student Performance Overview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="px-4 py-2 text-left">Student Name</th>
                          <th className="px-4 py-2 text-center">Entry Level</th>
                          <th className="px-4 py-2 text-center">Target</th>
                          <th className="px-4 py-2 text-center">Attendance</th>
                          <th className="px-4 py-2 text-center">Avg Score</th>
                          <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {reportData.studentPerformance.map((sp, idx) => {
                          const student = students.find(s => s.name === sp.name);
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-medium">{sp.name}</td>
                              <td className="px-4 py-3 text-center text-xs">{student?.entryLevel || '-'}</td>
                              <td className="px-4 py-3 text-center text-xs font-bold text-indigo-600">{student?.targetOutcome || '-'}</td>
                              <td className="px-4 py-3 text-center">{Math.round(sp.attendanceRate)}%</td>
                              <td className="px-4 py-3 text-center">{sp.avgScore.toFixed(1)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                  sp.attendanceRate < 70 || sp.avgScore < 5.0 
                                    ? "bg-rose-100 text-rose-600" 
                                    : "bg-emerald-100 text-emerald-600"
                                )}>
                                  {sp.attendanceRate < 70 || sp.avgScore < 5.0 ? 'At Risk' : 'On Track'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <div className="pt-8 border-t flex justify-between items-end">
                <div className="text-[10px] text-gray-400">
                  Generated on {format(new Date(), 'MMMM d, yyyy HH:mm:ss')}
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-300 mb-2"></div>
                  <p className="text-xs font-bold text-gray-900">Academic Manager Signature</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
