import { getCookie, setCookie } from 'cookies-next'
import { useState } from 'react'

export const useCookie = <V>(
    key: string,
    initialValue: V
): [V, (value: Function | any) => void] => {
    const [storedValue, setStoredValue] = useState(() => {
        const item = getCookie(key)
        return item ? JSON.parse(item.toString()) : initialValue
    })

    const setValue = value => {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        setCookie(key, JSON.stringify(valueToStore))
    }

    if (typeof document === 'undefined') {
        return [null, null]
    }

    return [storedValue, setValue]
}
