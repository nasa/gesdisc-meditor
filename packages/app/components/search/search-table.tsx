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
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'

import { SearchPagination } from './search-pagination'
import { useContext, useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { FaEye, FaFilter, FaTrash, FaWrench } from 'react-icons/fa'
import { MdAdd } from 'react-icons/md'
import { LuFileSpreadsheet, LuFileJson } from 'react-icons/lu'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import { Document } from '@/documents/types'
import { AppContext } from '../app-store'

interface SearchTableProps<TData, TValue> {
    modelName: string
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    globalFilter?: string
    onGlobalFilterChange?: () => {}
}

export function SearchTable<Document, TValue>({
    modelName,
    columns,
    data,
    globalFilter,
    onGlobalFilterChange,
}: SearchTableProps<Document, TValue>) {
    const { setSuccessNotification } = useContext(AppContext)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([
        {
            // default sorting
            desc: true,
            id: 'modifiedOn',
        },
    ])

    const table = useReactTable<Document>({
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

    const exportExcel = (rows: Row<Document>[]) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            filename: modelName,
            decimalSeparator: '.',
            useKeysAsHeaders: true,
        })

        const rowData = rows.map(row => {
            const originalEntries = Object.entries(row.original)
            const filteredEntries = originalEntries.filter(
                ([key, value]) => typeof value === 'string'
            )
            return Object.fromEntries(filteredEntries)
        })

        const csv = generateCsv(csvConfig)(rowData)
        download(csvConfig)(csv)

        setSuccessNotification(`Exported ${rows.length} rows to ${modelName}.csv`)
    }

    const exportJson = (rows: Row<Document>[]) => {
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(rows)
        )}`
        const el = document.createElement('a')
        el.setAttribute('href', dataStr)
        el.setAttribute('download', `${modelName}.json`)
        el.click()

        setSuccessNotification(`Exported ${rows.length} rows to ${modelName}.json`)
    }

    /*
    {header.column.getCanFilter() ? (
        <div>
            <SearchColumnFilter
                column={
                    header.column
                }
            />
        </div>
    ) : null}*/

    return (
        <div>
            <div className="bg-white relative shadow-md sm:rounded-lg overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-end space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <Button className="flex items-center justify-center">
                            <MdAdd className="mr-2" />
                            Add New
                        </Button>

                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="actions-dropdown"
                                className="flex items-center justify-center"
                            >
                                <FaWrench className="mr-2" />
                                Actions
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Header>Exports</Dropdown.Header>

                                <Dropdown.Item
                                    href="#/action-1"
                                    className="flex items-center"
                                    onClick={() =>
                                        exportExcel(table.getFilteredRowModel().rows)
                                    }
                                >
                                    <LuFileSpreadsheet className="mr-1" />
                                    CSV Export
                                </Dropdown.Item>

                                <Dropdown.Item
                                    href="#/action-1"
                                    className="flex items-center"
                                    onClick={() =>
                                        exportJson(table.getFilteredRowModel().rows)
                                    }
                                >
                                    <LuFileJson className="mr-1" />
                                    JSON Export
                                </Dropdown.Item>

                                <Dropdown.Divider />

                                <Dropdown.Header>Bulk Actions</Dropdown.Header>

                                <Dropdown.Item
                                    href="#/action-1"
                                    className="flex items-center"
                                    disabled
                                >
                                    <FaTrash className="mr-1" />
                                    Delete
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button
                            variant="light"
                            className="flex items-center justify-center"
                        >
                            <FaFilter className="mr-2" />
                            Filters
                        </Button>

                        <Button
                            variant="light"
                            className="flex items-center justify-center"
                        >
                            <FaEye className="mr-2" />
                            Columns
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-500">
                        <thead className="text-gray-700 uppercase bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        return (
                                            <th
                                                scope="col"
                                                className="px-4 py-3"
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
                                                                header.column
                                                                    .columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        </div>

                                                        {/* filter here */}
                                                    </>
                                                )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>

                        <tbody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        className="border-b hover:bg-slate-100"
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td className="px-4 py-3" key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b">
                                    <td
                                        className="px-4 py-3 h-24 text-center"
                                        colSpan={columns.length}
                                    >
                                        No documents found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <SearchPagination table={table} />
            </div>
        </div>
    )
}
