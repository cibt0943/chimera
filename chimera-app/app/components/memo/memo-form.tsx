import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Required } from '~/components/lib/required'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { FormItem, FormLabel, FormMessage } from '~/components/lib/form'
import { MemoRelatedDateTimePicker } from './memo-related-date-time-picker'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'

interface MemoFormProps {
  memo: Memo | undefined
}

export function MemoForm({ memo }: MemoFormProps) {
  const { t } = useTranslation()

  const action = memo ? `/memos/${memo.id}` : '/memos'

  const defaultValue = memo || {
    title: '',
    content: '',
    related_date: null,
  }

  const [form, fields] = useForm<MemoSchemaType>({
    id: `memo-form${memo ? `-${memo.id}` : ''}`,
    defaultValue: defaultValue,
    constraint: getZodConstraint(MemoSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: MemoSchema })
    },
  })

  return (
    <div className="m-4 p-8 bg-muted rounded-lg h-[calc(100vh_-_60px)] overflow-auto">
      <Form
        method="post"
        className="space-y-6"
        {...getFormProps(form)}
        action={action}
      >
        <FormItem>
          <FormLabel htmlFor={fields.title.id}>
            {t('memo.model.title')}
            <Required />
          </FormLabel>
          <Input
            {...getInputProps(fields.title, { type: 'text' })}
            key={fields.title.key}
          />
          <FormMessage message={fields.title.errors} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.content.id}>
            {t('memo.model.content')}
          </FormLabel>
          <Textarea
            {...getTextareaProps(fields.content)}
            key={fields.content.key}
            className="resize-none"
            rows={15}
          />
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <FormItem className="flex flex-col">
          <FormLabel htmlFor={fields.related_date.id}>
            {t('memo.model.related_date')}
          </FormLabel>
          <MemoRelatedDateTimePicker meta={fields.related_date} />
          <FormMessage message={fields.related_date.errors} />
        </FormItem>
        <Button type="submit">{t('common.message.save')}</Button>
      </Form>
    </div>
  )
}
