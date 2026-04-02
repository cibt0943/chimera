import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
import { Button } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormFooter,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import { CompactColorPickerConform } from '~/components/lib/conform/compact-color-picker'
import { TodoDeleteButton } from './todo-delete-button'
import { TodoType } from '~/types/todos'
import { ViewTodo } from '~/types/view-todos'
import { TodoBarSchema, TodoBarSchemaType, TodoBar } from '~/types/todo-bars'

export interface TodoBarFormProps {
  todoBar: TodoBar | undefined
  redirectUrl: string
}

export function TodoBarForm({ todoBar, redirectUrl }: TodoBarFormProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  const action = todoBar ? `${TODO_URL}/${todoBar.todoId}` : `${TODO_URL}/bar`
  const formId = todoBar
    ? `todo-bar-form-${todoBar.todoId}`
    : 'todo-bar-form-new'

  const [form, fields] = useForm<TodoBarSchemaType>({
    id: formId,
    defaultValue: todoBar || {
      title: '',
      bgColor: '',
      textColor: '',
    },
    constraint: getZodConstraint(TodoBarSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: TodoBarSchema })
    },
    shouldRevalidate: 'onInput',
  })

  const viewTodo: ViewTodo | undefined = todoBar
    ? {
        todoId: todoBar.todoId,
        createdAt: todoBar.createdAt,
        updatedAt: todoBar.updatedAt,
        accountId: todoBar.accountId,
        type: TodoType.BAR,
        position: todoBar.position,
        title: todoBar.title,
        status: null,
        memo: null,
        dueDate: null,
        dueDateAllDay: null,
        bgColor: todoBar.bgColor,
        textColor: todoBar.textColor,
      }
    : undefined

  return (
    <fetcher.Form method="post" {...getFormProps(form)} action={action}>
      <div className="max-h-[calc(100svh-240px)] space-y-8 overflow-y-auto p-0.5">
        <FormItem>
          <FormLabel htmlFor={fields.title.id}>
            {t('todoBar.model.title')}
            <Required />
          </FormLabel>
          <InputConform meta={fields.title} type="text" />
          <FormMessage message={fields.title.errors} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.bgColor.id}>
            {t('todoBar.model.bgColor')}
          </FormLabel>
          <CompactColorPickerConform meta={fields.bgColor} allowClear />
          <FormMessage message={fields.bgColor.errors} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.textColor.id}>
            {t('todoBar.model.textColor')}
          </FormLabel>
          <CompactColorPickerConform meta={fields.textColor} allowClear />
          <FormMessage message={fields.textColor.errors} />
        </FormItem>
        <input type="hidden" name="type" value={TodoType.BAR} />
        <input type="hidden" name="redirectUrl" value={redirectUrl} />
        <FormFooter className="sm:justify-between">
          <div>
            {todoBar && (
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
