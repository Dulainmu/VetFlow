"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    Stethoscope,
    PawPrint,
    BarChart3,
    Upload,
    Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Appointments",
        icon: Calendar,
        href: "/dashboard/appointments",
        color: "text-sky-500",
    },
    {
        label: "Clients",
        icon: Users,
        href: "/dashboard/clients",
        color: "text-pink-700",
    },
    {
        label: "Pets",
        icon: PawPrint,
        href: "/dashboard/pets",
        color: "text-orange-500",
    },
    {
        label: "Staff",
        icon: Users,
        href: "/dashboard/settings/staff",
        color: "text-green-600",
    },
    {
        label: "My Schedule",
        icon: Truck,
        href: "/dashboard/driver/schedule",
        color: "text-orange-600",
        roles: ["DRIVER", "VET"], // Only show to drivers and vets
    },
    {
        label: "Data Import",
        icon: Upload,
        href: "/dashboard/settings/import",
        color: "text-purple-500",
    },
    {
        label: "Reports",
        icon: BarChart3,
        href: "/dashboard/reports",
        color: "text-emerald-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <Stethoscope className="w-8 h-8 text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        VetFlow
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.startsWith(route.href) && route.href !== "/dashboard" || pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
