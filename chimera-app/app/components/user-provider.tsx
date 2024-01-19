import { createContext, useContext } from 'react'
import { User } from '~/lib/auth.server'

type UserContextState = {
  user: User | null
}

const initialState: UserContextState = {
  user: null,
}

const UserContext = createContext<UserContextState>(initialState)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

type UserProviderProps = {
  children: React.ReactNode
  user: User | null
}

export function UserProvider({ children, user }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}
