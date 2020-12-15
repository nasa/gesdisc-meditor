export const urlEncode = (url) => {
    return encodeURIComponent(url).replace(/%2F/gi, '%252F')
}

export const urlDecode = (url) => {
    return decodeURIComponent(url).replace(/%2F/gi, '/')
}
