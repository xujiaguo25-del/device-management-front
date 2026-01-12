import type { DictItem, DictTypeGroup } from '../../types';
import { get } from './index';

// typeCode をキーにした dict グループのキャッシュ
const dictMapCache: { map?: Record<string, DictTypeGroup>; fetchedAt?: number } = {};

/**
 * API (/dict/items) からすべての辞書グループを取得し、内部のマップを作成します。
 * DictTypeGroup の配列を返します（typeCode + items[]）。
 *
 * バックエンドは `dictTypeCode` / `dictItems` のようなキーを返す場合があるため、
 * どちらの形状も内部の `DictTypeGroup` ({ typeCode, items }) に正規化します。
 */
export const fetchAllDict = async (): Promise<DictTypeGroup[]> => {
  if (dictMapCache.map) return Object.values(dictMapCache.map);
  // API のレスポンスの形状が内部の型と一致しない可能性があるため、unknown として扱い正規化します
  const res: any = await get('/dict/items');
  const rawGroups = Array.isArray(res.data) ? res.data : [];
  const map: Record<string, DictTypeGroup> = {};

  rawGroups.forEach((g: any) => {
    if (!g) return;
    // { typeCode, items } または { dictTypeCode, dictItems } のどちらも受け付けます
    const typeCode: string | undefined = g.typeCode ?? g.dictTypeCode;
    const rawItems: any[] = Array.isArray(g.items) ? g.items : Array.isArray(g.dictItems) ? g.dictItems : [];
    const items = rawItems.map((it: any) => ({
      dictId: it.dictId,
      dictItemName: it.dictItemName,
      sort: it.sort,
    }));

    if (typeCode) {
      map[typeCode] = { typeCode, items };
    }
  });

  dictMapCache.map = map;
  dictMapCache.fetchedAt = Date.now();
  return Object.values(map);
};

/**
 * 指定した typeCode の辞書アイテムを取得します。キャッシュされていない場合は全グループを取得します。
 * 内部マップを使用して typeCode による O(1) のルックアップを行います。
 */
export const getDictByType = async (typeCode: string): Promise<DictItem[]> => {
  if (!dictMapCache.map) {
    await fetchAllDict();
  }
  const g = dictMapCache.map ? dictMapCache.map[typeCode] : undefined;
  return g ? g.items : [];
};

/**
 * キャッシュされた辞書を強制的にリフレッシュします（マップをクリアして再取得します）
 */
export const refreshDictCache = async (): Promise<DictTypeGroup[]> => {
  dictMapCache.map = undefined;
  dictMapCache.fetchedAt = undefined;
  return fetchAllDict();
};
