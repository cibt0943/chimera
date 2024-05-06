import * as React from 'react'
import { Form } from '@remix-run/react'
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
  getSelectProps,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
// import { Badge } from '~/components/ui/badge'
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { DateTimePicker } from '~/components/lib/date-time-picker'
import {
  Task,
  TaskStatus,
  TaskSchema,
  TaskSchemaType,
  TaskStatusListByDispOrder,
} from '~/types/tasks'

interface TaskDialogProps {
  task: Task | undefined
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

function SelectItems() {
  return (
    <>
      {TaskStatusListByDispOrder.map((status) => (
        <SelectItem key={status.value} value={status.value.toString()}>
          {status.label}
        </SelectItem>
      ))}
    </>
  )
}

export function TaskUpsertFormDialog({
  task,
  isOpenDialog,
  setIsOpenDialog,
}: TaskDialogProps) {
  const title = task ? 'タスク編集' : 'タスク追加'
  const description = 'タスクの情報を設定してください。'
  const action = task ? `${task.id}` : ''

  const defaultValue = task || {
    title: '',
    memo: '',
    status: TaskStatus.NEW,
    due_date: null,
  }

  const [form, fields] = useForm<TaskSchemaType>({
    id: 'task-from',
    defaultValue: defaultValue,
    constraint: getZodConstraint(TaskSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: TaskSchema })
    },
    onSubmit: () => {
      setIsOpenDialog(false)
    },
  })

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          method="post"
          className="space-y-8"
          {...getFormProps(form)}
          action={action}
        >
          <FormItem>
            <FormLabel htmlFor={fields.title.id}>
              タイトル
              <Required />
            </FormLabel>
            <Input {...getInputProps(fields.title, { type: 'text' })} />
            <FormMessage message={fields.title.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.memo.id}>メモ</FormLabel>
            <Textarea
              {...getTextareaProps(fields.memo)}
              className="resize-none"
            />
            <FormMessage message={fields.memo.errors} />
          </FormItem>
          <FormItem className="flex flex-col">
            <FormLabel htmlFor={fields.due_date.id}>期限</FormLabel>
            <DateTimePicker meta={fields.due_date} />
            <FormMessage message={fields.due_date.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.status.id}>
              状態
              <Required />
            </FormLabel>
            <Select
              {...getSelectProps(fields.status)}
              defaultValue={fields.status.value}
            >
              <SelectTrigger id={fields.status.id}>
                <SelectValue placeholder="Select a verified email to display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems />
              </SelectContent>
            </Select>
            <FormDescription>タスクの状態を選んでください</FormDescription>
            <FormMessage message={fields.status.errors} />
          </FormItem>
          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
