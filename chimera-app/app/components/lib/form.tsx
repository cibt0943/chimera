import * as React from 'react'
import { cn } from '~/lib/utils'
import { Label } from '~/components/ui/label'

interface FormItemProps {
  children?: React.ReactNode
  className?: string
  props?: React.ComponentProps<'div'>
}

export function FormItem({ children, className, ...props }: FormItemProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

interface FormLabelProps {
  children?: React.ReactNode
  error?: object
  className?: string
  props?: React.ComponentProps<'label'>
}

export function FormLabel({
  children,
  error,
  className,
  ...props
}: FormLabelProps) {
  return (
    <Label className={cn(error && 'text-destructive', className)} {...props}>
      {children}
    </Label>
  )
}
interface FormMessageProps {
  message?: string[] | string
  className?: string
  props?: React.ComponentProps<'p'>
}

export function FormMessage({
  message,
  className,
  ...props
}: FormMessageProps) {
  if (!message) return null

  const messages = typeof message === 'string' ? [message] : message

  return (
    <p
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {messages}
    </p>
  )
}

interface FormDescriptionProps {
  children?: React.ReactNode
  className?: string
  props?: React.ComponentProps<'p'>
}

export function FormDescription({
  children,
  className,
  ...props
}: FormDescriptionProps) {
  return (
    <p
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
}
