import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { MEMO_URL } from '~/constants'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { Memo, MemoSchema, MemoSchemaType } from '~/types/memos'
import { MemoActionButton } from './memo-action-button'

export interface MemoFormDialogProps {
  memo: Memo | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  returnUrl?: string
}

export function MemoFormDialog({
  memo,
  isOpen,
  setIsOpen,
  returnUrl = MEMO_URL,
}: MemoFormDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher({ key: 'memo-form' })

  const action = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL
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
    onSubmit: () => setIsOpen(false),
  })

  const title = memo
    ? t('memo.message.memo_editing')
    : t('memo.message.memo_creation')
  const description = t('memo.message.set_memo_info')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          className="space-y-8"
          {...getFormProps(form)}
          action={action}
        >
          <FormItem>
            <FormLabel htmlFor={fields.content.id}>
              {t('memo.model.content')}
            </FormLabel>
            <FormDescription>
              {t('memo.message.first_line_is_title')}
            </FormDescription>
            <TextareaConform
              meta={fields.content}
              key={fields.content.key}
              className="h-[calc(100vh_-_450px)] resize-none bg-[#303841] text-white focus-visible:ring-0"
            />
            <FormMessage message={fields.content.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.relatedDate.id}>
              {t('memo.model.related_date')}
            </FormLabel>
            <DateTimePickerConform
              dateMeta={fields.relatedDate}
              allDayMeta={fields.relatedDateAllDay}
              defaultAllDay={true}
              includeAllDayComponent={true}
              placeholder={t('memo.model.related_date')}
              className="w-52"
            />
            <FormMessage message={fields.relatedDate.errors} />
          </FormItem>
          <FormFooter className="sm:justify-between">
            <MemoActionButton memo={memo} returnUrl={returnUrl} />
            <Button type="submit">{t('common.message.save')}</Button>
          </FormFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
