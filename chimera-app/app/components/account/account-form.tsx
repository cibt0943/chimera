import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { SelectItem } from '~/components/ui/select'
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
  AccountSettings,
  AccountSettingsSchema,
  AccountSettingsSchemaType,
  LanguageList,
  ThemeList,
} from '~/types/accounts'

interface AccountFormProps {
  accountSettings: AccountSettings
}

export function AccountForm({ accountSettings }: AccountFormProps) {
  const { t } = useTranslation()
  const defaultValue = accountSettings

  const [form, fields] = useForm<AccountSettingsSchemaType>({
    id: 'account-form',
    defaultValue: defaultValue,
    constraint: getZodConstraint(AccountSettingsSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: AccountSettingsSchema })
    },
  })

  return (
    <Form
      method="post"
      {...getFormProps(form)}
      className="space-y-6"
      action=""
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
      <FormFooter>
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
