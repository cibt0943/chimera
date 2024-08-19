import { ComponentProps } from 'react'
import { FieldMetadata, getTextareaProps } from '@conform-to/react'
import { Textarea } from '~/components/ui/textarea'

export interface TextareaConformProps extends ComponentProps<typeof Textarea> {
  meta: FieldMetadata<string>
}

export function TextareaConform({
  meta,
  ...textareaProps
}: TextareaConformProps) {
  const { key, ...otherProps } = textareaProps
  // keyは別にしないとワーニングが出た
  return <Textarea {...getTextareaProps(meta)} key={key} {...otherProps} />
}
