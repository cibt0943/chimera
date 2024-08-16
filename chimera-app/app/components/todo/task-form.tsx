import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { SelectItem } from '~/components/ui/select'
import { TODO_URL } from '~/constants'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormFooter,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { SelectConform } from '~/components/lib/conform/select'
import { DateTimePickerConform } from '~/components/lib/conform/date-time-picker'
import {
  Task,
  TaskStatus,
  TaskSchema,
  TaskSchemaType,
  TaskStatusListByDispOrder,
} from '~/types/tasks'

export interface TaskFormProps {
  task: Task | undefined
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function TaskForm({
  task,
  onSubmit,
  returnUrl = TODO_URL,
  children,
}: TaskFormProps) {
  const { t } = useTranslation()

  const action = task ? [TODO_URL, task.id].join('/') : TODO_URL
  const formId = task ? `task-form-${task.id}` : 'task-form-new'
  const defaultValue = task || {
    title: '',
    memo: '',
    status: TaskStatus.NEW,
    dueDate: null,
    dueDateAllDay: false,
  }

  const [form, fields] = useForm<TaskSchemaType>({
    id: formId,
    defaultValue: defaultValue,
    constraint: getZodConstraint(TaskSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: TaskSchema })
    },
    shouldRevalidate: 'onInput',
    onSubmit: onSubmit,
  })

  return (
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
        <InputConform meta={fields.title} type="text" />
        <FormMessage message={fields.title.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.memo.id}>{t('task.model.memo')}</FormLabel>
        <TextareaConform meta={fields.memo} className="resize-none" rows={4} />
        <FormMessage message={fields.memo.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.dueDate.id}>
          {t('task.model.due_date')}
        </FormLabel>
        <DateTimePickerConform
          dateMeta={fields.dueDate}
          allDayMeta={fields.dueDateAllDay}
          defaultAllDay={false}
          includeAllDayComponent={true}
        />
        <FormMessage message={fields.dueDate.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.status.id}>
          {t('task.model.status')}
          <Required />
        </FormLabel>
        <SelectConform meta={fields.status} placeholder="Select a task status">
          <SelectItems />
        </SelectConform>
        <FormDescription>
          {t('task.message.select_task_status')}
        </FormDescription>
        <FormMessage message={fields.status.errors} />
      </FormItem>
      <input type="hidden" name="returnUrl" value={returnUrl} />
      <FormFooter className="sm:justify-between">
        {children || <div>&nbsp;</div>}
        <Button type="submit">{t('common.message.save')}</Button>
      </FormFooter>
    </Form>
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
