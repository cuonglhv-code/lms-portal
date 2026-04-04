import React, { useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, subDays, addDays } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ScoreInput } from '../../../components/common/ScoreInput';
import { Student, Class, Enrollment, ExamScore } from '../../../types/models';

interface ExamsSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  exams: ExamScore[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onUpdate: (studentId: string, date: Date, field: keyof Omit<ExamScore, 'id' | 'studentId' | 'date'>, value: number | string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const ExamsSection: React.FC<ExamsSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  exams, 
  selectedDate, 
  setSelectedDate, 
  selectedClassId, 
  setSelectedClassId, 
  onUpdate, 
  searchTerm, 
  setSearchTerm 
}) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const studentIds = enrollments.filter(e => e.classId === selectedClassId).map(e => e.studentId);
    return students.filter(s => studentIds.includes(s.id));
  }, [selectedClassId, enrollments, students]);

  const filtered = classStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const examSessions = selectedClass?.lessonPlan?.filter(sp => sp.isExam) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Exam Scores</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Select Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.center})</option>)}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Exam Filter</label>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
              value={dateStr}
              onChange={(e) => { if (e.target.value) setSelectedDate(parseISO(e.target.value)); }}
              disabled={!selectedClass || examSessions.length === 0}
            >
              <option value="">{examSessions.length > 0 ? 'Select Exam Session...' : 'No Exams Found'}</option>
              {examSessions.map(sp => (
                <option key={sp.sessionNumber} value={sp.date}>
                  Exam Session {sp.sessionNumber} ({format(parseISO(sp.date), 'MMM d')})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-gray-50 border-r border-gray-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 font-medium min-w-[140px] text-center">
              {format(selectedDate, 'MMM d, yyyy')}
            </div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-gray-50 border-l border-gray-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!selectedClassId ? (
        <Card className="p-12 text-center text-gray-500">
          Please select a class to start inputting scores.
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Writing</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Reading</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Speaking</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Listening</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((student) => {
                  const record = exams.find(e => e.studentId === student.id && e.date === dateStr);

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <ScoreInput value={record?.writing} onChange={(val) => onUpdate(student.id, selectedDate, 'writing', val)} />
                      <ScoreInput value={record?.reading} onChange={(val) => onUpdate(student.id, selectedDate, 'reading', val)} />
                      <ScoreInput value={record?.speaking} onChange={(val) => onUpdate(student.id, selectedDate, 'speaking', val)} />
                      <ScoreInput value={record?.listening} onChange={(val) => onUpdate(student.id, selectedDate, 'listening', val)} />
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Add comment..."
                          value={record?.comment || ''}
                          onChange={(e) => onUpdate(student.id, selectedDate, 'comment', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
