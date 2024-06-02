import { Form } from '@remix-run/react'
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
  Account,
  LanguageType,
  AccountSchema,
  AccountSchemaType,
  LanguageTypeList,
} from '~/types/accounts'

interface AccountFormProps {
  account: Account
}

export function AccountForm({ account }: AccountFormProps) {
  const defaultValue = account

  const [form, fields] = useForm<AccountSchemaType>({
    id: 'account-form',
    defaultValue: defaultValue,
    constraint: getZodConstraint(AccountSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: AccountSchema })
    },
  })

  return (
    <Form method="post" {...getFormProps(form)} className="space-y-6" action="">
      <FormItem>
        <FormLabel htmlFor={fields.name.id}>
          名称
          <Required />
        </FormLabel>
        <Input {...getInputProps(fields.name, { type: 'text' })} />
        <FormMessage message={fields.name.errors} />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor={fields.language.id}>
          言語
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
            <SelectItems />
          </SelectContent>
        </Select>
        <FormMessage message={fields.language.errors} />
      </FormItem>
      <Button type="submit">保存</Button>
    </Form>
  )
}

function SelectItems() {
  return (
    <>
      {LanguageTypeList.map((language) => (
        <SelectItem key={language.value} value={language.value.toString()}>
          {language.label}
        </SelectItem>
      ))}
    </>
  )
}
