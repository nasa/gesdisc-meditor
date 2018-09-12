import _ from 'lodash'
import { CacheItem } from './cache.item'

const _cache = new Map()

export class CacheService {

    exists(key: string) {
        return _cache.has(key)
    }

    get(key: string) {
        return _cache.get(key)                                                                                                                                      
    }

    add(key: string, value: any, ttl: number) {
        let item = new CacheItem(value, ttl)

        this.removeItemOnExpire(key, item)

        _cache.set(key, item)
    }

    remove(key: string) {
        _cache.delete(key)
    }

    removeItemOnExpire(key: string, item: CacheItem) {
        item.onExpire(() => this.remove(key))
    }

    generateKey(method: string, args: any[], keyPath?: string) {
        let key = method
    
        if (keyPath) {
            key += '-' + args.map(arg => _.get(arg, keyPath)).filter(arg => arg).join('-')
        }
        
        return key
    }

}
