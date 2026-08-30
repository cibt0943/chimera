"use client"

import * as React from "react"
import {
  DirectionProvider as BaseDirectionProvider,
  useDirection,
} from "@base-ui/react/direction-provider"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof BaseDirectionProvider> & {
  dir?: "ltr" | "rtl"
}) {
  return <BaseDirectionProvider direction={direction ?? dir}>{children}</BaseDirectionProvider>
}

export { DirectionProvider, useDirection }
