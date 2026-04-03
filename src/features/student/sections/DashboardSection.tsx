import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, startOfToday } from 'date-fns';
import { motion } from 'motion/react';
import { 
  Building2, 
  Calendar, 
  GraduationCap, 
  Bell,
  TrendingUp,
  BookOpen,
  ChevronRight
} from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { Class } from '../../../types/models';
import { Announcement } from '../../../types/models';
import { Attendance } from '../../../types/models';
import { ExamScore } from '../../../types/models';

interface DashboardSectionProps {
  classes: Class[];
  announcements: Announcement[];
  attendance: Attendance[];
  exams: ExamScore[];
  studentName: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  classes,
  announcements,
  attendance,
  exams,
  studentName,
}) => {
  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((present / attendance.length) * 100);
  };

  const calculateAvgScore = () => {
    if (exams.length === 0) return 0;
    const total = exams.reduce((sum, e) => {
      const avg = ((e.writing || 0) + (e.reading || 0) + (e.speaking || 0) + (e.listening || 0)) / 4;
      return sum + avg;
    }, 0);
    return total / exams.length;
  };

  const upcomingSessions = classes
    .flatMap(c => (c.lessonPlan || []).map(sp => ({ ...sp, className: c.name, classId: c.id })))
    .filter(sp => parseISO(sp.date) >= startOfToday())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {studentName}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your learning overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Enrolled Classes" 
          value={classes.length} 
          icon={<Building2 className="w-6 h-6 text-indigo-600" />} 
        />
        <StatCard 
          label="Attendance Rate" 
          value={`${calculateAttendanceRate()}%`} 
          icon={<Calendar className="w-6 h-6 text-green-600" />} 
        />
        <StatCard 
          label="Avg Exam Score" 
          value={calculateAvgScore().toFixed(1)} 
          icon={<GraduationCap className="w-6 h-6 text-orange-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Upcoming Sessions
            </h3>
            <Link 
              to="/student/classes" 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{format(parseISO(session.date), 'EEEE, MMM d')}</p>
                      <p className="text-sm text-gray-500">{session.className} • Session {session.sessionNumber}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    session.isExam 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {session.isExam ? 'EXAM' : 'CLASS'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No upcoming sessions</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Recent Announcements
            </h3>
            <Link 
              to="/student/messages" 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.slice(0, 4).map((ann, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-500 hover:bg-gray-100 transition-colors">
                  <p className="font-bold text-gray-900 mb-1">{ann.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No announcements yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/student/homework" className="group">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-2xl">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Homework</h4>
                <p className="text-sm text-gray-500">View assignments</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/student/exams" className="group">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-4 rounded-2xl">
                <GraduationCap className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">My Exams</h4>
                <p className="text-sm text-gray-500">View results</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/student/progress" className="group">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">My Progress</h4>
                <p className="text-sm text-gray-500">Track growth</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
