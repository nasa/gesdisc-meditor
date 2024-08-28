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
    Table,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table'

import { SearchPagination } from './search-pagination'
import { useContext, useMemo, useState } from 'react'
import { Button, Dropdown, Form } from 'react-bootstrap'
import { FaEye, FaFilter, FaTrash, FaWrench } from 'react-icons/fa'
import { MdAdd } from 'react-icons/md'
import { LuFileSpreadsheet, LuFileJson } from 'react-icons/lu'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import { AppContext } from '../app-store'
import { ModelWithWorkflow } from '@/models/types'
import { flattenSchema } from '@/utils/jsonschema'
import { DropdownList } from '../dropdown-list'
import { xMeditorSchema } from '@/models/constants'
import { Document } from '@/documents/types'
import { useRouter } from 'next/router'
import { useCookie } from '@/lib/use-cookie.hook'

function findColumnByKey(table: Table<any>, key: string) {
    return (
        table
            .getAllColumns()
            // the schema key is dot-separated `.` whereas the TanStack table uses `_`
            // we'll convert to `_` to make sure we match correctly
            .find(c => c.id === key.replace(/\./g, '_'))
    )
}

interface SearchTableProps<TData, TValue> {
    model: ModelWithWorkflow
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    globalFilter?: string
    onGlobalFilterChange?: () => {}
}

export function SearchTable<Document, TValue>({
    model,
    columns,
    data,
    globalFilter,
    onGlobalFilterChange,
}: SearchTableProps<Document, TValue>) {
    const router = useRouter()
    const flattenedSchema = useMemo(() => {
        const schema = JSON.parse(model.schema)

        return flattenSchema({
            ...schema,
            properties: {
                ...xMeditorSchema, // add x-meditor fields
                ...schema.properties,
            },
        })
    }, [model.schema])

    const { setSuccessNotification } = useContext(AppContext)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([
        {
            // default sorting
            desc: true,
            id: 'modifiedOn',
        },
    ])

    const [includeColumns, setIncludeColumns] = useCookie<{
        [key: string]: string[]
    }>('includeColumns', {})

    const table = useReactTable<Document>({
        data, // each row of data (i.e. an array of documents)
        columns, // column definitions that describe how each column should function (sort, filter, etc.)
        getCoreRowModel: getCoreRowModel(),
        state: {
            // initial state of the table
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility,
        },

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

        // support for toggling visibility of columns
        onColumnVisibilityChange: setColumnVisibility,

        // support for global search/filter (https://tanstack.com/table/v8/docs/guide/global-filtering)
        onGlobalFilterChange: onGlobalFilterChange,
        globalFilterFn: 'includesString',
    })

    const exportExcel = (rows: Row<Document>[]) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            filename: model.name,
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

        setSuccessNotification(`Exported ${rows.length} rows to ${model.name}.csv`)
    }

    const exportJson = (rows: Row<Document>[]) => {
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(rows)
        )}`
        const el = document.createElement('a')
        el.setAttribute('href', dataStr)
        el.setAttribute('download', `${model.name}.json`)
        el.click()

        setSuccessNotification(`Exported ${rows.length} rows to ${model.name}.json`)
    }

    const toggleVisibleColumn = async (key: string, visible: boolean) => {
        const column = findColumnByKey(table, key)

        if (!column) {
            // we don't have this column yet, add it to local storage, refresh the page
            setIncludeColumns({
                ...includeColumns,
                [model.name]: includeColumns[model.name]
                    ? [...includeColumns[model.name], key]
                    : [key],
            })

            router.reload()
        }

        column?.toggleVisibility(visible)
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
                                    className="flex items-center"
                                    onClick={() =>
                                        exportExcel(table.getFilteredRowModel().rows)
                                    }
                                >
                                    <LuFileSpreadsheet className="mr-1" />
                                    CSV Export
                                </Dropdown.Item>

                                <Dropdown.Item
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

                                <Dropdown.Item className="flex items-center" disabled>
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

                        <Dropdown
                            onToggle={setShowColumnsDropdown}
                            show={showColumnsDropdown}
                        >
                            <Dropdown.Toggle
                                variant="light"
                                id="actions-dropdown"
                                className="flex items-center justify-center"
                            >
                                <FaEye className="mr-2" />
                                Columns
                            </Dropdown.Toggle>

                            <Dropdown.Menu
                                as={DropdownList}
                                style={{ maxWidth: '300px' }}
                            >
                                <Dropdown.Header>
                                    Select visible columns
                                </Dropdown.Header>

                                {flattenedSchema.map(item => {
                                    return (
                                        <Form.Check
                                            key={item.key}
                                            type="checkbox"
                                            label={item.key}
                                            className="py-1 px-4 ml-3"
                                            checked={
                                                findColumnByKey(
                                                    table,
                                                    item.key
                                                )?.getIsVisible() ?? false
                                            }
                                            onChange={e =>
                                                toggleVisibleColumn(
                                                    item.key,
                                                    !!e.target.checked
                                                )
                                            }
                                        />
                                    )
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
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
