import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table ref={ref} className={'w-full caption-bottom text-sm'} {...props} />
        </div>
    )
)
Table.displayName = 'Table'

const TableHeader = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={'[&_tr]:border-b'} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={'[&_tr:last-child]:border-0'} {...props} />
))
TableBody.displayName = 'TableBody'

const TableFooter = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0'}
        {...props}
    />
))
TableFooter.displayName = 'TableFooter'

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={
                'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
            }
            {...props}
        />
    )
)
TableRow.displayName = 'TableRow'

const TableHead = forwardRef<
    HTMLTableCellElement,
    ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={
            'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
        }
        {...props}
    />
))
TableHead.displayName = 'TableHead'

const TableCell = forwardRef<
    HTMLTableCellElement,
    TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={'p-4 align-middle [&:has([role=checkbox])]:pr-0'}
        {...props}
    />
))
TableCell.displayName = 'TableCell'

const TableCaption = forwardRef<
    HTMLTableCaptionElement,
    HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption ref={ref} className={'mt-4 text-sm text-muted-foreground'} {...props} />
))
TableCaption.displayName = 'TableCaption'

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
