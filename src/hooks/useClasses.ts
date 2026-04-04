import { useSubscribe } from './useSubscribe';
import { Class } from '../types/models';

export function useClasses() {
  const { data, loading, error, mutate, setData, refresh } = useSubscribe<Class>({
    table: 'classes',
    orderBy: { column: 'name', ascending: true }
  });

  // Transform DB data to match frontend Class model
  const transformedData = data?.map(cls => ({
    id: cls.id,
    name: cls.name || '',
    center: cls.center || '',
    teacher: cls.teacher || '',
    totalSessions: cls.total_sessions || 0,
    startingLevel: cls.starting_level || '',
    startDate: cls.start_date || '',
    startTime: cls.start_time || '',
    endTime: cls.end_time || '',
    classDays: Array.isArray(cls.class_days) ? cls.class_days : [],
    targetOutcome: cls.target_outcome || 0,
    lessonPlan: Array.isArray(cls.lesson_plan) ? cls.lesson_plan : [],
    description: cls.description || '',
    subject: cls.subject || '',
    gradeLevel: cls.grade_level || '',
  })) || [];

  return { data: transformedData, loading, error, mutate, setData, refresh };
}