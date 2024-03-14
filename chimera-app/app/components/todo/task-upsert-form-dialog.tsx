import * as React from 'react'
import { Form } from '@remix-run/react'
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/lib/form'
import { DatePicker } from '../lib/date-picker'
import { Task, TaskSchema } from '~/types/tasks'

interface TaskDialogProps {
  task: Task
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskUpsertFormDialog({
  task,
  isOpenDialog,
  setIsOpenDialog,
}: TaskDialogProps) {
  const [form, fields] = useForm({
    id: 'task-from',
    defaultValue: task,
    constraint: getZodConstraint(TaskSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: TaskSchema }),
    // shouldValidate: 'onBlur',
    // shouldRevalidate: 'onInput',
  })
  // const navigation = useNavigation()
  // const { revalidate } = useRevalidator()

  function SubmitButton() {
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
        <Form method="post" className="space-y-8" {...getFormProps(form)}>
          <FormItem>
            <FormLabel>
              タイトル<span className="text-red-500">*</span>
            </FormLabel>
            <Input {...getInputProps(fields.title, { type: 'text' })} />
            <FormMessage message={fields.title.errors} />
          </FormItem>
          <FormItem>
            <FormLabel>メモ</FormLabel>
            <Textarea
              {...getTextareaProps(fields.memo)}
              className="resize-none"
            />
            <FormMessage message={fields.memo.errors} />
          </FormItem>
          <FormItem className="flex flex-col">
            <FormLabel>期限</FormLabel>
            <DatePicker meta={fields.dueDate} />
            <FormDescription>
              {fields.dueDate.value
                ? 'クリアする際は設定している日付を再度クリックします'
                : ''}
            </FormDescription>
            <FormMessage message={fields.dueDate.errors} />
          </FormItem>
          <DialogFooter>{SubmitButton()}</DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
