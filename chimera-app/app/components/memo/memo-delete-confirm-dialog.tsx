import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { MEMO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { Memo } from '~/types/memos'

export interface MemoDeleteConfirmDialogProps {
  memo: Memo | undefined
  redirectUrl: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function MemoDeleteConfirmDialog({
  memo,
  redirectUrl,
  isOpen,
  onOpenChange,
  children,
}: MemoDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  if (!memo) return null

  const action = `${MEMO_URL}/${memo.id}/delete`
  const desc =
    '「' +
    (memo.title || t('memo.message.un_titled')) +
    '」' +
    t('common.message.confirm_deletion')

  return (
    <ConfirmDialog
      title={t('memo.message.memo_deletion')}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <AlertDialogAction
        variant="destructive"
        onClick={async () => {
          await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
          fetcher.submit({ redirectUrl }, { method: 'delete', action })
        }}
      >
        {t('common.message.delete')}
      </AlertDialogAction>
    </ConfirmDialog>
  )
}
