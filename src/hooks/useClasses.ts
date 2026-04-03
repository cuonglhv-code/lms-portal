import { useSubscribe } from './useSubscribe';
import { Class } from '../types/models';

export function useClasses() {
  return useSubscribe<Class>({ table: 'classes', orderBy: { column: 'name', ascending: true } });
}
