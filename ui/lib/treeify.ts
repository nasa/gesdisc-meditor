export function treeify(
    list: Array<any>,
    idAttr: string = '_id',
    parentAttr: string = 'parentId',
    childrenAttr: string = 'children'
) {
    let treeList = []
    let lookup = {}

    if (!list || !list.length) return []

    list.forEach(function (obj) {
        lookup[obj[idAttr]] = obj
        obj[childrenAttr] = []
    })

    list.forEach(function (obj) {
        if (obj[parentAttr] != null && obj[parentAttr] != 'root') {
            lookup[obj[parentAttr]]?.[childrenAttr]?.push(obj)
        } else {
            treeList.push(obj)
        }
    })

    return treeList
}
