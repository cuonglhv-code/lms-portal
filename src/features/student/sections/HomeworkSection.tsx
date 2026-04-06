import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { BookOpen, Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { StudentHomework } from '../../../hooks/student/useStudentHomework';
import { StudentClass } from '../../../hooks/student/useStudentClasses';

interface HomeworkSectionProps {
  homework: StudentHomework[];
  classes: StudentClass[];
}

export const HomeworkSection: React.FC<HomeworkSectionProps> = ({ homework, classes }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
  };

  const filteredHomework = useMemo(() => {
    let filtered = [...homework];
    
    if (filter === 'pending') {
      filtered = filtered.filter(h => h.status === 'submitted' || !h.gradedAt);
    } else if (filter === 'completed') {
      filtered = filtered.filter(h => h.status === 'graded' || h.status === 'returned');
    }
    
    return filtered.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
  }, [homework, filter]);

  const stats = useMemo(() => {
    const total = homework.length;
    const completed = homework.filter(h => h.status === 'graded' || h.status === 'returned').length;
    const pending = homework.filter(h => h.status === 'submitted' || !h.gradedAt).length;
    const late = homework.filter(h => h.status === 'submitted' && h.dueDate && new Date(h.dueDate) < new Date()).length;
    return { total, completed, pending, late, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [homework]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
      case 'returned':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'submitted':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded': return 'Graded';
      case 'returned': return 'Returned';
      case 'submitted': return 'Submitted';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
      case 'returned':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'submitted':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Homework</h1>
        <p className="text-gray-500 text-sm mt-1">Track your assignments</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{stats.late}</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Late</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-indigo-600">{stats.rate}%</p>
          <p className="text-xs text-gray-500 uppercase font-bold">Rate</p>
        </Card>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredHomework.length > 0 ? (
          filteredHomework.map((hw, idx) => (
            <motion.div
              key={hw.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(hw.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {hw.className || getClassName(hw.classId)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{hw.title}</h3>
                      {hw.dueDate && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {format(parseISO(hw.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(hw.status)}`}>
                      {getStatusLabel(hw.status)}
                    </span>
                    {hw.pointsEarned !== null && hw.pointsEarned !== undefined && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">Score</p>
                        <p className="text-lg font-black text-indigo-600">{hw.pointsEarned}/{hw.totalPoints}</p>
                      </div>
                    )}
                    {hw.feedback && (
                      <div className="max-w-xs p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Teacher Feedback</p>
                        <p className="text-sm text-gray-600 italic">"{hw.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No Homework Yet' : filter === 'pending' ? 'All Caught Up!' : 'No Completed Homework'}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'You have no homework assignments.' : 
               filter === 'pending' ? 'You have completed all your homework!' : 
               'Complete some homework to see it here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
