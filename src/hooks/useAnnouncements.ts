import { useSubscribe } from './useSubscribe';
import { Announcement } from '../types/models';

export function useAnnouncements() {
  return useSubscribe<Announcement>({ 
    table: 'messages', 
    filter: { column: 'message_type', value: 'announcement' },
    orderBy: { column: 'created_at', ascending: false } 
  });
}
