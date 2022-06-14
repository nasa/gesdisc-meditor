export interface SearchOptions {
    term: string
    filters: any
    sort: SortOptions
}

export interface SortOptions {
    direction: string
    property: string
    isDate: boolean
}
