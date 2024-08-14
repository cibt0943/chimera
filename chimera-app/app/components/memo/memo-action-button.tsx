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

interface MemoActionButtonProps {
  memo: Memo | undefined
  handleDeleteMemo: (memo: Memo) => void
}

export function MemoActionButton({
  memo,
  handleDeleteMemo,
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
                handleDeleteMemo(memo)
              }}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
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
