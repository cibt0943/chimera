import { useMedia } from '~/lib/hooks'
import { MemoFormView } from '~/components/memo/memo-form-view'

export default function Index() {
  const isLaptop = useMedia('(min-width: 1024px)', true)

  if (!isLaptop) return null

  return <MemoFormView memo={undefined} returnUrl="" />
}
