import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Toggle } from "@base-ui/react/toggle"

import { cn } from "~/lib/utils"
import { toggleVariants } from "~/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
    value: readonly string[]
    setValue?: (value: string, pressed: boolean) => void
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
  value: [],
  setValue: undefined,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  multiple = false,
  ...props
}: React.ComponentProps<"div"> & {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  disabled?: boolean
} &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  const [valueState, setValueState] = React.useState<readonly string[]>(defaultValue)
  const value = valueProp ?? valueState

  const setValue = (itemValue: string, pressed: boolean) => {
    const nextValue = multiple
      ? pressed
        ? [...value, itemValue].filter((item, index, items) => items.indexOf(item) === index)
        : value.filter((item) => item !== itemValue)
      : pressed
        ? [itemValue]
        : []
    if (valueProp === undefined) setValueState(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <div
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation, value, setValue }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof Toggle> &
  VariantProps<typeof toggleVariants> & {
    value?: string
  }) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <Toggle
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      pressed={context.value?.includes(props.value ?? "")}
      onPressedChange={(pressed) => {
        if (props.value) context.setValue?.(props.value, pressed)
      }}
      {...props}
    >
      {children}
    </Toggle>
  )
}

export { ToggleGroup, ToggleGroupItem }
