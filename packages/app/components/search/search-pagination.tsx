import { Table } from '@tanstack/react-table'
import { Pagination } from 'react-bootstrap'

const MAX_PAGES_VISIBLE = 5 // make sure this is an odd number!

interface SearchPaginationProps<Document> {
    table: Table<Document>
}

export function SearchPagination<Document>({
    table,
}: SearchPaginationProps<Document>) {
    const ALL_LABEL = 'All'

    function renderItems() {
        let midPoint = (MAX_PAGES_VISIBLE - 1) / 2
        let currentPage = table.getState().pagination.pageIndex
        let startingPage = currentPage - midPoint < 0 ? 0 : currentPage - midPoint
        let endingPage = startingPage + MAX_PAGES_VISIBLE - 1
        let lastPage = table.getPageCount() - 1

        if (endingPage > lastPage) {
            startingPage = lastPage - MAX_PAGES_VISIBLE + 1
            endingPage = lastPage
        }

        let items = []

        for (let i = startingPage; i <= endingPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i == currentPage}
                    onClick={() => table.setPageIndex(i)}
                >
                    {i + 1}
                </Pagination.Item>
            )
        }

        return items
    }

    return (
        <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
            aria-label="Table navigation"
        >
            <span className="text-sm font-normal text-gray-500">
                Showing
                <span className="mx-1 font-semibold text-gray-900">
                    {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}{' '}
                    -{' '}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                            table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}
                </span>
                of
                <span className="mx-1 font-semibold text-gray-900">
                    {table.getFilteredRowModel().rows.length}
                </span>
                documents
            </span>

            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows&nbsp;per&nbsp;page</p>

                <div className="mr-4">
                    <select
                        className="form-control"
                        value={`${table.getState().pagination.pageSize}`}
                        onChange={e =>
                            table.setPageSize(
                                e.target.value === ALL_LABEL
                                    ? 999999
                                    : Number(e.target.value)
                            )
                        }
                    >
                        {[50, 100, 500, ALL_LABEL].map(pageSize => (
                            <option key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>

                <Pagination>
                    <Pagination.First
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    />
                    <Pagination.Prev
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    />

                    {table.getState().pagination.pageIndex >
                        MAX_PAGES_VISIBLE - 1 && (
                        <Pagination.Ellipsis
                            onClick={() =>
                                table.setPageIndex(
                                    table.getState().pagination.pageIndex -
                                        MAX_PAGES_VISIBLE
                                )
                            }
                        />
                    )}

                    {renderItems()}

                    {table.getState().pagination.pageIndex <
                        MAX_PAGES_VISIBLE + 1 && (
                        <Pagination.Ellipsis
                            onClick={() =>
                                table.setPageIndex(
                                    table.getState().pagination.pageIndex +
                                        MAX_PAGES_VISIBLE
                                )
                            }
                        />
                    )}

                    <Pagination.Next
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    />
                    <Pagination.Last
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    />
                </Pagination>
            </div>
        </nav>
    )
}
