export const filterUnique = (value, index, arr) => {
    return arr.indexOf(value) === index
}

export const filterUndefined = value => {
    return typeof value !== 'undefined'
}
