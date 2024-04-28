import { createContext, useContext } from 'react'
import { Account } from '~/types/accounts'

type AccountContextState = {
  account: Account | null
}

const initialState: AccountContextState = {
  account: null,
}

const AccountContext = createContext<AccountContextState>(initialState)

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

type AccountProviderProps = {
  children: React.ReactNode
  account: Account | null
}

export function AccountProvider({ children, account }: AccountProviderProps) {
  return (
    <AccountContext.Provider value={{ account }}>
      {children}
    </AccountContext.Provider>
  )
}
