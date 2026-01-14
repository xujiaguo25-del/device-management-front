import { useEffect, useState, useCallback, useMemo } from 'react';
import type { DictItem } from '../types';
import { fetchAllDict, getDictByType, refreshDictCache } from '../services/api/dict';

/**
 * useDicts: 複数の辞書データを一括取得するためのフック
 * - typeCodesの配列を受け取り、{ [typeCode]: DictItem[] }形式のマップを返します
 * - 読み込み状態、エラー状態、キャッシュを更新して再取得するrefresh()メソッドを提供します
 *
 * 注意点:
 * - インライン配列リテラルを許容するため、typeCodesから安定したキーを導出します
 *   これにより、配列の同一性変更による不要な再読み込みを防ぎます。
 */
export const useDicts = (typeCodes: string[]) => {
  const [map, setMap] = useState<Record<string, DictItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // typeCodesの内容から安定したキーを生成（インライン配列による再読み込みを防ぐ）
  const key = useMemo(() => typeCodes.join(','), [typeCodes.join(',')]);
  // typeCodesのコピーを作成（keyが変更された場合に更新されます）
  const codes = useMemo(() => [...typeCodes], [key]);

  // 辞書データを一括取得する関数
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 内部キャッシュを使用してすべての辞書を取得
      await fetchAllDict();
      const next: Record<string, DictItem[]> = {};
      // 指定された各typeCodeに対して辞書データを取得
      for (const tc of codes) {
        const items = await getDictByType(tc);
        next[tc] = items;
      }
      setMap(next);
    } catch (e: any) {
      setError(e?.message || '辞書の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [codes, key]);

  // コンポーネントのマウント時とkeyが変更された時に実行
  useEffect(() => {
    load();
    // グローバルな辞書更新イベントをリッスン
    const onUpdated = () => {
      load();
    };
    window.addEventListener('dicts-updated', onUpdated as EventListener);
    return () => window.removeEventListener('dicts-updated', onUpdated as EventListener);
  }, [load, key]);

  // 辞書データを手動で更新する関数
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshDictCache();
      await load();
    } catch (e: any) {
      setError(e?.message || '辞書の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [load]);

  // 辞書マップ、読み込み状態、エラー、更新関数を返します
  return { map, loading, error, refresh } as const;
};
