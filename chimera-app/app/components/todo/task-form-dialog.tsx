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
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'

export interface TaskFormDialogProps {
  task: Task | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskFormDialog({
  task,
  isOpen,
  setIsOpen,
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
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) navigate('/todos')
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm task={task} onSubmit={() => setIsOpen(false)}>
          {task && (
            <Button
              type="button"
              variant="link"
              className="border-destructive/50 px-0 text-destructive"
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
          onSubmit={() => {
            setIsOpenDeleteDialog(false)
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
