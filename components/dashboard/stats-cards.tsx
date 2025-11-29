import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string
    icon: LucideIcon
    description: string
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    className?: string
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue,
    className
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {trend === "up" && <span className="text-emerald-500 mr-1">↑ {trendValue}</span>}
                    {trend === "down" && <span className="text-rose-500 mr-1">↓ {trendValue}</span>}
                    <span>{description}</span>
                </div>
            </CardContent>
        </Card>
    )
}
