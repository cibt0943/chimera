import * as React from 'react'
import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'
import { TaskDeleteButton } from './task-delete-button'

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

  const title = task
    ? t('task.message.task_editing')
    : t('task.message.task_creation')
  const desc = t('task.message.set_task_info')

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
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={() => setIsOpen(false)}
          returnUrl={returnUrl}
        >
          <TaskDeleteButton
            task={task}
            onSubmit={(event) => {
              event.stopPropagation()
              setIsOpen(false)
            }}
            returnUrl={returnUrl}
          />
        </TaskForm>
      </DialogContent>
    </Dialog>
  )
}
