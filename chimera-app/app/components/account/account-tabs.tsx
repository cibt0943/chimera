import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { AccountSettings } from '~/types/accounts'
import { AccountGeneralTab } from './account-general-tab'
import { AccountPasswordTab } from './account-password-tab'

interface AccountTabsProps {
  accountSettings: AccountSettings
}

export function AccountTabs({ accountSettings }: AccountTabsProps) {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="account">
          {t('account.message.general')}
        </TabsTrigger>
        <TabsTrigger value="password">
          {t('account.message.password')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountGeneralTab accountGeneral={accountSettings.general} />
      </TabsContent>
      <TabsContent value="password">
        <AccountPasswordTab accountPassword={accountSettings.password} />
      </TabsContent>
    </Tabs>
  )
}
