import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { GraduationCap, TrendingUp, MessageSquare } from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { StudentExamScore } from '../../../hooks/student/useStudentExams';

interface ExamsSectionProps {
  exams: StudentExamScore[];
}

interface SkillScore {
  name: string;
  shortName: string;
  value: number | null;
  color: string;
}

export const ExamsSection: React.FC<ExamsSectionProps> = ({ exams }) => {
  const stats = useMemo(() => {
    if (exams.length === 0) return { average: 0, total: 0, highest: 0, lowest: 10 };
    
    const averages = exams.map(e => {
      const scores = [e.writing, e.reading, e.speaking, e.listening].filter((s): s is number => s !== null && s !== undefined);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });
    
    return {
      average: averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0,
      total: exams.length,
      highest: Math.max(...averages),
      lowest: averages.length > 0 ? Math.min(...averages) : 0,
    };
  }, [exams]);

  const getSkillScore = (exam: StudentExamScore): SkillScore[] => [
    { name: 'Writing', shortName: 'WR', value: exam.writing, color: 'indigo' },
    { name: 'Reading', shortName: 'RD', value: exam.reading, color: 'emerald' },
    { name: 'Speaking', shortName: 'SP', value: exam.speaking, color: 'amber' },
    { name: 'Listening', shortName: 'LS', value: exam.listening, color: 'rose' },
  ];

  const getScoreColor = (value: number | null) => {
    if (value === null) return 'text-gray-400';
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-indigo-600';
    if (value >= 4) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value: number | null) => {
    if (value === null) return 'bg-gray-100';
    if (value >= 8) return 'bg-green-100';
    if (value >= 6) return 'bg-indigo-100';
    if (value >= 4) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Exams</h1>
        <p className="text-gray-500 text-sm mt-1">Track your exam performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-indigo-600">{stats.average.toFixed(1)}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Average</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Exams Taken</p>
        </Card>
        <Card className="p-4 text-center">
          <p className={`text-3xl font-black ${getScoreColor(stats.highest)}`}>{stats.highest.toFixed(1)}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Highest</p>
        </Card>
        <Card className="p-4 text-center">
          <p className={`text-3xl font-black ${getScoreColor(stats.lowest)}`}>{stats.lowest.toFixed(1)}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Lowest</p>
        </Card>
      </div>

      <div className="space-y-4">
        {exams.length > 0 ? (
          exams.map((exam, idx) => {
            const skills = getSkillScore(exam);
            const validScores = skills.map(s => s.value).filter((v): v is number => v !== null);
            const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

            return (
              <motion.div
                key={exam.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          {exam.className || 'General'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {exam.examTitle}
                        </span>
                      </div>
                      
                      {exam.examDate && (
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {format(parseISO(exam.examDate), 'MMMM d, yyyy')}
                        </h3>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {skills.map((skill) => (
                          <div key={skill.shortName} className={`p-3 rounded-xl ${getScoreBgColor(skill.value)}`}>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{skill.shortName}</p>
                            <p className={`text-2xl font-black ${getScoreColor(skill.value)}`}>
                              {skill.value !== null ? skill.value : '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-6 rounded-2xl ${getScoreBgColor(average)} text-center min-w-[120px]`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Avg Score</p>
                        <p className={`text-5xl font-black ${getScoreColor(average)}`}>
                          {average.toFixed(1)}
                        </p>
                      </div>

                      {exam.comments && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 max-w-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Teacher Feedback
                          </p>
                          <p className="text-sm text-gray-600 italic">"{exam.comments}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exam Results Yet</h3>
            <p className="text-gray-500">Your exam results will appear here once they are recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
