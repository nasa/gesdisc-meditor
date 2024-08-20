import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { SearchPagination } from './search-pagination'
import { useState } from 'react'
import SearchColumnFilter from './search-column-filter'

interface SearchTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    globalFilter?: string
    onGlobalFilterChange?: () => {}
}

export function SearchTable<TData, TValue>({
    columns,
    data,
    globalFilter,
    onGlobalFilterChange,
}: SearchTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([
        {
            // default sorting
            desc: true,
            id: 'modifiedOn',
        },
    ])

    const table = useReactTable({
        data, // each row of data (i.e. an array of documents)
        columns, // column definitions that describe how each column should function (sort, filter, etc.)
        getCoreRowModel: getCoreRowModel(),
        state: {
            // initial state of the table
            sorting,
            globalFilter,
            columnFilters,
        },

        debugTable: true,
        debugHeaders: true,
        debugColumns: true,

        // support for pagination (https://tanstack.com/table/v8/docs/guide/pagination)
        getPaginationRowModel: getPaginationRowModel(),

        // support for sorting (https://tanstack.com/table/v8/docs/guide/sorting)
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),

        // support for column search/filter (https://tanstack.com/table/v8/docs/guide/column-filtering)
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(), // client-side faceting
        getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
        getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter

        // support for global search/filter (https://tanstack.com/table/v8/docs/guide/global-filtering)
        onGlobalFilterChange: onGlobalFilterChange,
        globalFilterFn: 'includesString',
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div
                                                        {...{
                                                            className:
                                                                header.column.getCanSort()
                                                                    ? 'cursor-pointer select-none'
                                                                    : '',
                                                            onClick:
                                                                header.column.getToggleSortingHandler(),
                                                        }}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef
                                                                .header,
                                                            header.getContext()
                                                        )}
                                                    </div>

                                                    {header.column.getCanFilter() ? (
                                                        <div>
                                                            <SearchColumnFilter
                                                                column={header.column}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <SearchPagination table={table} />
            </div>
        </div>
    )
}
