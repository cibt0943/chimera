import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { useMemoSettingsAtom } from '~/lib/global-state'

export interface MemoFormDialogProps {
  memo: Memo | undefined
  redirectUrl: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MemoFormDialog({
  memo,
  redirectUrl,
  isOpen,
  onOpenChange,
}: MemoFormDialogProps) {
  const { t } = useTranslation()
  const memoSettings = useMemoSettingsAtom()
  const autoSave = memoSettings?.autoSave || false

  //autosaveの場合はsubmitしても画面遷移しないので、redirectUrlは空文字
  const memoFormSubmitRedirectUrl = autoSave ? '' : redirectUrl

  const title = memo
    ? t('memo.message.memo_editing')
    : t('memo.message.memo_creation')
  const desc = t('memo.message.set_memo_info')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <MemoForm
          memo={memo}
          isAutoSave={autoSave}
          redirectUrl={memoFormSubmitRedirectUrl}
          textareaProps={{ className: 'h-[calc(100svh_-_360px)]' }}
        />
      </DialogContent>
    </Dialog>
  )
}
