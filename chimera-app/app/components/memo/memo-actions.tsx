import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  RxDotsHorizontal,
  RxArrowUp,
  RxArrowDown,
  RxPencil1,
  RxTrash,
} from 'react-icons/rx'
import { RiDeleteBack2Line, RiCornerDownLeftLine } from 'react-icons/ri'
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
import { Memo } from '~/types/memos'

interface MemoActionsProps {
  memo: Memo
  handleDeleteMemo: (memo: Memo) => void
}

export function MemoActions({ memo, handleDeleteMemo }: MemoActionsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const buttonClassName = cn(
    'flex h-6 w-6 p-0 data-[state=open]:bg-muted',
    'opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100',
    'data-[state=open]:opacity-100',
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={buttonClassName}>
          <RxDotsHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={() => {
              console.log('position up')
            }}
          >
            <RxArrowUp className="mr-2 h-4 w-4" />
            {t('common.message.position_up')}
            <DropdownMenuShortcut>⌘↑</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              console.log('position down')
            }}
          >
            <RxArrowDown className="mr-2 h-4 w-4" />
            {t('common.message.position_down')}
            <DropdownMenuShortcut>⌘↓</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigate(`/memos/${memo.id}`)
            }}
          >
            <RxPencil1 className="mr-2 h-4 w-4" />
            {t('common.message.edit')}
            <DropdownMenuShortcut>
              ⌘
              <RiCornerDownLeftLine className="h-3 w-3 inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event) => {
              handleDeleteMemo(memo)
              event.stopPropagation()
            }}
            className="text-red-600 focus:text-red-600"
          >
            <RxTrash className="mr-2 h-4 w-4" />
            {t('common.message.delete')}
            <DropdownMenuShortcut>
              ⌘<RiDeleteBack2Line className="h-3 w-3 inline" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
