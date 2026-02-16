import * as React from 'react'
import Compact from '@uiw/react-color-compact'
import { FieldMetadata, getInputProps } from '@conform-to/react'
import { LuX } from 'react-icons/lu'
import { Input } from '~/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '~/components/ui/popover'
import { cn } from '~/lib/utils'

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export function CompactColorPickerConform(props: {
  meta: FieldMetadata<string>
  disabled?: boolean
  allowClear?: boolean
  className?: string
}) {
  const { meta, disabled, allowClear, className } = props

  const inputProps = getInputProps(meta, { type: 'text', ariaAttributes: true })
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  const swatchColor = React.useMemo(() => {
    return isHexColor(value) ? value : '#ffffff'
  }, [value])

  React.useEffect(() => {
    const currentValue = inputRef.current?.value
    if (typeof currentValue === 'string' && isHexColor(currentValue)) {
      setValue(currentValue)
      return
    }

    const defaultValue =
      typeof inputProps.defaultValue === 'string' ? inputProps.defaultValue : ''
    if (isHexColor(defaultValue)) {
      setValue(defaultValue)
    } else {
      setValue('')
    }
  }, [inputProps.defaultValue])

  function setColor(nextValue: string) {
    if (!inputRef.current) return

    setValue(nextValue)

    inputRef.current.value = nextValue
    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
    inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function openPicker() {
    if (disabled) return
    setOpen(true)
    inputRef.current?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <div
            className={cn(
              'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 rounded border',
              disabled && 'opacity-50',
            )}
            style={{ backgroundColor: swatchColor }}
          />
          {allowClear && value && !disabled && (
            <button
              type="button"
              aria-label="Clear color"
              title="Clear"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpen(false)
                setColor('')
              }}
            >
              <LuX className="size-4" />
            </button>
          )}
          <Input
            {...inputProps}
            ref={inputRef}
            readOnly
            disabled={disabled}
            placeholder="#RRGGBB"
            className={cn(
              'cursor-pointer pl-10',
              allowClear && !disabled ? 'pr-10' : undefined,
              className,
            )}
            onClick={openPicker}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto" align="start">
        <Compact
          color={swatchColor}
          onChange={(color) => {
            setColor(color.hex)
            setOpen(false)
          }}
          className="box-content"
        />
      </PopoverContent>
    </Popover>
  )
}
