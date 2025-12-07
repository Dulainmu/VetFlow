"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
    title?: string
    description?: string
    children: ReactNode
    className?: string
    contentClassName?: string
    hover?: boolean
    delay?: number // animation delay in ms
}

export function AnimatedCard({
    title,
    description,
    children,
    className,
    contentClassName,
    hover = true,
    delay = 0
}: AnimatedCardProps) {
    return (
        <Card
            className={cn(
                "animate-scale-in",
                hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    )
}
