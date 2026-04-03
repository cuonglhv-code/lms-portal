import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO, startOfToday, isPast } from 'date-fns';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Clock, 
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Circle
} from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Class, LessonSession } from '../../../types/models';
import { Homework } from '../../../types/models';

interface ClassDetailSectionProps {
  classObj: Class | null;
  homework: Homework[];
  loading: boolean;
}

export const ClassDetailSection: React.FC<ClassDetailSectionProps> = ({
  classObj,
  homework,
  loading,
}) => {
  const getHomeworkForSession = (date: string) => {
    return homework.find(h => h.date === date);
  };

  const getSessionStatus = (session: LessonSession) => {
    if (session.isExam) return 'exam';
    const today = startOfToday();
    if (isPast(parseISO(session.date))) return 'completed';
    if (parseISO(session.date).getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classObj) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Class not found</h2>
      </div>
    );
  }

  const sortedSessions = [...(classObj.lessonPlan || [])].sort(
    (a, b) => a.sessionNumber - b.sessionNumber
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/student/classes">
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{classObj.name}</h1>
          <p className="text-gray-500 text-sm">{classObj.center}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Teacher</p>
              <p className="font-bold text-gray-900">{classObj.teacher || 'TBD'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Schedule</p>
              <p className="font-bold text-gray-900">{classObj.classDays.join(', ')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Time</p>
              <p className="font-bold text-gray-900">{classObj.startTime} - {classObj.endTime}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Level</p>
              <p className="font-bold text-gray-900">{classObj.startingLevel}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          Session Schedule
        </h2>

        <div className="space-y-4">
          {sortedSessions.map((session, idx) => {
            const status = getSessionStatus(session);
            const hw = getHomeworkForSession(session.date);
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  status === 'exam' ? 'bg-red-50 border-red-200' :
                  status === 'today' ? 'bg-indigo-50 border-indigo-200' :
                  status === 'completed' ? 'bg-gray-50 border-gray-200' :
                  'bg-white border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      status === 'exam' ? 'bg-red-100' :
                      status === 'today' ? 'bg-indigo-100' :
                      'bg-gray-100'
                    }`}>
                      {session.isExam ? (
                        <GraduationCap className={`w-5 h-5 ${
                          status === 'exam' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      ) : status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className={`w-5 h-5 ${status === 'today' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">Session {session.sessionNumber}</span>
                        {status === 'today' && (
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                        {session.isExam && (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            EXAM
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(session.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {session.contents && (
                        <p className="text-sm text-gray-500 mt-2">{session.contents}</p>
                      )}
                    </div>
                  </div>

                  {session.homework && (
                    <div className={`text-right p-3 rounded-lg ${
                      status === 'exam' ? 'bg-red-100' :
                      'bg-amber-50'
                    }`}>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Homework</p>
                      <p className="text-sm font-medium text-gray-700">{session.homework}</p>
                      {hw && (
                        <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                          hw.status === 'yes' ? 'bg-green-100 text-green-700' :
                          hw.status === 'late' ? 'bg-amber-100 text-amber-700' :
                          hw.status === 'no' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {hw.status === 'yes' ? 'Done' : hw.status === 'late' ? 'Late' : 'Pending'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedSessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No session schedule available</p>
          </div>
        )}
      </Card>
    </div>
  );
};
