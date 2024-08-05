import * as React from 'react'
import { RiTimeLine } from 'react-icons/ri'
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
        'gap-0.5 rounded-md border border-input bg-transparent p-px focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
      )}
    >
      <div className="px-1">
        <RiTimeLine className="h-4 w-4 text-muted-foreground" />
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
