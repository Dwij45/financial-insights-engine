import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key)
}

export const setCache = <T>(key: string, value: T, ttl?: number): void => {
  cache.set(key, value, ttl ?? 300)
}

export const deleteCache = (key: string): void => {
  cache.del(key)
}

export const deleteCacheByPattern = (pattern: string): void => {
  const keys = cache.keys()
  const matchingKeys = keys.filter(key => key.startsWith(pattern))
  matchingKeys.forEach(key => cache.del(key))
}

export default cache