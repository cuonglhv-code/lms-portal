import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { Student, Attendance, Homework, ExamScore } from '../../../types/models';

interface ProgressSectionProps {
  student: Student | null;
  attendance: Attendance[];
  homework: Homework[];
  exams: ExamScore[];
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  student,
  attendance,
  homework,
  exams,
}) => {
  const stats = useMemo(() => {
    const attendanceRate = attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100)
      : 0;

    const homeworkRate = homework.length > 0
      ? Math.round((homework.filter(h => h.status === 'yes' || h.status === 'late').length / homework.length) * 100)
      : 0;

    const examAverage = exams.length > 0
      ? exams.reduce((sum, e) => {
          const scores = [e.writing, e.reading, e.speaking, e.listening].filter(s => s !== undefined);
          return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
        }, 0) / exams.length
      : 0;

    const skillAverages = {
      writing: exams.length > 0
        ? exams.reduce((sum, e) => sum + (e.writing || 0), 0) / exams.length
        : 0,
      reading: exams.length > 0
        ? exams.reduce((sum, e) => sum + (e.reading || 0), 0) / exams.length
        : 0,
      speaking: exams.length > 0
        ? exams.reduce((sum, e) => sum + (e.speaking || 0), 0) / exams.length
        : 0,
      listening: exams.length > 0
        ? exams.reduce((sum, e) => sum + (e.listening || 0), 0) / exams.length
        : 0,
    };

    return { attendanceRate, homeworkRate, examAverage, skillAverages };
  }, [attendance, homework, exams]);

  const getProgressColor = (value: number, target: number = 7) => {
    if (value >= target) return 'bg-green-500';
    if (value >= target - 2) return 'bg-indigo-500';
    if (value >= target - 4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSkillColor = (value: number) => {
    if (value >= 8) return 'text-green-600 bg-green-100';
    if (value >= 6) return 'text-indigo-600 bg-indigo-100';
    if (value >= 4) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  if (!student) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Student data not available</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 text-center">
          <div className="bg-indigo-100 p-4 rounded-2xl w-fit mx-auto mb-4">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">Target Outcome</p>
          <p className="text-4xl font-black text-gray-900">{student.targetOutcome}</p>
        </Card>
        <Card className="p-8 text-center">
          <div className="bg-green-100 p-4 rounded-2xl w-fit mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">Entry Level</p>
          <p className="text-4xl font-black text-gray-900">{student.entryLevel}</p>
        </Card>
        <Card className="p-8 text-center">
          <div className="bg-amber-100 p-4 rounded-2xl w-fit mx-auto mb-4">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">Current Average</p>
          <p className="text-4xl font-black text-indigo-600">{stats.examAverage.toFixed(1)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Attendance History
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overall Attendance</span>
              <span className="text-sm font-bold text-gray-900">{stats.attendanceRate}%</span>
            </div>
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.attendanceRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getProgressColor(stats.attendanceRate, 80)}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-black text-green-600">
                  {attendance.filter(a => a.status === 'present').length}
                </p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-black text-amber-600">
                  {attendance.filter(a => a.status === 'late').length}
                </p>
                <p className="text-xs text-gray-500">Late</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-black text-red-600">
                  {attendance.filter(a => a.status === 'absent').length}
                </p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Homework Completion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overall Completion</span>
              <span className="text-sm font-bold text-gray-900">{stats.homeworkRate}%</span>
            </div>
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.homeworkRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getProgressColor(stats.homeworkRate, 80)}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-black text-green-600">
                  {homework.filter(h => h.status === 'yes').length}
                </p>
                <p className="text-xs text-gray-500">Submitted</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-black text-amber-600">
                  {homework.filter(h => h.status === 'late').length}
                </p>
                <p className="text-xs text-gray-500">Late</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-black text-red-600">
                  {homework.filter(h => h.status === 'no' || h.status === 'not yet').length}
                </p>
                <p className="text-xs text-gray-500">Missing</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Skill Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Writing', value: stats.skillAverages.writing, shortName: 'WR' },
            { name: 'Reading', value: stats.skillAverages.reading, shortName: 'RD' },
            { name: 'Speaking', value: stats.skillAverages.speaking, shortName: 'SP' },
            { name: 'Listening', value: stats.skillAverages.listening, shortName: 'LS' },
          ].map((skill) => (
            <div key={skill.shortName} className="text-center">
              <div className={`inline-flex p-4 rounded-2xl mb-3 ${getSkillColor(skill.value)}`}>
                <p className="text-3xl font-black">{skill.value.toFixed(1)}</p>
              </div>
              <p className="font-bold text-gray-900">{skill.name}</p>
              <p className="text-xs text-gray-500">Session Average</p>
              <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(skill.value / 10) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${skill.value >= 6 ? 'bg-indigo-500' : skill.value >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
