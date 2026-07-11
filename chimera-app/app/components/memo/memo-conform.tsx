import { useForm } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'

export interface useMemoConformProps {
  memo: Memo | undefined
}

export function useMemoConform({ memo }: useMemoConformProps) {
  const formId = memo ? `memo-form-${memo.id}` : 'memo-form-new'

  const [form, fields] = useForm<MemoSchemaType>({
    id: formId,
    defaultValue: memo ?? {
      title: '',
      content: '',
      relatedDate: null,
      relatedDateAllDay: true,
    },
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
    shouldRevalidate: 'onInput',
  })

  return { form, fields }
}
