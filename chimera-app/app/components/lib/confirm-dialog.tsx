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
  title: string
  description: string
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  torigger?: React.ReactNode
  children?: React.ReactNode
}

export function ConfirmDialog({
  title,
  torigger,
  description,
  isOpen,
  setIsOpen,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
