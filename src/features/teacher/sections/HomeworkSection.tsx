import React, { useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { format, parseISO, subDays, addDays } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatusButton } from '../../../components/common/StatusButton';
import { cn } from '../../../utils/cn';
import { Student, Class, Enrollment, Homework } from '../../../types/models';

interface HomeworkSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  homework: Homework[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onUpdate: (studentId: string, date: Date, status: Homework['status'], mark?: number, comments?: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const HomeworkSection: React.FC<HomeworkSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  homework, 
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
  const sessionPlan = selectedClass?.lessonPlan?.find(sp => sp.date === dateStr);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Homework Submissions</h2>
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
            <label className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Jump to Session</label>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
              value={dateStr}
              onChange={(e) => setSelectedDate(parseISO(e.target.value))}
              disabled={!selectedClass || !selectedClass.lessonPlan || selectedClass.lessonPlan.length === 0}
            >
              <option value="">{selectedClass?.lessonPlan?.length ? 'Select Session...' : 'No Lesson Plan'}</option>
              {selectedClass?.lessonPlan?.map(sp => (
                <option key={sp.sessionNumber} value={sp.date}>
                  Session {sp.sessionNumber} ({format(parseISO(sp.date), 'MMM d')}) {sp.isExam ? '• EXAM' : ''}
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

      {selectedClassId && sessionPlan && (
        <Card className="p-4 bg-indigo-50 border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900">Session {sessionPlan.sessionNumber} Assignment</h3>
              <p className="text-sm text-indigo-700 mt-1">{sessionPlan.homework || 'No homework assigned for this session.'}</p>
              {sessionPlan.deadline && (
                <p className="text-xs text-indigo-500 mt-1 font-medium">
                  Deadline: {format(parseISO(sessionPlan.deadline), 'MMM d, HH:mm')}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {!selectedClassId ? (
        <Card className="p-12 text-center text-gray-500">
          Please select a class to start checking homework.
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Mark & Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((student) => {
                  const record = homework.find(h => h.studentId === student.id && h.date === dateStr);
                  const status = record?.status || 'not yet';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <StatusButton 
                            active={status === 'yes'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'yes', record?.mark, record?.comments)}
                            color="green"
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            label="Submitted"
                          />
                          <StatusButton 
                            active={status === 'no'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'no', record?.mark, record?.comments)}
                            color="red"
                            icon={<XCircle className="w-4 h-4" />}
                            label="No"
                          />
                          <StatusButton 
                            active={status === 'late'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'late', record?.mark, record?.comments)}
                            color="yellow"
                            icon={<Clock className="w-4 h-4" />}
                            label="Late"
                          />
                          <StatusButton 
                            active={status === 'not yet'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'not yet', record?.mark, record?.comments)}
                            color="gray"
                            icon={<HelpCircle className="w-4 h-4" />}
                            label="Not Yet"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase w-10">Mark</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                              value={record?.mark || ''}
                              onChange={(e) => onUpdate(student.id, selectedDate, status, e.target.value ? parseFloat(e.target.value) : undefined, record?.comments)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase w-10">Note</label>
                            <input
                              type="text"
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                              placeholder="Add comment..."
                              value={record?.comments || ''}
                              onChange={(e) => onUpdate(student.id, selectedDate, status, record?.mark, e.target.value || undefined)}
                            />
                          </div>
                        </div>
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
