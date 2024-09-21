import * as React from 'react'
import { cn } from '~/lib/utils'
import { Label } from '~/components/ui/label'
import { DialogFooter } from '~/components/ui/dialog'

export function FormItem({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

export interface FormLabelProps extends React.ComponentProps<'label'> {
  error?: object
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
export interface FormMessageProps extends React.ComponentProps<'p'> {
  message?: string[] | string
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

export function FormDescription({
  children,
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function FormFooter({
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return <DialogFooter {...props}>{children}</DialogFooter>
}
