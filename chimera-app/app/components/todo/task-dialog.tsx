import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useForm } from 'react-hook-form'
import { RxReload } from 'react-icons/rx'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import { TaskFormObj, TaskSchemaType, taskResolver } from '~/types/tasks'
import { TaskForm } from './task-form'

interface TaskDialogProps {
  taskFormObj: TaskFormObj
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskDialog({
  taskFormObj,
  isOpenDialog,
  setIsOpenDialog,
}: TaskDialogProps) {
  const form = useForm<TaskSchemaType>({
    resolver: taskResolver,
    defaultValues: taskFormObj,
  })

  const todoFetcher = useFetcher()
  const isSubmitting = todoFetcher.state === 'submitting'
  const isSuccess = todoFetcher.state === 'loading'

  // バリデーションが通った後に実行される関数
  function onSubmit(values: TaskSchemaType) {
    todoFetcher.submit(values, { method: 'post' })
  }

  React.useEffect(() => {
    if (!isSuccess) return
    setIsOpenDialog(false)
  }, [isSuccess, setIsOpenDialog])

  // taskが変更されたらフォームに値をセット
  React.useEffect(() => {
    if (isOpenDialog) {
      form.reset(taskFormObj) // resetを使用してデフォルト値をセット
    }
  }, [taskFormObj, form, isOpenDialog])

  function SubmitButton() {
    if (isSubmitting) {
      return (
        <Button type="submit" disabled={true}>
          <RxReload className="mr-2 h-4 w-4 animate-spin" />
          保存中
        </Button>
      )
    }
    return <Button type="submit">保存</Button>
  }

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>タスク追加</DialogTitle>
          <DialogDescription>
            新規に追加するタスクの情報を設定してください。
          </DialogDescription>
        </DialogHeader>
        <TaskForm form={form} onSubmit={form.handleSubmit(onSubmit)}>
          <DialogFooter>{SubmitButton()}</DialogFooter>
        </TaskForm>
      </DialogContent>
    </Dialog>
  )
}
