import React, { useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ScoreInput } from '../../../components/common/ScoreInput';
import { Student, Class, Enrollment, ExamScore } from '../../../types/models';
import { useSubscribe } from '../../../hooks/useSubscribe';

interface DBExam {
  id: string;
  class_id: string;
  title: string;
  exam_date: string;
  exam_type: string;
}

interface ExamsSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  exams: ExamScore[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onUpdate: (studentId: string, examId: string, field: keyof Omit<ExamScore, 'id' | 'studentId' | 'date'>, value: number | string) => void;
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
  const { data: dbExams } = useSubscribe<DBExam>({
    table: 'exams',
    filter: selectedClassId ? { column: 'class_id', value: selectedClassId } : undefined,
    orderBy: { column: 'exam_date', ascending: false }
  });

  const [selectedExamId, setSelectedExamId] = useState('');

  useEffect(() => {
    if (selectedClassId && dbExams && dbExams.length > 0 && !selectedExamId) {
      setSelectedExamId(dbExams[0].id);
    }
  }, [selectedClassId, dbExams]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const studentIds = enrollments.filter(e => e.classId === selectedClassId).map(e => e.studentId);
    return students.filter(s => studentIds.includes(s.id));
  }, [selectedClassId, enrollments, students]);

  const filtered = classStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const selectedExam = dbExams?.find(e => e.id === selectedExamId);
  const examDateStr = selectedExam ? format(parseISO(selectedExam.exam_date), 'yyyy-MM-dd') : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Exam Scores</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedClassId}
            onChange={(e) => { setSelectedClassId(e.target.value); setSelectedExamId(''); }}
          >
            <option value="">Select Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              const exam = dbExams?.find(ex => ex.id === e.target.value);
              if (exam) setSelectedDate(parseISO(exam.exam_date));
            }}
            disabled={!selectedClassId || !dbExams || dbExams.length === 0}
          >
            <option value="">{dbExams && dbExams.length > 0 ? 'Select Exam...' : 'No Exams Found'}</option>
            {dbExams?.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({format(parseISO(exam.exam_date), 'MMM d')})
              </option>
            ))}
          </select>

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
        </div>
      </div>

      {!selectedClassId ? (
        <Card className="p-12 text-center text-gray-500">
          Please select a class to start inputting scores.
        </Card>
      ) : !selectedExamId ? (
        <Card className="p-12 text-center text-gray-500">
          Please select an exam to input scores.
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
                  const record = exams.find(e => e.studentId === student.id && e.examId === selectedExamId);

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <ScoreInput value={record?.writing} onChange={(val) => onUpdate(student.id, selectedExamId, 'writing', val)} />
                      <ScoreInput value={record?.reading} onChange={(val) => onUpdate(student.id, selectedExamId, 'reading', val)} />
                      <ScoreInput value={record?.speaking} onChange={(val) => onUpdate(student.id, selectedExamId, 'speaking', val)} />
                      <ScoreInput value={record?.listening} onChange={(val) => onUpdate(student.id, selectedExamId, 'listening', val)} />
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Add comment..."
                          value={record?.comment || ''}
                          onChange={(e) => onUpdate(student.id, selectedExamId, 'comment', e.target.value)}
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
