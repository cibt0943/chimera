import * as React from 'react'
import { ComponentProps } from 'react'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { Checkbox } from '~/components/ui/checkbox'

export interface CheckboxConformProps extends ComponentProps<typeof Checkbox> {
  meta: FieldMetadata<string | boolean | undefined>
  onCheckedChange?: (checked: boolean) => void
}

export function CheckboxConform({
  meta,
  onCheckedChange,
  ...checkboxProps
}: CheckboxConformProps) {
  const control = useInputControl(meta)
  const checked = meta.value === 'on'

  const handleCheckedChange = React.useCallback(
    (checked: boolean | 'indeterminate') => {
      control.change(checked ? 'on' : '')
      onCheckedChange && onCheckedChange(!!checked)
    },
    [control, onCheckedChange],
  )

  return (
    <Checkbox
      id={meta.id}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      onBlur={control.blur}
      name={meta.id}
      {...checkboxProps}
    />
  )
}
