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
        <TaskForm
          task={task}
          handleSubmit={() => {
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
