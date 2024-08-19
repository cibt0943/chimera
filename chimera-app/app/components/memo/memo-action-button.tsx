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
import { API_URL, MEMO_URL } from '~/constants'
import { Memo, MemoStatus } from '~/types/memos'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

interface MemoActionButtonProps {
  memo: Memo | undefined
  onDeleteSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
}

export function MemoActionButton({
  memo,
  onDeleteSubmit,
  returnUrl = MEMO_URL,
}: MemoActionButtonProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  if (!memo) return null

  const archiveMenu = ArchiveMenu(memo.status)

  return (
    <div className="mt-2 space-x-4 sm:mt-0">
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
                    action: [API_URL, MEMO_URL, '/' + memo.id].join(''),
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
          <MemoDeleteConfirmDialog
            memo={memo}
            onSubmit={onDeleteSubmit}
            returnUrl={returnUrl}
          >
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <RiDeleteBinLine className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </MemoDeleteConfirmDialog>
          <TooltipContent>{t('common.message.delete')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ArchiveMenu(status: MemoStatus) {
  const { t } = useTranslation()

  return status === MemoStatus.NOMAL
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
}
