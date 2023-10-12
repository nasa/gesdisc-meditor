export type PaginatedSearchResults = {
    metadata: {
        /* total count of all pages */
        pageCount: number
        /* current page number */
        pageNumber: number
        /* the query as parsed by the search service */
        query: string
        /* total count of all results */
        resultsCount: number
        /* number of results per page */
        resultsPerPage: number
    }
    results: any[]
}
