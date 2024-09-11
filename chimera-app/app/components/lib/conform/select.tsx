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
      <SelectContent
        ref={(ref) => {
          // radix-ui/react-selectの2.1.2で修正される予定
          // temporary workaround from https://github.com/shadcn-ui/ui/issues/1220
          ref?.addEventListener('touchend', (e) => e.preventDefault())
        }}
      >
        {children}
      </SelectContent>
    </Select>
  )
}
