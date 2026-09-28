// app/components/network-diagrams/network-diagram-form.tsx
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod/v4'
import {
  FormItemGroup,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import {
  NetworkDiagramSchema,
  NetworkDiagramSchemaType,
  NetworkDiagram,
} from '~/types/network-diagrams'

export interface NetworkDiagramFormProps {
  networkDiagram: NetworkDiagram | undefined
  formId: string
  action: string
}

export function NetworkDiagramForm({
  networkDiagram,
  formId,
  action,
}: NetworkDiagramFormProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  const [form, fields] = useForm<NetworkDiagramSchemaType>({
    id: formId,
    defaultValue: networkDiagram ?? { title: '' },
    constraint: getZodConstraint(NetworkDiagramSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: NetworkDiagramSchema })
    },
    shouldRevalidate: 'onInput',
  })

  return (
    <fetcher.Form method="post" {...getFormProps(form)} action={action}>
      <FormItemGroup>
        <FormItem>
          <FormLabel htmlFor={fields.title.id}>
            {t('network_diagram.model.title')}
            <Required />
          </FormLabel>
          <InputConform meta={fields.title} type="text" autoFocus />
          <FormMessage message={fields.title.errors} />
        </FormItem>
      </FormItemGroup>
    </fetcher.Form>
  )
}
