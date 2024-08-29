import * as React from 'react'
import { ToastMessage } from 'remix-toast'
import { Toaster as Sonner, toast as notify } from 'sonner'
import { useTranslation } from 'react-i18next'

export function useSonner(toast: ToastMessage | undefined) {
  const { t } = useTranslation()

  // トーストメッセージを表示
  React.useEffect(() => {
    if (toast && toast.message !== '') {
      if (toast.type === 'success') {
        notify.success(t(toast.message))
      } else {
        notify.info(t(toast.message))
      }
    }
  }, [toast, t])
}

export { Sonner }
