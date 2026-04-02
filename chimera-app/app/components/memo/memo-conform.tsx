import { useForm } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'

export interface useMemoConformProps {
  memo: Memo | undefined
}

export function useMemoConform({ memo }: useMemoConformProps) {
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
  })

  return { form, fields }
}
