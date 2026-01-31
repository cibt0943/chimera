import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
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
import { TodoDeleteButton } from './todo-delete-button'
import { TodoType } from '~/types/todos'
import { ViewTodo } from '~/types/view-todos'
import {
  TaskStatus,
  TaskSchema,
  TaskSchemaType,
  TaskStatusListByDispOrder,
  Task,
} from '~/types/tasks'

export interface TaskFormProps {
  task: Task | undefined
  redirectUrl: string
}

export function TaskForm({ task, redirectUrl }: TaskFormProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  const action = task ? `${TODO_URL}/${task.todoId}` : `${TODO_URL}/task`
  const formId = task ? `task-form-${task.todoId}` : 'task-form-new'

  const [form, fields] = useForm<TaskSchemaType>({
    id: formId,
    defaultValue: task || {
      title: '',
      memo: '',
      status: TaskStatus.NEW,
      dueDate: null,
      dueDateAllDay: false,
    },
    constraint: getZodConstraint(TaskSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: TaskSchema })
    },
    shouldRevalidate: 'onInput',
  })

  const viewTodo: ViewTodo | undefined = task
    ? {
        todoId: task.todoId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        accountId: task.accountId,
        type: TodoType.TASK,
        position: task.position,
        title: task.title,
        status: task.status,
        memo: task.memo,
        dueDate: task.dueDate,
        dueDateAllDay: task.dueDateAllDay,
        color: null,
      }
    : undefined

  return (
    <fetcher.Form method="post" {...getFormProps(form)} action={action}>
      <div className="max-h-[calc(100svh-240px)] space-y-8 overflow-y-auto p-0.5">
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
          <TextareaConform
            meta={fields.memo}
            className="resize-none"
            rows={4}
          />
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
          <SelectConform
            meta={fields.status}
            placeholder="Select a task status"
          >
            <SelectItems />
          </SelectConform>
          <FormDescription>
            {t('task.message.select_task_status')}
          </FormDescription>
          <FormMessage message={fields.status.errors} />
        </FormItem>
        <input type="hidden" name="type" value={TodoType.TASK} />
        <input type="hidden" name="redirectUrl" value={redirectUrl} />
        <FormFooter className="sm:justify-between">
          <div>
            {task && (
              <TodoDeleteButton viewTodo={viewTodo} redirectUrl={redirectUrl} />
            )}
          </div>
          <Button type="submit" disabled={fetcher.state !== 'idle'}>
            {t('common.message.save')}
          </Button>
        </FormFooter>
      </div>
    </fetcher.Form>
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
