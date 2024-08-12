import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  RiDeleteBinLine,
  RiInboxArchiveLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { MEMO_URL } from '~/constants'
import { Memo, MemoStatus } from '~/types/memos'
import { MemoDeleteConfirmDialog } from '~/components/memo/memo-delete-confirm-dialog'

interface MemoActionButtonProps {
  memo: Memo | undefined
  returnUrl?: string
}

export function MemoActionButton({
  memo,
  returnUrl = MEMO_URL,
}: MemoActionButtonProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  if (!memo) return null

  const archiveMenu =
    memo.status === MemoStatus.NOMAL
      ? {
          toStatus: MemoStatus.ARCHIVED,
          icon: <RiInboxArchiveLine className="h-4 w-4" />,
          caption: t('memo.message.to_archive'),
        }
      : {
          toStatus: MemoStatus.NOMAL,
          icon: <RiInboxUnarchiveLine className="h-4 w-4" />,
          caption: t('memo.message.un_archive'),
        }

  return (
    <div className="space-x-4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                event.preventDefault()
                fetcher.submit(
                  { status: archiveMenu.toStatus },
                  {
                    action: [MEMO_URL, memo.id, 'status'].join('/'),
                    method: 'post',
                  },
                )
              }}
            >
              {archiveMenu.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{archiveMenu.caption}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                event.preventDefault()
                setIsOpenDeleteDialog(true)
              }}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('common.message.delete')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <MemoDeleteConfirmDialog
        memo={memo}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
        onSubmit={(event) => {
          event.stopPropagation()
          setIsOpenDeleteDialog(false)
        }}
        returnUrl={returnUrl}
      />
    </div>
  )
}
