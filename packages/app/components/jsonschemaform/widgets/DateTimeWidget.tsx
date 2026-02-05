import React from 'react'
import Flatpickr from 'react-flatpickr'
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import type { WidgetProps } from '@rjsf/utils'

function formatDate(date: string, dateFormatOption: any, useUtc: boolean = false) {
    let dateValue

    if (useUtc) {
        // Convert to UTC
        dateValue = zonedTimeToUtc(new Date(date), 'Etc/UTC').toISOString()
    } else {
        switch (dateFormatOption) {
            case 'Z':
                dateValue = zonedTimeToUtc(new Date(date), 'Etc/UTC').toISOString()
                break

            default:
                dateValue = format(new Date(date), 'yyyy-MM-dd HH:mm:ssxxx')

                break
        }
    }

    return dateValue
}

function DateTimeWidget(props: WidgetProps) {
    const {
        id,
        placeholder,
        required,
        disabled,
        readonly,
        autofocus,
        value,
        onChange,
        onBlur,
        options,
    } = props

    const dateFormatOption = options?.dateFormat || ''
    const useUtc = options?.useUtc || false

    return (
        <Flatpickr
            className="form-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus || false}
            defaultValue={value}
            onBlur={(event: any) => {
                // @rsjf (or maybe our onBlur function) does not correctly handle the blur event for this component.
                // Instead of onBlur, call onChange if there's a value.
                if (event.target.value) {
                    onChange(formatDate(event.target.value, dateFormatOption, useUtc))
                }
            }}
            onChange={(_selectedDates: any, date: string) => {
                onChange(formatDate(date, dateFormatOption, useUtc))
            }}
            options={{
                time_24hr: true,
                dateFormat: useUtc ? 'Y-m-d H:i:S (UTC)' : 'Y-m-d H:i:S',
                allowInput: true,
                enableTime: true,
                minuteIncrement: 1,
                enableSeconds: true,
            }}
        />
    )
}

export default DateTimeWidget
