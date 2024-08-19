import * as React from 'react'
import { useForm } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'

export interface useMemoConformProps {
  memo: Memo | undefined
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}

export function useMemoConform({ memo, onSubmit }: useMemoConformProps) {
  const formId = memo ? `memo-form-${memo.id}` : 'memo-form-new'
  const defaultValue = {
    content:
      memo && memo.title + memo.content !== ''
        ? memo.title.concat('\n', memo.content)
        : '',
    relatedDate: memo ? memo.relatedDate : null,
    relatedDateAllDay: memo ? memo.relatedDateAllDay : true,
  }

  const [form, fields] = useForm<MemoSchemaType>({
    id: formId,
    defaultValue: defaultValue,
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
    shouldRevalidate: 'onInput',
    onSubmit: onSubmit,
  })

  return { form, fields }
}
