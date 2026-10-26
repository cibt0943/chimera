import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { sleep } from '~/lib/utils'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { NetworkDiagram } from '~/types/network-diagrams'

export interface NetworkDiagramDeleteConfirmDialogProps {
  networkDiagram?: NetworkDiagram
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function NetworkDiagramDeleteConfirmDialog({
  networkDiagram,
  isOpen,
  onOpenChange,
  children,
}: NetworkDiagramDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher<{ deletedDiagramId: string }>()

  React.useEffect(() => {
    if (fetcher.data?.deletedDiagramId === networkDiagram?.id) {
      onOpenChange?.(false)
    }
  }, [fetcher.data, networkDiagram?.id, onOpenChange])

  if (!networkDiagram) return null

  const title = t('network_diagram.message.network_diagram_deletion')
  const desc = `「${
    networkDiagram.title || t('network_diagram.message.untitled')
  }」${t('common.message.confirm_deletion')}`
  const action = `/network-diagrams/${networkDiagram.id}/delete`

  return (
    <ConfirmDialog
      title={title}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
        onClick={async () => {
          await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
          fetcher.submit(null, { method: 'delete', action })
        }}
      >
        {t('common.message.delete')}
      </AlertDialogAction>
    </ConfirmDialog>
  )
}
