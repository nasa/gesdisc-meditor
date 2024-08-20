import { Document } from '@/documents/types'
import { Column, ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import { format } from 'date-fns'
import { FormCheck } from 'react-bootstrap'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

export function getColumns(modelName: string): ColumnDef<Document>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <FormCheck
                    checked={Boolean(
                        table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                    )}
                    onChange={e =>
                        table.toggleAllPageRowsSelected(!!e.target.checked)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <FormCheck
                    checked={row.getIsSelected()}
                    onChange={e => row.toggleSelected(!!e.target.checked)}
                    aria-label="Select row"
                />
            ),
        },
        {
            accessorKey: 'title',
            header: ({ column }) => {
                return <SortableColumn name="Title" column={column} />
            },
            cell: ({ row }) => (
                <Link
                    href={`/${encodeURIComponent(modelName)}/${encodeURIComponent(
                        row.getValue('title')
                    )}`}
                    legacyBehavior
                >
                    <a data-test="search-result-link">{row.getValue('title')}</a>
                </Link>
            ),
        },
        {
            accessorKey: 'x-meditor.state',
            header: ({ column }) => {
                return <SortableColumn name="State" column={column} />
            },
            cell: ({ row }) => (
                <DocumentStateBadge document={row.original} modelName={modelName} />
            ),
        },
        {
            id: 'modifiedOn',
            accessorKey: 'x-meditor.modifiedOn',
            header: ({ column }) => {
                return <SortableColumn name="Modified On" column={column} />
            },
            cell: ({ row }) =>
                format(new Date(row.getValue('modifiedOn')), 'M/d/yy, h:mm aaa'),
        },
        {
            id: 'modifiedBy',
            accessorKey: 'x-meditor.modifiedBy',
            header: ({ column }) => {
                return <SortableColumn name="Modified By" column={column} />
            },
        },
    ]
}

type SortableColumnProps = {
    name: string
    column: Column<Document>
}

function SortableColumn(props: SortableColumnProps) {
    const sortDir = props.column.getIsSorted()

    return (
        <button
            onClick={() =>
                props.column.toggleSorting(props.column.getIsSorted() === 'asc')
            }
            className="flex items-center justify-center"
        >
            {sortDir ? <strong>{props.name}</strong> : props.name}
            {sortDir === 'asc' && <FaArrowUp className="ml-1" />}
            {sortDir === 'desc' && <FaArrowDown className="ml-1" />}
        </button>
    )
}
