import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Role badges
        "super-admin": "bg-blue-100 text-blue-800",
        "course-admin": "bg-purple-100 text-purple-800",
        "site-admin": "bg-orange-100 text-orange-800",
        "user": "bg-green-100 text-green-800",
        // Status badges
        "active": "bg-green-100 text-green-800",
        "inactive": "bg-red-100 text-red-800",
        // Course type badges
        "public": "bg-green-500 text-white",
        "private": "bg-red-500 text-white",
        "resort": "bg-yellow-500 text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
