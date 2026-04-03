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
import { Student, Class, Enrollment, Attendance } from '../../../types/models';

interface AttendanceSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onUpdate: (studentId: string, date: Date, status: Attendance['status']) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  attendance, 
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
        <h2 className="text-2xl font-bold text-gray-900">Attendance Check</h2>
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

      {sessionPlan && (
        <Card className="p-4 border-l-4 border-indigo-500 bg-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Session {sessionPlan.sessionNumber} Contents</p>
              <p className="text-sm font-medium text-gray-900">{sessionPlan.contents || 'No contents defined'}</p>
            </div>
          </div>
        </Card>
      )}

      {!selectedClassId ? (
        <Card className="p-12 text-center text-gray-500">
          Please select a class to start checking attendance.
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((student) => {
                  const record = attendance.find(a => a.studentId === student.id && a.date === dateStr);
                  const status = record?.status || 'not yet';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <StatusButton 
                            active={status === 'present'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'present')}
                            color="green"
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            label="Present"
                          />
                          <StatusButton 
                            active={status === 'absent'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'absent')}
                            color="red"
                            icon={<XCircle className="w-4 h-4" />}
                            label="Absent"
                          />
                          <StatusButton 
                            active={status === 'late'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'late')}
                            color="yellow"
                            icon={<Clock className="w-4 h-4" />}
                            label="Late"
                          />
                          <StatusButton 
                            active={status === 'not yet'} 
                            onClick={() => onUpdate(student.id, selectedDate, 'not yet')}
                            color="gray"
                            icon={<HelpCircle className="w-4 h-4" />}
                            label="Not Yet"
                          />
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
