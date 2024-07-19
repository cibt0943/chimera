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
import { cn } from '~/lib/utils'
import { Memo, MemoStatus } from '~/types/memos'

interface MemoActionsProps {
  memo: Memo
  handleMoveMemo: (memo: Memo, isUp: boolean) => void
  handleUpdateMemoStatus: (memo: Memo, status: MemoStatus) => void
  handleDeleteMemo: (memo: Memo) => void
}

export function MemoActions(props: MemoActionsProps) {
  const { memo, handleMoveMemo, handleUpdateMemoStatus, handleDeleteMemo } =
    props

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
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={(event) => {
              handleMoveMemo(memo, true)
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
            }}
          >
            <RiArrowUpLine className="mr-2 h-4 w-4" />
            {t('common.message.position_up')}
            <DropdownMenuShortcut>⌥ ↑</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              handleMoveMemo(memo, false)
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
            }}
          >
            <RiArrowDownLine className="mr-2 h-4 w-4" />
            {t('common.message.position_down')}
            <DropdownMenuShortcut>⌥ ↓</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              handleUpdateMemoStatus(memo, archiveMenu.toStatus)
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
            }}
          >
            {archiveMenu.icon}
            {archiveMenu.caption}
            <DropdownMenuShortcut>
              ⌥ <RiCornerDownLeftLine className="h-3 w-3 inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              navigate(`/memos/${memo.id}`)
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
            }}
          >
            <RiEdit2Line className="mr-2 h-4 w-4" />
            {t('common.message.edit')}
            <DropdownMenuShortcut>
              <RiCornerDownLeftLine className="h-3 w-3 inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              handleDeleteMemo(memo)
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
            }}
            className="text-red-600 focus:text-red-600"
          >
            <RiDeleteBinLine className="mr-2 h-4 w-4" />
            {t('common.message.delete')}
            <DropdownMenuShortcut>
              ⌥ <RiDeleteBack2Line className="h-3 w-3 inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
