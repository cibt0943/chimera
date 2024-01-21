import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import { Task, TaskSchema, TaskSchemaType } from '~/types/tasks'
import { TaskForm } from './task-form'

interface TaskDialogProps {
  task: Task
  openDialog: boolean
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskDialog({
  task,
  openDialog,
  setOpenDialog,
}: TaskDialogProps) {
  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(TaskSchema),
    defaultValues: task,
  })

  // taskが変更されたらフォームに値をセット
  React.useEffect(() => {
    if (openDialog) {
      form.reset(task) // resetを使用してデフォルト値をセット
    }
  }, [task, form, openDialog])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>タスク追加</DialogTitle>
          <DialogDescription>
            新規に追加するタスクの情報を設定してください。
          </DialogDescription>
        </DialogHeader>
        <TaskForm form={form}>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              保存
            </Button>
          </DialogFooter>
        </TaskForm>
      </DialogContent>
    </Dialog>
  )
}
