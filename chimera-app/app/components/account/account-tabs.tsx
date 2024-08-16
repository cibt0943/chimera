import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { AccountSettings } from '~/types/accounts'
import { AccountTab } from './account-tab'
import { PasswordTab } from './password-tab'

interface AccountTabsProps {
  accountSettings: AccountSettings
}

export function AccountTabs({ accountSettings }: AccountTabsProps) {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="account">{t('account.title-account')}</TabsTrigger>
        <TabsTrigger value="password">
          {t('account.title-password')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountTab accountSettings={accountSettings} />
      </TabsContent>
      <TabsContent value="password">
        <PasswordTab accountSettings={accountSettings} />
      </TabsContent>
    </Tabs>
  )
}
