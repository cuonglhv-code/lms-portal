import { useSubscribe } from './useSubscribe';
import { Homework } from '../types/models';

export function useHomework() {
  return useSubscribe<Homework>({ table: 'homework' });
}
