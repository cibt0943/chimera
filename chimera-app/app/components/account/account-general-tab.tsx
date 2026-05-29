import { Separator } from '~/components/ui/separator'
import type { AccountGeneral } from '~/types/accounts'
import { AccountGeneralForm } from './account-general-form'
import { AccountDeleteButton } from './account-delete-button'

interface AccountGeneralTabProps {
  accountGeneral: AccountGeneral
}

export function AccountGeneralTab({ accountGeneral }: AccountGeneralTabProps) {
  return (
    <div className="space-y-6">
      <Separator />
      <AccountGeneralForm accountGeneral={accountGeneral}>
        <AccountDeleteButton accountGeneral={accountGeneral} />
      </AccountGeneralForm>
    </div>
  )
}
