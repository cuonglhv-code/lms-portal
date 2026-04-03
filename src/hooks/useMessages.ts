import { useSubscribe } from './useSubscribe';
import { Message } from '../types/models';

export function useMessages() {
  return useSubscribe<Message>({ table: 'messages', orderBy: { column: 'created_at', ascending: false } });
}
