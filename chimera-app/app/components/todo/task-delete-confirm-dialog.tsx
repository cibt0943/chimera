import * as React from 'react'
import { Form } from '@remix-run/react'
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog'
import { buttonVariants, Button } from '~/components/ui/button'
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
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <Form
        action={`${task.id}/delete`}
        method="post"
        onSubmit={() => {
          setIsOpenDialog(false)
        }}
      >
        <Button type="submit" variant="destructive">
          削除
        </Button>
      </Form>
    </DeleteConfirmDialog>
  )
}
