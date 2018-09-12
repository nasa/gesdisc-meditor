import { CacheService } from './cache.service'

const DEFAULT_CACHE_TIMEOUT_MILLIS = 5000;
const cacheService = new CacheService()

export function Cache(cacheKeyPath?: string, ttlMillis?: number) {
    return function(target: any, name: string, descriptor: any) {
        const method = descriptor.value // copy the decorated method so we can wrap it
 
        descriptor.value = function (...args: any[]) {
            const cacheKey = cacheService.generateKey(name, args, cacheKeyPath);    // generate the cache key
            const cachedValue = cacheService.get(cacheKey);                         // retrieve from cache, if it exists

            // if requested method result is in the cache, return it instead of executing the method
            if (typeof cachedValue !== 'undefined') {
                return cachedValue;
            }

            const result = method.apply(this, args);    // not in the cache, so call the original (decorated) method

            cacheService.add(cacheKey, result, ttlMillis || DEFAULT_CACHE_TIMEOUT_MILLIS);

            return result;
        }
    }
}
