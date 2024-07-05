import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps, getTextareaProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { FormItem, FormMessage, FormDescription } from '~/components/lib/form'
import { MemoRelatedDateTimePicker } from './memo-related-date-time-picker'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'

interface MemoFormProps {
  memo: Memo | undefined
}

export function MemoForm({ memo }: MemoFormProps) {
  const { t } = useTranslation()

  const action = memo ? `/memos/${memo.id}` : '/memos'

  const defaultValue = {
    content: memo ? memo.title.concat('\n', memo.content) : '',
    related_date: memo ? memo.related_date : null,
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
    <div className="m-4">
      <Form
        method="post"
        className="space-y-6"
        {...getFormProps(form)}
        action={action}
      >
        <FormItem>
          <FormDescription>
            {t('memo.message.first_line_is_title')}
          </FormDescription>
          <Textarea
            {...getTextareaProps(fields.content)}
            key={fields.content.key}
            className="resize-none bg-[#303841] text-white focus-visible:ring-0  h-[calc(100vh_-_170px)]"
            rows={15}
          />
          <FormMessage message={fields.content.errors} />
        </FormItem>
        <div className="flex items-center justify-between">
          <FormItem>
            <MemoRelatedDateTimePicker
              meta={fields.related_date}
              divProps={{ className: 'w-64' }}
            />
            <FormMessage message={fields.related_date.errors} />
          </FormItem>
          <Button type="submit" className="w-32">
            {t('common.message.save')}
          </Button>
        </div>
      </Form>
    </div>
  )
}
