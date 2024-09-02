import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { SelectItem } from '~/components/ui/select'
import { ACCOUNT_URL } from '~/constants'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormFooter,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import { SelectConform } from '~/components/lib/conform/select'
import {
  AccountGeneral,
  AccountGeneralSchema,
  AccountGeneralSchemaType,
  LanguageList,
  ThemeList,
} from '~/types/accounts'

interface AccountFormProps {
  accountGeneral: AccountGeneral
  children?: React.ReactNode
}

export function AccountGeneralForm({
  accountGeneral,
  children,
}: AccountFormProps) {
  const { t } = useTranslation()

  const action = [ACCOUNT_URL, 'general'].join('/')
  const defaultValue = accountGeneral

  const [form, fields] = useForm<AccountGeneralSchemaType>({
    id: 'account-general-form',
    defaultValue: defaultValue,
    constraint: getZodConstraint(AccountGeneralSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: AccountGeneralSchema })
    },
    shouldRevalidate: 'onInput',
  })

  return (
    <Form
      method="post"
      {...getFormProps(form)}
      className="space-y-6"
      action={action}
      state={{ isLoadEffect: true }}
    >
      <FormItem>
        <FormLabel htmlFor={fields.name.id}>
          {t('account.model.name')}
          <Required />
        </FormLabel>
        <InputConform meta={fields.name} type="text" autoComplete="on" />
        <FormMessage message={fields.name.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.language.id}>
          {t('account.model.language')}
          <Required />
        </FormLabel>
        <SelectConform
          meta={fields.language}
          placeholder="Select a language to display"
        >
          <SelectLanguageItems />
        </SelectConform>
        <FormMessage message={fields.language.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.theme.id}>
          {t('account.model.theme')}
          <Required />
        </FormLabel>
        <SelectConform
          meta={fields.theme}
          placeholder="Select a theme to display"
        >
          <SelectThemeItems />
        </SelectConform>
        <FormMessage message={fields.theme.errors} />
      </FormItem>
      <FormFooter className="flex sm:justify-between">
        {children || <div>&nbsp;</div>}
        <Button type="submit">{t('common.message.save')}</Button>
      </FormFooter>
    </Form>
  )
}

function SelectLanguageItems() {
  const { t } = useTranslation()
  return (
    <>
      {LanguageList.map((language) => (
        <SelectItem key={language.value} value={language.value.toString()}>
          {t(language.label)}
        </SelectItem>
      ))}
    </>
  )
}

function SelectThemeItems() {
  const { t } = useTranslation()
  return (
    <>
      {ThemeList.map((theme) => (
        <SelectItem key={theme.value} value={theme.value}>
          <span className="flex items-center">
            <theme.icon className="mr-2 h-4 w-4" />
            {t(theme.label)}
          </span>
        </SelectItem>
      ))}
    </>
  )
}
