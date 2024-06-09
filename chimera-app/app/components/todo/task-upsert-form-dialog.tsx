import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
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
import { Required } from '~/components/lib/required'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { DateTimePicker } from '~/components/lib/date-time-picker'
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

export function TaskUpsertFormDialog({
  task,
  isOpenDialog,
  setIsOpenDialog,
}: TaskDialogProps) {
  const { t } = useTranslation()
  const title = task
    ? t('task.message.task-editing')
    : t('task.message.task-creation')
  const description = t('task.message.set-task-info')
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
              {t('task.model.title')}
              <Required />
            </FormLabel>
            <Input {...getInputProps(fields.title, { type: 'text' })} />
            <FormMessage message={fields.title.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.memo.id}>
              {t('task.model.memo')}
            </FormLabel>
            <Textarea
              {...getTextareaProps(fields.memo)}
              className="resize-none"
            />
            <FormMessage message={fields.memo.errors} />
          </FormItem>
          <FormItem className="flex flex-col">
            <FormLabel htmlFor={fields.due_date.id}>
              {t('task.model.due-date')}
            </FormLabel>
            <DateTimePicker meta={fields.due_date} />
            <FormMessage message={fields.due_date.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.status.id}>
              {t('task.model.status')}
              <Required />
            </FormLabel>
            <Select
              {...getSelectProps(fields.status)}
              defaultValue={fields.status.value}
            >
              <SelectTrigger id={fields.status.id}>
                <SelectValue placeholder="Select a task status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItems />
              </SelectContent>
            </Select>
            <FormDescription>
              {t('task.message.select-task-status')}
            </FormDescription>
            <FormMessage message={fields.status.errors} />
          </FormItem>
          <DialogFooter>
            <Button type="submit">{t('common.message.save')}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function SelectItems() {
  const { t } = useTranslation()

  return (
    <>
      {TaskStatusListByDispOrder.map((status) => (
        <SelectItem key={status.value} value={status.value.toString()}>
          {t(status.label)}
        </SelectItem>
      ))}
    </>
  )
}
