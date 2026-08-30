"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "~/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  delay,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  delayDuration?: number
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay ?? delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" {...props}>
      {children}
    </TooltipPrimitive.Root>
  )
}

function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      ...(child.props as Record<string, unknown>),
      "data-slot": "tooltip-trigger",
    })
  }

  return (
    <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...(props as any)}>
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 0,
  align = "center",
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  hidden?: boolean
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-[var(--transform-origin)] items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...(props as any)}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
