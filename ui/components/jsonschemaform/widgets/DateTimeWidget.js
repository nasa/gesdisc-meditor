import React from 'react'
import Flatpickr from 'react-flatpickr'
import { format } from 'date-fns'

function DateTimeWidget(props) {
    const { id, placeholder, required, disabled, readonly, autofocus, value, onChange, onBlur } = props

    return (
        <Flatpickr 
            className="form-control"
            id={id}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus || false}
            defaultValue={value}
            onBlur={() => {
                onBlur(id, value)
            }}
            onChange={(_selectedDates, date) => {
                let dateValue = format(new Date(date), 'yyyy-MM-dd HH:mm:ssxxx')
                onChange(dateValue)
                
            }}
            options={{
                time_24hr: true,
                dateFormat: 'Y-m-d H:i:S',
                allowInput: true,
                enableTime: true,
                minuteIncrement: 1,
                enableSeconds: true,
            }}
        />
    )
}

export default DateTimeWidget
