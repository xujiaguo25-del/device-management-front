import { useEffect, useState, useCallback } from 'react';
import type { DictItem } from '../types';
import { getDictByType, refreshDictCache } from '../services/api/dict';

export const useDict = (typeCode: string) => {
  const [data, setData] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      // getDictByType will use the internal map cache for O(1) lookup
      const items = await getDictByType(typeCode);
      setData(items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dict');
    } finally {
      setLoading(false);
    }
  }, [typeCode]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshDictCache();
      const items = await getDictByType(typeCode);
      setData(items);
    } catch (e: any) {
      setError(e?.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, [typeCode]);

  return { data, loading, error, refresh } as const;
};
