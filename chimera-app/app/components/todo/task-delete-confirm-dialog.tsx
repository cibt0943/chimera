import * as React from 'react'
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Task } from '~/types/tasks'

interface DeleteTaskConfirmDialogProps {
  task: Task
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskDeleteConfirmDialog({
  task,
  isOpenDialog,
  setIsOpenDialog,
}: DeleteTaskConfirmDialogProps) {
  return (
    <DeleteConfirmDialog
      title="Todoの削除"
      description={'「' + task.title + '」を削除します。よろしいですか？'}
      isOpenDialog={isOpenDialog}
      setIsOpenDialog={setIsOpenDialog}
    >
      <AlertDialogCancel
        onClick={() => {
          setIsOpenDialog(false)
        }}
      >
        キャンセル
      </AlertDialogCancel>
      <AlertDialogAction
        className={buttonVariants({ variant: 'destructive' })}
        onClick={() => {
          setIsOpenDialog(false)
        }}
      >
        削除
      </AlertDialogAction>
    </DeleteConfirmDialog>
  )
}
