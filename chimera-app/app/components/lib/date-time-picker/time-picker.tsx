import * as React from 'react'
import { LuClock9 } from 'react-icons/lu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '~/components/ui/input-group'

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  minuteStep?: number
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  return (
    <InputGroup>
      <InputGroupInput
        type="time"
        step="900"
        defaultValue={date?.toTimeString().substring(0, 5)}
        onChange={(e) => {
          if (e.target.value) {
            const [hours, minutes] = e.target.value.split(':').map(Number)
            const newDate = date ? new Date(date) : new Date()
            newDate.setHours(hours, minutes, 0, 0)
            setDate(newDate)
          } else {
            setDate(undefined)
          }
        }}
        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
      <InputGroupAddon>
        <LuClock9 className="text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}
