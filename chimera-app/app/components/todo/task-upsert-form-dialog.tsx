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
import { DatePicker } from '../lib/date-picker'
import {
  Task,
  TaskStatus,
  TaskSchema,
  TaskSchemaType,
  TaskStatusList,
} from '~/types/tasks'

interface TaskDialogProps {
  task: Task | undefined
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

function SelectItems() {
  return (
    <>
      {TaskStatusList.map((status) => (
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
  const description = task
    ? 'タスクの情報を変更してください。'
    : '新規に追加するタスクの情報を設定してください。'
  const action = task ? `${task.id}` : ''

  const defaultValue = task || {
    title: '',
    memo: '',
    status: TaskStatus.NEW,
    dueDate: null,
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
          <FormItem>
            <FormLabel>状態</FormLabel>
            <Select
              {...getSelectProps(fields.status)}
              defaultValue={fields.status.value}
            >
              <SelectTrigger>
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
