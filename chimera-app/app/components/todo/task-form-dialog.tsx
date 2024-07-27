import * as React from 'react'
import { Form, useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
  getSelectProps,
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
import { Required } from '~/components/lib/required'
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
import {
  Task,
  TaskStatus,
  TaskSchema,
  TaskSchemaType,
  TaskStatusListByDispOrder,
} from '~/types/tasks'
import { TaskDueDateTimePicker } from './task-due-date-time-picker'

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
  const action = task ? `/todos/${task.id}` : '/todos'

  const defaultValue = task || {
    title: '',
    memo: '',
    status: TaskStatus.NEW,
    due_date: null,
  }

  const [form, fields] = useForm<TaskSchemaType>({
    id: `task-form${task ? `-${task.id}` : ''}`,
    defaultValue: defaultValue,
    constraint: getZodConstraint(TaskSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: TaskSchema })
    },
    onSubmit: () => {
      setIsOpen(false)
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open && !location.pathname.match(/^\/todos\/?$/)) {
          navigate('/todos')
        }
      }}
    >
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
            <FormLabel htmlFor={fields.dueDate.id}>
              {t('task.model.due_date')}
            </FormLabel>
            <TaskDueDateTimePicker meta={fields.dueDate} />
            <FormMessage message={fields.dueDate.errors} />
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
              {t('task.message.select_task_status')}
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
