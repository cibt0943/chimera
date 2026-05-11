import { ComponentProps } from 'react'
import { FieldMetadata, getTextareaProps } from '@conform-to/react'
import { Textarea } from '~/components/ui/textarea'

export interface TextareaConformProps extends ComponentProps<typeof Textarea> {
  meta: FieldMetadata<string>
}

export function TextareaConform({ meta, key, ...props }: TextareaConformProps) {
  const { key: _, ...conformProps } = getTextareaProps(meta)

  return <Textarea key={key} {...conformProps} {...props} />
}
