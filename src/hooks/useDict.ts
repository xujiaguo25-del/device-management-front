import { useEffect, useState, useCallback } from 'react';
import type { DictItem } from '../types';
import { getDictByType } from '../services/api/dict';

export const useDict = (typeCode: string) => {
  const [data, setData] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // getDictByType は内部のマップを使用して、typeCode の O(1) ルックアップを行います
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

  return { data, loading, error } as const;
};
