import compile from 'monquery'

export function searchWithMonquery(searchQuery: string) {
    let search = compile(searchQuery)
    switch (search.type) {
        case 'field':
            var obj = {}
            var val

            if (search.cmp) {
                var op = '$' + search.cmp
                val = {}
                val[op] = search.value
            } else {
                val = search.value
            }

            obj[search.name] = val
            return obj

        case 'op':
            var obj = {}
            var op = '$' + search.op

            obj[op] = [compile(search.left), compile(search.right)]

            return obj
    }
}

export default searchWithMonquery
