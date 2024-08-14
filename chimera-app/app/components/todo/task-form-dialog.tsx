import * as React from 'react'
import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { TODO_URL } from '~/constants'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'
import { sleep } from '~/lib/utils'

export interface TaskFormDialogProps {
  task: Task | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  returnUrl?: string
}

export function TaskFormDialog({
  task,
  isOpen,
  setIsOpen,
  returnUrl = TODO_URL,
}: TaskFormDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  const title = task
    ? t('task.message.task_editing')
    : t('task.message.task_creation')
  const description = t('task.message.set_task_info')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        setIsOpen(open)
        if (!open) {
          await sleep(200) // ダイアログが閉じるアニメーションが終わるまで待機
          navigate(returnUrl)
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={() => setIsOpen(false)}
          returnUrl={returnUrl}
        >
          {task && (
            // 削除ボタン
            <Button
              type="button"
              variant="link"
              className="mt-2 border-destructive/50 px-0 text-destructive sm:mt-0"
              onClick={() => setIsOpenDeleteDialog(true)}
            >
              <RiDeleteBinLine className="mr-1 h-4 w-4" />
              {t('common.message.delete')}
            </Button>
          )}
        </TaskForm>
        <TaskDeleteConfirmDialog
          task={task}
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
          onSubmit={() => setIsOpen(false)}
          returnUrl={returnUrl}
        />
      </DialogContent>
    </Dialog>
  )
}
