export interface YTCacheItem {
  value: string;
  createdAt: number;
}

export interface YTCache {
  [key: string]: YTCacheItem | undefined;
}

const cache: YTCache = {};

export const getCacheItem = (
  k: string,
): string | undefined => cache[k]?.value;

export const setCachItem = (k: string, v: string): void => {
  cache[k] = {
    value: v,
    createdAt: Date.now(),
  };
};

export const getCache = () => cache;
