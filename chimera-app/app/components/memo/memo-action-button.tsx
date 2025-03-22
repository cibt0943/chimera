import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuTrash2, LuArchive, LuArchiveRestore } from 'react-icons/lu'
import { toast } from 'sonner'
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
  deleteReturnUrl?: string
}

export function MemoActionButton({
  memo,
  deleteReturnUrl = MEMO_URL,
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
                fetcher
                  .submit(
                    { status: archiveMenu.toStatus },
                    {
                      action: `${API_URL}${MEMO_URL}/${memo.id}`,
                      method: 'post',
                      encType: 'application/json',
                    },
                  )
                  .then(() => {
                    const msg =
                      archiveMenu.toStatus === MemoStatus.NOMAL
                        ? 'memo.message.un_archived'
                        : 'memo.message.archived'
                    toast.info(t(msg))
                  })
              }}
            >
              {archiveMenu.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{archiveMenu.caption}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <MemoDeleteConfirmDialog memo={memo} returnUrl={deleteReturnUrl}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <LuTrash2 />
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
        icon: <LuArchive />,
        caption: t('memo.message.to_archive'),
      }
    : {
        toStatus: MemoStatus.NOMAL,
        icon: <LuArchiveRestore />,
        caption: t('memo.message.un_archive'),
      }
}
