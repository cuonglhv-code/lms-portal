import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  BookOpen, 
  Building2, 
  Settings, 
  Trash2 
} from 'lucide-react';
import { format, parseISO, addDays, getDay } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { cn } from '../../../utils/cn';
import { Class, LessonSession } from '../../../types/models';

interface ClassesSectionProps {
  classes: Class[];
  onAdd: (data: Omit<Class, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Class>) => void;
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export const ClassesSection: React.FC<ClassesSectionProps> = ({ 
  classes, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onViewDetail 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCenter, setFilterCenter] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  
  const centers = useMemo(() => Array.from(new Set(classes.map(c => c.center))), [classes]);
  const teachers = useMemo(() => Array.from(new Set(classes.map(c => c.teacher))), [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      (filterCenter === '' || c.center === filterCenter) &&
      (filterTeacher === '' || c.teacher === filterTeacher)
    );
  }, [classes, filterCenter, filterTeacher]);

  const initialFormData: Omit<Class, 'id'> = {
    name: '',
    center: '',
    teacher: '',
    totalSessions: 20,
    sessionsPerWeek: 2,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    classDays: ['Monday'],
    startTime: '18:00',
    endTime: '20:00',
    lessonPlan: [],
    notes: '',
    targetOutcome: 0,
    startingLevel: '',
  };

  const [formData, setFormData] = useState<Omit<Class, 'id'>>(initialFormData);

  const generateLessonPlan = (count: number, startDateStr: string, days: string[]) => {
    const plan: LessonSession[] = [];
    if (days.length === 0) return plan;

    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const selectedDayNums = days.map(d => dayMap[d]).sort((a, b) => a - b);
    let currentDate = parseISO(startDateStr);
    
    for (let i = 1; i <= count; i++) {
      while (!selectedDayNums.includes(getDay(currentDate))) {
        currentDate = addDays(currentDate, 1);
      }

      const sessionDate = format(currentDate, 'yyyy-MM-dd');
      const deadlineDate = addDays(currentDate, 1);
      const deadlineStr = format(deadlineDate, "yyyy-MM-dd'T'HH:mm");

      plan.push({
        sessionNumber: i,
        date: sessionDate,
        contents: '',
        homework: '',
        deadline: deadlineStr,
        isExam: false
      });

      currentDate = addDays(currentDate, 1);
    }
    return plan;
  };

  useEffect(() => {
    if (!editingId && formData.totalSessions > 0 && formData.classDays.length > 0) {
      const newPlan = generateLessonPlan(formData.totalSessions, formData.startDate, formData.classDays);
      setFormData(prev => ({ ...prev, lessonPlan: newPlan }));
    }
  }, [formData.totalSessions, formData.startDate, formData.classDays, editingId]);

  const handleSubmit = () => {
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
    setFormData(initialFormData);
  };

  const handleEdit = (c: Class) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      center: c.center,
      teacher: c.teacher,
      totalSessions: c.totalSessions,
      sessionsPerWeek: c.sessionsPerWeek || 2,
      targetOutcome: c.targetOutcome,
      startDate: c.startDate,
      classDays: c.classDays || [],
      startTime: c.startTime || '18:00',
      endTime: c.endTime || '20:00',
      lessonPlan: c.lessonPlan || [],
      notes: c.notes || ''
    });
    setIsAdding(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      classDays: prev.classDays.includes(day)
        ? prev.classDays.filter(d => d !== day)
        : [...prev.classDays, day]
    }));
  };

  const updateSession = (index: number, field: keyof LessonSession, value: any) => {
    const newPlan = [...formData.lessonPlan];
    newPlan[index] = { ...newPlan[index], [field]: value };
    setFormData({ ...formData, lessonPlan: newPlan });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterCenter}
            onChange={e => setFilterCenter(e.target.value)}
          >
            <option value="">All Centers</option>
            {centers.map(center => (
              <option key={center} value={center}>{center}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterTeacher}
            onChange={e => setFilterTeacher(e.target.value)}
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
          <Button onClick={() => { setIsAdding(true); setEditingId(null); }}>
            <Plus className="w-5 h-5 mr-2" />
            New Class
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Class' : 'Add New Class'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Class Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Center</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.center}
                onChange={e => setFormData({ ...formData, center: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Teacher</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.teacher}
                onChange={e => setFormData({ ...formData, teacher: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Total Sessions</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.totalSessions}
                onChange={e => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Target Outcome</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.targetOutcome}
                onChange={e => setFormData({ ...formData, targetOutcome: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Sessions/Week</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.sessionsPerWeek}
                onChange={e => setFormData({ ...formData, sessionsPerWeek: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1 col-span-1 sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Class Days (Select on Calendar)</label>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                      formData.classDays.includes(day)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                    )}
                  >
                    <Calendar className={cn("w-5 h-5 mb-1", formData.classDays.includes(day) ? "text-indigo-600" : "text-gray-300")} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{day.substring(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-1 sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Notes</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Lesson Plan ({formData.lessonPlan.length} sessions)
              </h4>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto p-1">
              {formData.lessonPlan.map((session, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {session.sessionNumber}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">{session.date ? format(parseISO(session.date), 'dd/MM') : ''}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Contents</label>
                    <input
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="What will be taught?"
                      value={session.contents}
                      onChange={e => updateSession(idx, 'contents', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Homework</label>
                    <input
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Homework assignment"
                      value={session.homework}
                      onChange={e => updateSession(idx, 'homework', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Deadline (Optional)</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={session.deadline || ''}
                      onChange={e => updateSession(idx, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(c => (
          <Card key={c.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {c.center}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="p-1 h-8 w-8" onClick={() => handleEdit(c)}>
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="p-1 h-8 w-8 text-red-600" onClick={() => onDelete(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teacher:</span>
                <span className="font-medium">{c.teacher}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sessions:</span>
                <span className="font-medium">{c.totalSessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-medium text-indigo-600 font-bold">{c.targetOutcome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Schedule:</span>
                <span className="font-medium">{(c.classDays || []).join(', ')}, {c.startTime} - {c.endTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date:</span>
                <span className="font-medium">{format(parseISO(c.startDate), 'MMM d, yyyy')}</span>
              </div>
            </div>

            {c.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic">
                {c.notes}
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button className="flex-1" onClick={() => onViewDetail(c.id)}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
