import { useEffect, useState, useCallback, useMemo } from 'react';
import type { DictItem } from '../types';
import { fetchAllDict, getDictByType, refreshDictCache } from '../services/api/dict';

/**
 * useDicts: 批量取得用のフック
 * - accepts an array of typeCodes and returns a map { [typeCode]: DictItem[] }
 * - provides loading, error and refresh() which refreshes the cache and re-fetches
 *
 * Notes:
 * - This hook tolerates inline array literals by deriving a stable key from typeCodes
 *   so it won't retrigger load on every render due to array identity changes.
 */
export const useDicts = (typeCodes: string[]) => {
  const [map, setMap] = useState<Record<string, DictItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // stable key derived from the contents to avoid dependency churn when inline arrays are used
  const key = useMemo(() => typeCodes.join(','), [typeCodes.join(',')]);
  const codes = useMemo(() => [...typeCodes], [key]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // fetchAllDict will use internal cache when available
      await fetchAllDict();
      const next: Record<string, DictItem[]> = {};
      for (const tc of codes) {
        const items = await getDictByType(tc);
        next[tc] = items;
      }
      setMap(next);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dicts');
    } finally {
      setLoading(false);
    }
  }, [codes, key]);

  useEffect(() => {
    load();
    // also listen to global dicts-updated to reload
    const onUpdated = () => {
      load();
    };
    window.addEventListener('dicts-updated', onUpdated as EventListener);
    return () => window.removeEventListener('dicts-updated', onUpdated as EventListener);
  }, [load, key]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshDictCache();
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to refresh dicts');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { map, loading, error, refresh } as const;
};
