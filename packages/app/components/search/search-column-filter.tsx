import { Column } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

export default function SearchColumnFilter({
    column,
}: {
    column: Column<any, unknown>
}) {
    const columnFilterValue = column.getFilterValue()

    const sortedUniqueValues = useMemo(
        () =>
            Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
        [column.getFacetedUniqueValues()]
    )

    return (
        <>
            <datalist id={column.id + 'list'}>
                {sortedUniqueValues.map((value: any) => (
                    <option value={value} key={value} />
                ))}
            </datalist>
            <DebouncedInput
                type="text"
                value={(columnFilterValue ?? '') as string}
                onChange={value => column.setFilterValue(value)}
                placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
                className="w-36 border shadow rounded"
                list={column.id + 'list'}
            />
            <div className="h-1" />
        </>
    )
}

// A typical debounced input react component
function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return <input {...props} value={value} onChange={e => setValue(e.target.value)} />
}
