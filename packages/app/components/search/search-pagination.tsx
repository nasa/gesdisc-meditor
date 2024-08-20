import { Table } from '@tanstack/react-table'
import { Button } from 'react-bootstrap'

interface SearchPaginationProps<TData> {
    table: Table<TData>
}

export function SearchPagination<TData>({ table }: SearchPaginationProps<TData>) {
    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>

                    <select
                        className="form-control"
                        value={`${table.getState().pagination.pageSize}`}
                        onChange={value => table.setPageSize(Number(value))}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <span>&lt;&lt;</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <span>&lt;</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <span>&gt;</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <span>&gt;&gt;</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
