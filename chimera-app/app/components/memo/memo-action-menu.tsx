import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  RiMoreLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiDeleteBack2Line,
  RiCornerDownLeftLine,
  RiInboxArchiveLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '~/components/ui/dropdown-menu'
import { MEMO_URL } from '~/constants'
import { cn } from '~/lib/utils'
import { Memo, MemoStatus } from '~/types/memos'
import { useUserAgentAtom } from '~/lib/global-state'

interface MemoActionMenuProps {
  memo: Memo
  handleMoveMemo: (memo: Memo, isUp: boolean) => void
  handleUpdateMemoStatus: (memo: Memo) => void
  handleDeleteMemo: (memo: Memo) => void
}

export function MemoActionMenu(props: MemoActionMenuProps) {
  const { memo, handleMoveMemo, handleUpdateMemoStatus, handleDeleteMemo } =
    props

  const { userAgent } = useUserAgentAtom()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const buttonClassName = cn(
    'flex h-6 w-6 p-0 data-[state=open]:bg-muted',
    'opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100',
    'data-[state=open]:opacity-100',
  )

  const archiveMenu =
    memo.status === MemoStatus.NOMAL
      ? {
          toStatus: MemoStatus.ARCHIVED,
          icon: <RiInboxArchiveLine className="mr-2 h-4 w-4" />,
          caption: t('memo.message.to_archive'),
        }
      : {
          toStatus: MemoStatus.NOMAL,
          icon: <RiInboxUnarchiveLine className="mr-2 h-4 w-4" />,
          caption: t('memo.message.un_archive'),
        }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={buttonClassName}>
          <RiMoreLine className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              handleMoveMemo(memo, true)
            }}
          >
            <RiArrowUpLine className="mr-2 h-4 w-4" />
            {t('common.message.position_up')}
            <DropdownMenuShortcut>
              {userAgent.modifierKeyIcon + ' ↑'}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              handleMoveMemo(memo, false)
            }}
          >
            <RiArrowDownLine className="mr-2 h-4 w-4" />
            {t('common.message.position_down')}
            <DropdownMenuShortcut>
              {userAgent.modifierKeyIcon + ' ↓'}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              handleUpdateMemoStatus({ ...memo, status: archiveMenu.toStatus })
            }}
          >
            {archiveMenu.icon}
            {archiveMenu.caption}
            <DropdownMenuShortcut>
              {userAgent.modifierKeyIcon + ' '}
              <RiCornerDownLeftLine className="inline h-3 w-3" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              navigate([MEMO_URL, memo.id].join('/'))
            }}
          >
            <RiEdit2Line className="mr-2 h-4 w-4" />
            {t('common.message.edit')}
            <DropdownMenuShortcut>
              <RiCornerDownLeftLine className="inline h-3 w-3" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              handleDeleteMemo(memo)
            }}
            className="text-red-600 focus:text-red-600"
          >
            <RiDeleteBinLine className="mr-2 h-4 w-4" />
            {t('common.message.delete')}
            <DropdownMenuShortcut>
              {userAgent.modifierKeyIcon + ' '}
              <RiDeleteBack2Line className="inline h-3 w-3" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
