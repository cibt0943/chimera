import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  LuMoreHorizontal,
  LuArrowUpFromLine,
  LuArrowDownFromLine,
  LuArchive,
  LuArchiveRestore,
  LuPencilLine,
  LuTrash2,
  LuDelete,
  LuCornerDownLeft,
} from 'react-icons/lu'
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
import { cn, getModifierKeyInfo } from '~/lib/utils'
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

  const userAgent = useUserAgentAtom()
  const { modifierKeyIcon } = getModifierKeyInfo(userAgent.OS)
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
          icon: <LuArchive />,
          caption: t('memo.message.to_archive'),
        }
      : {
          toStatus: MemoStatus.NOMAL,
          icon: <LuArchiveRestore />,
          caption: t('memo.message.un_archive'),
        }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={buttonClassName}>
          <LuMoreHorizontal />
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
            <LuArrowUpFromLine />
            {t('common.message.position_up')}
            <DropdownMenuShortcut>
              {modifierKeyIcon + ' ↑'}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              handleMoveMemo(memo, false)
            }}
          >
            <LuArrowDownFromLine />
            {t('common.message.position_down')}
            <DropdownMenuShortcut>
              {modifierKeyIcon + ' ↓'}
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
              {modifierKeyIcon + ' '}
              <LuCornerDownLeft className="inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation() // アンカータグのクリックイベントをキャンセル
              navigate([MEMO_URL, memo.id].join('/'))
            }}
          >
            <LuPencilLine />
            {t('common.message.edit')}
            <DropdownMenuShortcut>
              <LuCornerDownLeft className="inline" />
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
            <LuTrash2 />
            {t('common.message.delete')}
            <DropdownMenuShortcut>
              {modifierKeyIcon + ' '}
              <LuDelete className="inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
