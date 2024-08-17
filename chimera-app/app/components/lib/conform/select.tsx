import { ComponentProps } from 'react'
import { FieldMetadata, getSelectProps } from '@conform-to/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '~/components/ui/select'

export interface SelectConformProps<T> extends ComponentProps<typeof Select> {
  meta: FieldMetadata<T>
  placeholder: string
}

export function SelectConform<T>({
  meta,
  placeholder,
  children,
  ...selectProps
}: SelectConformProps<T>) {
  return (
    <Select
      {...getSelectProps(meta)}
      defaultValue={(meta.initialValue as string) || ''}
      {...selectProps}
    >
      <SelectTrigger id={meta.id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
