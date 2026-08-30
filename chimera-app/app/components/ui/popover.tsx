import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "~/lib/utils"

function Popover({
  children,
  ...props
}: Omit<React.ComponentProps<typeof PopoverPrimitive.Root>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <PopoverPrimitive.Root data-slot="popover" {...props}>
      {children}
    </PopoverPrimitive.Root>
  )
}

function PopoverTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      ...(child.props as Record<string, unknown>),
      "data-slot": "popover-trigger",
    })
  }

  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" {...(props as any)}>
      {children}
    </PopoverPrimitive.Trigger>
  )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 origin-[var(--transform-origin)] flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...(props as any)}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  asChild = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      ...(child.props as Record<string, unknown>),
      "data-slot": "popover-anchor",
    })
  }

  return <div data-slot="popover-anchor" {...props}>{children}</div>
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
