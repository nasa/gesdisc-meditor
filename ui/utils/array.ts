/** filter / map callback function */
export function onlyUnique<T>(element: T, index: number, array: T[]) {
    return array.indexOf(element) === index
}

/** filter / map callback function */
export function onlyTruthy<T>(element: T, _index: number, _array: T[]) {
    return !!element
}
