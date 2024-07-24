import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  useForm,
  getFormProps,
  getInputProps,
  getSelectProps,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Required } from '~/components/lib/required'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { FormItem, FormLabel, FormMessage } from '~/components/lib/form'
import {
  AccountSettings,
  AccountSettingsSchema,
  AccountSettingsSchemaType,
  LanguageList,
  ThemeList,
} from '~/types/accounts'

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
          {t(theme.label)}
        </SelectItem>
      ))}
    </>
  )
}

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
        <Input {...getInputProps(fields.name, { type: 'text' })} />
        <FormMessage message={fields.name.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.language.id}>
          {t('account.model.language')}
          <Required />
        </FormLabel>
        <Select
          {...getSelectProps(fields.language)}
          defaultValue={fields.language.value}
        >
          <SelectTrigger id={fields.language.id}>
            <SelectValue placeholder="Select a language to display" />
          </SelectTrigger>
          <SelectContent>
            <SelectLanguageItems />
          </SelectContent>
        </Select>
        <FormMessage message={fields.language.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.theme.id}>
          {t('account.model.theme')}
          <Required />
        </FormLabel>
        <Select
          {...getSelectProps(fields.theme)}
          defaultValue={fields.theme.value}
        >
          <SelectTrigger id={fields.theme.id}>
            <SelectValue placeholder="Select a theme to display" />
          </SelectTrigger>
          <SelectContent>
            <SelectThemeItems />
          </SelectContent>
        </Select>
        <FormMessage message={fields.theme.errors} />
      </FormItem>
      <Button type="submit">{t('common.message.save')}</Button>
    </Form>
  )
}
