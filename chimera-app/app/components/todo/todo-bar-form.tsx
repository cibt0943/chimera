import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
import { TODO_URL } from '~/constants'
import {
  FormItemGroup,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import { CompactColorPickerConform } from '~/components/lib/conform/compact-color-picker'
import { TodoType } from '~/types/todos'
import { TodoBarSchema, TodoBarSchemaType, TodoBar } from '~/types/todo-bars'

export interface TodoBarFormProps {
  todoBar: TodoBar | undefined
  formId: string
  redirectUrl: string
}

export function TodoBarForm({
  todoBar,
  formId,
  redirectUrl,
}: TodoBarFormProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  const action = todoBar ? `${TODO_URL}/${todoBar.todoId}` : `${TODO_URL}/bar`

  const [form, fields] = useForm<TodoBarSchemaType>({
    id: formId,
    defaultValue: todoBar ?? {
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

  return (
    <fetcher.Form method="post" {...getFormProps(form)} action={action}>
      <FormItemGroup>
        <FormItem>
          <FormLabel htmlFor={fields.title.id}>
            {t('todoBar.model.title')}
            <Required />
          </FormLabel>
          <InputConform meta={fields.title} type="text" />
          <FormMessage message={t(fields.title.errors)} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.bgColor.id}>
            {t('todoBar.model.bgColor')}
          </FormLabel>
          <CompactColorPickerConform meta={fields.bgColor} allowClear />
          <FormMessage message={t(fields.bgColor.errors)} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.textColor.id}>
            {t('todoBar.model.textColor')}
          </FormLabel>
          <CompactColorPickerConform meta={fields.textColor} allowClear />
          <FormMessage message={t(fields.textColor.errors)} />
        </FormItem>
        <input type="hidden" name="type" value={TodoType.BAR} />
        <input type="hidden" name="redirectUrl" value={redirectUrl} />
      </FormItemGroup>
    </fetcher.Form>
  )
}
