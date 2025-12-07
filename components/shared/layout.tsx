"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
    children: ReactNode
    className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div className={cn("flex-1 space-y-6 p-8 pt-6", className)}>
            {children}
        </div>
    )
}

interface StaggerGridProps {
    children: ReactNode
    cols?: 2 | 3 | 4
    className?: string
}

export function StaggerGrid({ children, cols = 4, className }: StaggerGridProps) {
    const colsClass = {
        2: "md:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3",
        4: "md:grid-cols-2 lg:grid-cols-4"
    }

    return (
        <div className={cn(
            "grid gap-4 stagger-children",
            colsClass[cols],
            className
        )}>
            {children}
        </div>
    )
}
