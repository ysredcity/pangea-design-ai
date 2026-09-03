import type { ComponentProps } from "react"

import { Button } from "../ui/button"
import { cn } from "../lib/utils"

export function IconButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("rounded-full", className)}
      {...props}
    />
  )
}
