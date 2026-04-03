import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, startOfToday } from 'date-fns';
import { motion } from 'motion/react';
import { Building2, Calendar, Users, Clock } from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { Class } from '../../../types/models';

interface ClassesSectionProps {
  classes: Class[];
}

export const ClassesSection: React.FC<ClassesSectionProps> = ({ classes }) => {
  const getNextSession = (classObj: Class) => {
    const upcoming = classObj.lessonPlan?.filter(sp => parseISO(sp.date) >= startOfToday());
    return upcoming?.sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Classes</h1>
        <p className="text-gray-500 text-sm mt-1">{classes.length} enrolled class{classes.length !== 1 ? 'es' : ''}</p>
      </div>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classObj, idx) => {
            const nextSession = getNextSession(classObj);
            return (
              <motion.div
                key={classObj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/student/classes/${classObj.id}`}>
                  <Card className="p-6 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {classObj.center}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{classObj.name}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{classObj.teacher || 'Assigned Teacher'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{classObj.classDays.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{classObj.startTime} - {classObj.endTime}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Sessions</span>
                        <span className="font-bold text-gray-900">{classObj.lessonPlan?.length || 0}</span>
                      </div>
                    </div>

                    {nextSession && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Next Session</p>
                        <p className="text-sm font-bold text-indigo-700">
                          {format(parseISO(nextSession.date), 'EEEE, MMM d')}
                        </p>
                        <p className="text-xs text-indigo-600">Session {nextSession.sessionNumber}</p>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Classes Yet</h3>
          <p className="text-gray-500">You haven't been enrolled in any classes. Contact your teacher.</p>
        </div>
      )}
    </div>
  );
};
