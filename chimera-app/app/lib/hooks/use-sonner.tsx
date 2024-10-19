import * as React from 'react'
import { ToastMessage } from 'remix-toast'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function useSonner(toastMsg: ToastMessage | undefined) {
  const { t } = useTranslation()

  // トーストメッセージを表示
  React.useEffect(() => {
    if (toastMsg && toastMsg.message !== '') {
      const options = {
        description: toastMsg.description,
        duration: toastMsg.duration,
      }

      switch (toastMsg.type) {
        case 'success':
          toast.success(t(toastMsg.message), options)
          break
        case 'error':
          toast.error(t(toastMsg.message, options))
          break
        case 'info':
          toast.info(t(toastMsg.message), options)
          break
        case 'warning':
          toast.warning(t(toastMsg.message), options)
          break
        default:
          toast(t(toastMsg.message), options)
          break
      }
    }
  }, [toastMsg, t])
}
