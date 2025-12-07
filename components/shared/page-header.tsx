"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode // Action buttons slot
    className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-down",
            className
        )}>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2 shrink-0">
                    {children}
                </div>
            )}
        </div>
    )
}
