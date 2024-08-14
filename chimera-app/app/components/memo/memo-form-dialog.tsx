import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { getFormProps } from '@conform-to/react'
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
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import { Memo } from '~/types/memos'
import { useMemoConform } from './memo-conform'
import { MemoActionButton } from './memo-action-button'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

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

  // メモ削除ダイアログの表示状態
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

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
        <MemoForm
          memo={memo}
          onSubmit={() => setIsOpen(false)}
          handleDeleteMemo={() => setIsOpenDeleteDialog(true)}
          returnUrl={returnUrl}
        />
        <MemoDeleteConfirmDialog
          memo={memo}
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
          onSubmit={() => {
            setIsOpenDeleteDialog(false)
            setIsOpen(false)
          }}
          returnUrl={returnUrl}
        />
      </DialogContent>
    </Dialog>
  )
}

interface MemoFormProps {
  memo: Memo | undefined
  onSubmit: () => void
  handleDeleteMemo: () => void
  returnUrl: string
}

function MemoForm({
  memo,
  onSubmit,
  handleDeleteMemo,
  returnUrl,
}: MemoFormProps) {
  const { t } = useTranslation()
  const { form, fields } = useMemoConform({ memo, onSubmit })
  const action = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL

  return (
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
        <TextareaConform
          meta={fields.content}
          key={fields.content.key}
          className="h-[calc(100vh_-_360px)] resize-none bg-[#303841] text-white focus-visible:ring-0"
        />
        <FormMessage message={fields.content.errors} />
      </FormItem>
      <FormItem>
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
      {/* 戻り先を切り替えるための値 */}
      <input type="hidden" name="returnUrl" value={returnUrl} />
      <FormFooter className="sm:justify-between">
        {memo ? (
          <MemoActionButton memo={memo} handleDeleteMemo={handleDeleteMemo} />
        ) : (
          <div>&nbsp;</div>
        )}
        <Button type="submit">{t('common.message.save')}</Button>
      </FormFooter>
    </Form>
  )
}
