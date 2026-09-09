import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'
import { FieldGroup, Field, FieldLabel } from '~/components/ui/field'
import { DialogFooter } from '~/components/ui/dialog'

export function FormItemGroup({
  children,
  className,
}: React.ComponentProps<typeof FieldGroup>) {
  return <FieldGroup className={className}>{children}</FieldGroup>
}

export function FormItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Field>) {
  return (
    <Field className={className} {...props}>
      {children}
    </Field>
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
    <FieldLabel
      className={cn(error && 'text-destructive', className)}
      {...props}
    >
      {children}
    </FieldLabel>
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
  const { t } = useTranslation()

  if (!message) return null

  const messages = typeof message === 'string' ? [message] : message

  return (
    <p className={cn('text-destructive text-[0.8rem]', className)} {...props}>
      {messages.map((value, index) => (
        <React.Fragment key={`${value}-${index}`}>
          {index > 0 && <br />}
          {t(value)}
        </React.Fragment>
      ))}
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
      className={cn('text-muted-foreground text-[0.8rem]', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function FormFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter {...props}>{children}</DialogFooter>
}
