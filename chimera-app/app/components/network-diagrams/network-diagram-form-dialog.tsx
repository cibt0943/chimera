// app/components/network-diagrams/network-diagram-form-dialog.tsx
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button-base'
import { NetworkDiagram } from '~/types/network-diagrams'
import { NetworkDiagramForm } from './network-diagram-form'

export interface NetworkDiagramFormDialogProps {
  networkDiagram: NetworkDiagram | undefined
  action: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NetworkDiagramFormDialog({
  networkDiagram,
  action,
  isOpen,
  onOpenChange,
}: NetworkDiagramFormDialogProps) {
  const { t } = useTranslation()

  const title = networkDiagram
    ? t('network_diagram.message.network_diagram_editing')
    : t('network_diagram.message.network_diagram_creation')
  const desc = t('network_diagram.message.set_network_diagram_title')
  const formId = networkDiagram
    ? `network-diagram-form-${networkDiagram.id}`
    : 'network-diagram-form-new'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <NetworkDiagramForm
          networkDiagram={networkDiagram}
          formId={formId}
          action={action}
        />
        <DialogFooter>
          <Button type="submit" form={formId}>
            {t('common.message.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
