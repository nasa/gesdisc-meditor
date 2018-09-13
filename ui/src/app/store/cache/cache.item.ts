export class CacheItem {
    
    value: any
    ttl: number
    expireTimeout: any
    expireCallback: any = () => {}

    constructor(value: any, ttl: number) {
        this.value = value
        this.ttl = ttl

        this.expireTimeout = setTimeout(() => this.expire(), this.ttl)

        return this
    }

    expire() {
        this.expireCallback()
    }

    onExpire(callback: any) {
        this.expireCallback = callback
        return this
    }

}
