import * as React from "react"
import { PreviewCard as HoverCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "~/lib/utils"

function HoverCard({
  children,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardPrimitive.Root>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <HoverCardPrimitive.Root data-slot="hover-card" {...props}>
      {children}
    </HoverCardPrimitive.Root>
  )
}

function HoverCardTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      ...(child.props as Record<string, unknown>),
      "data-slot": "hover-card-trigger",
    })
  }

  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...(props as any)}>
      {children}
    </HoverCardPrimitive.Trigger>
  )
}

function HoverCardContent({
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
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Positioner align={align} sideOffset={sideOffset}>
        <HoverCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-64 origin-[var(--transform-origin)] rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...(props as any)}
        >
          {children}
        </HoverCardPrimitive.Popup>
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
