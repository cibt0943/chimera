import * as React from 'react'
import { LuClock9 } from 'react-icons/lu'
import { cn } from '~/lib/utils'
import { TimePickerInput } from './time-picker-input'

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  minuteStep?: number
}

export function TimePicker({
  date,
  setDate,
  minuteStep = 15,
}: TimePickerProps) {
  const hourRef = React.useRef<HTMLInputElement>(null)
  const minuteRef = React.useRef<HTMLInputElement>(null)

  return (
    <div
      className={cn(
        'flex items-center',
        'border-input focus-within:ring-ring gap-0.5 rounded-md border bg-transparent p-px focus-within:ring-1 focus-within:outline-hidden',
      )}
    >
      <div className="px-1">
        <LuClock9 className="text-muted-foreground" />
      </div>
      <div className="text-center">
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="text-center">:</div>
      <div className="text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          step={minuteStep}
        />
      </div>
    </div>
  )
}
