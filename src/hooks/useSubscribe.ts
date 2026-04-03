import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseSubscribeOptions {
  table: string;
  filter?: { column: string; value: string; operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'contains' };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export function useSubscribe<T extends object = Record<string, unknown>>(
  options: UseSubscribeOptions
) {
  const { table, filter, orderBy, limit, event = '*' } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      let query = supabase.from(table).select('*');

      if (filter) {
        const op = filter.operator || 'eq';
        if (op === 'in' && Array.isArray(filter.value)) {
          query = query.in(filter.column, filter.value as string[]);
        } else if (op === 'contains') {
          query = query.contains(filter.column, filter.value);
        } else if (op === 'like' || op === 'ilike') {
          query = (query as any)[op](filter.column, `%${filter.value}%`);
        } else {
          query = query.filter(filter.column, op, filter.value);
        }
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData((result || []) as T[]);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [table, filter?.column, filter?.value, filter?.operator, orderBy?.column, orderBy?.ascending, limit]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtime = () => {
      const channelName = `${table}-changes-${Date.now()}`;
      
      let filterString: string | undefined;
      if (filter) {
        const op = filter.operator || 'eq';
        if (op === 'in') {
          filterString = `${filter.column}=in.(${Array.isArray(filter.value) ? filter.value.join(',') : filter.value})`;
        } else {
          filterString = `${filter.column}=${op === 'like' || op === 'ilike' ? 'ilike' : op}.${filter.value}`;
        }
      }

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            filter: filterString,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as T, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item) =>
                  (item as { id: string }).id === payload.new.id ? payload.new as T : item
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item) => (item as { id: string }).id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    fetchData();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter?.column, filter?.value, filter?.operator, event]);

  const mutate = useCallback((newData: T[] | ((prev: T[]) => T[])) => {
    setData((prev) => (typeof newData === 'function' ? newData(prev) : newData));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, mutate, setData, refresh };
}
