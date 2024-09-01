import * as React from 'react'
import { useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { sleep } from '~/lib/utils'
import { Memo } from '~/types/memos'
import { MemoForm } from './memo-form'
import { MemoActionButton } from './memo-action-button'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

export interface MemoFormDialogProps {
  memo: Memo | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  returnUrl: string
}

export function MemoFormDialog({
  memo,
  isOpen,
  setIsOpen,
  returnUrl,
}: MemoFormDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const memoFormFetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)
  const autoSave = memoSettings?.autoSave || false

  const memoFormSubmitReturnUrl = autoSave ? '' : returnUrl

  const title = memo
    ? t('memo.message.memo_editing')
    : t('memo.message.memo_creation')
  const desc = t('memo.message.set_memo_info')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        setIsOpen(open)
        if (open) return
        await sleep(200) // ダイアログが閉じるアニメーションが終わるまで待機
        navigate(returnUrl)
      }}
    >
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <MemoForm
          memo={memo}
          fetcher={memoFormFetcher}
          isAutoSave={autoSave}
          onSubmit={() => !autoSave && setIsOpen(false)}
          returnUrl={memoFormSubmitReturnUrl}
          textareaProps={{ className: 'h-[calc(100dvh_-_360px)]' }}
        >
          {memo && (
            <MemoActionButton
              memo={memo}
              onDeleteSubmit={(event) => {
                event.stopPropagation()
                setIsOpen(false)
              }}
              deleteReturnUrl={returnUrl}
            />
          )}
        </MemoForm>
      </DialogContent>
    </Dialog>
  )
}
