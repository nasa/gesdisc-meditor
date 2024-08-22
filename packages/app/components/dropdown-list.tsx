import {
    Children,
    CSSProperties,
    forwardRef,
    PropsWithChildren,
    Ref,
    useState,
} from 'react'
import { FormControl } from 'react-bootstrap'

type Props = PropsWithChildren<{
    style?: CSSProperties
    className?: string
    labeledBy?: string
}>

const DropdownList = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
    const [value, setValue] = useState('')

    return (
        <div
            ref={ref}
            style={props.style}
            className={props.className}
            aria-labelledby={props.labeledBy}
        >
            <FormControl
                autoFocus
                className="mx-3 my-2 w-auto"
                placeholder="Type to filter..."
                onChange={e => setValue(e.target.value)}
                value={value}
            />
            <ul
                className="list-unstyled"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
                {Children.toArray(props.children).filter(
                    (child: any) =>
                        !value || child.props.children.toLowerCase().startsWith(value)
                )}
            </ul>
        </div>
    )
})

DropdownList.displayName = 'DropdownList'

export { DropdownList }
