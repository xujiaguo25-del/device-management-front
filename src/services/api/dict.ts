import type { DictItem, DictTypeGroup, DictSuccessResponse } from '../../types';
import { get } from './index';

// Cache for dict groups keyed by typeCode
const dictMapCache: { map?: Record<string, DictTypeGroup>; fetchedAt?: number } = {};

/**
 * Fetch all dict type groups from the API (/dict/items) and populate the internal map
 * Returns the array of DictTypeGroup (typeCode + items[])
 */
export const fetchAllDict = async (): Promise<DictTypeGroup[]> => {
  if (dictMapCache.map) return Object.values(dictMapCache.map);
  const res: DictSuccessResponse = await get('/dict/items');
  const groups = Array.isArray(res.data) ? res.data : [];
  const map: Record<string, DictTypeGroup> = {};
  groups.forEach((g) => {
    if (g && g.typeCode) map[g.typeCode] = g;
  });
  dictMapCache.map = map;
  dictMapCache.fetchedAt = Date.now();
  return groups;
};

/**
 * Get dict items by a given typeCode. Will fetch all groups if not cached.
 * Uses the internal map for O(1) lookup by typeCode.
 */
export const getDictByType = async (typeCode: string): Promise<DictItem[]> => {
  if (!dictMapCache.map) {
    await fetchAllDict();
  }
  const g = dictMapCache.map ? dictMapCache.map[typeCode] : undefined;
  return g ? g.items : [];
};

/**
 * Force refresh the cached dicts (clears map and re-fetches)
 */
export const refreshDictCache = async (): Promise<DictTypeGroup[]> => {
  dictMapCache.map = undefined;
  dictMapCache.fetchedAt = undefined;
  return fetchAllDict();
};
