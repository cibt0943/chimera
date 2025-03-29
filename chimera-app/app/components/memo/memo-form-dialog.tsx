import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { MEMO_URL } from '~/constants'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { useMemoSettingsAtom } from '~/lib/global-state'

export interface MemoFormDialogProps {
  memo: Memo | undefined
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  returnUrl?: string
}

export function MemoFormDialog({
  memo,
  isOpen,
  onOpenChange,
  returnUrl = MEMO_URL,
}: MemoFormDialogProps) {
  const { t } = useTranslation()
  const memoSettings = useMemoSettingsAtom()
  const autoSave = memoSettings?.autoSave || false

  //autosaveの場合はsubmitしても画面遷移しないので、returnUrlは空文字
  const memoFormSubmitReturnUrl = autoSave ? '' : returnUrl

  const title = memo
    ? t('memo.message.memo_editing')
    : t('memo.message.memo_creation')
  const desc = t('memo.message.set_memo_info')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <MemoForm
          memo={memo}
          isAutoSave={autoSave}
          onSubmit={() => onOpenChange(false)}
          returnUrl={memoFormSubmitReturnUrl}
          textareaProps={{ className: 'h-[calc(100svh_-_360px)]' }}
        />
      </DialogContent>
    </Dialog>
  )
}
