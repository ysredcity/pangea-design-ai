import type { ComponentProps } from "react"

import { Button } from "../ui/button"
import { cn } from "../lib/utils"

/** Compact pill-shaped action used by content and workspace toolbars. */
export function PillButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button variant="ghost" size="sm" className={cn("rounded-full", className)} {...props} />
}
