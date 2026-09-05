import * as React from "react"

import { cn } from "~/lib/utils"

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

function Slot({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null
  }

  const child = children as React.ReactElement<SlotProps>
  const childProps = child.props

  return React.cloneElement(child, {
    ...childProps,
    ...props,
    className: cn(
      typeof childProps.className === "string" ? childProps.className : "",
      typeof props.className === "string" ? props.className : ""
    ),
    style: {
      ...(typeof childProps.style === "object" ? childProps.style : {}),
      ...(typeof props.style === "object" ? props.style : {}),
    },
    id: props.id ?? childProps.id,
    "aria-describedby":
      props["aria-describedby"] ?? childProps["aria-describedby"],
    "aria-invalid": props["aria-invalid"] ?? childProps["aria-invalid"],
  } as any)
}

export { Slot }
