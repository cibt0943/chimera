import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

interface ConfirmDialogProps {
  title: React.ReactNode | string
  description: React.ReactNode | string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  torigger?: React.ReactNode
  children?: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  torigger,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{torigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>{children}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
