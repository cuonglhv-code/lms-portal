import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export interface UseSubscribeOptions {
  table: string;
  filter?: { column: string; value: string; operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'contains' };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useSubscribe<T extends object = Record<string, unknown>>(
  options: UseSubscribeOptions
) {
  const { table, filter, orderBy, limit } = options;
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
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T[] | ((prev: T[]) => T[])) => {
    setData((prev) => (typeof newData === 'function' ? newData(prev) : newData));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, mutate, setData, refresh };
}
