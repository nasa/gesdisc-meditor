export type PaginatedSearchResults = {
    metadata: {
        pageCount: number
        pageNumber: number
        query: string
        resultsCount: number
        resultsPerPage: number
    }
    results: any[]
}
