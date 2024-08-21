import { Row, Table } from '@tanstack/react-table'
import { Button } from 'react-bootstrap'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { Document } from '@/documents/types'

interface SearchPaginationProps<Document> {
    table: Table<Document>
}

export function SearchPagination<Document>({
    table,
}: SearchPaginationProps<Document>) {
    const ALL_LABEL = 'Show All (may be slow)'

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        filename: 'sample', // export file name (without .csv)
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    })

    const exportExcel = (rows: Row<Document>[]) => {
        const rowData = rows.map(row => {
            console.log(row.getAllCells())
            const originalEntries = Object.entries(row.original)
            const filteredEntries = originalEntries.filter(
                ([key, value]) => typeof value === 'string'
            )

            return Object.fromEntries(filteredEntries)
        })

        const csv = generateCsv(csvConfig)(rowData as any)
        download(csvConfig)(csv)
    }

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div>
                <Button onClick={() => exportExcel(table.getFilteredRowModel().rows)}>
                    Export to CSV
                </Button>
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>

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
