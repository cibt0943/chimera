import { ComponentProps } from 'react'
import { FieldMetadata, getInputProps } from '@conform-to/react'
import { Input } from '~/components/ui/input'

export interface InputConformProps extends ComponentProps<'input'> {
  meta: FieldMetadata<string>
  type: Parameters<typeof getInputProps>[1]['type']
}

export function InputConform({ meta, type, ...inputProps }: InputConformProps) {
  return (
    <Input
      {...getInputProps(meta, { type, ariaAttributes: true })}
      {...inputProps}
    />
  )
}
