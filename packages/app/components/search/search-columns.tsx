import { Document } from '@/documents/types'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DocumentStateBadge from '../document/document-state-badge'
import { format } from 'date-fns'
import { FormCheck } from 'react-bootstrap'

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
            header: 'Title',
            cell: ({ row }) => {
                return (
                    <Link
                        href={`/${encodeURIComponent(modelName)}/${encodeURIComponent(
                            row.getValue('title')
                        )}`}
                        legacyBehavior
                    >
                        <a data-test="search-result-link">{row.getValue('title')}</a>
                    </Link>
                )
            },
        },
        {
            accessorKey: 'x-meditor.state',
            header: 'State',
            cell: ({ row }) => {
                return (
                    <DocumentStateBadge
                        document={row.original}
                        modelName={modelName}
                    />
                )
            },
        },
        {
            id: 'modifiedOn',
            accessorKey: 'x-meditor.modifiedOn',
            header: 'Modified On',
            cell: ({ row }) => {
                return (
                    <>
                        {format(
                            new Date(row.getValue('modifiedOn')),
                            'M/d/yy, h:mm aaa'
                        )}
                    </>
                )
            },
        },
        {
            id: 'modifiedBy',
            accessorKey: 'x-meditor.modifiedBy',
            header: 'Modified By',
        },
    ]
}
