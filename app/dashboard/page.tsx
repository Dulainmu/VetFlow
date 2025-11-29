import { Metadata } from "next"
import { Activity, Calendar, CreditCard, DollarSign, PawPrint, Plus, UserPlus, Users } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { RecentAppointments } from "@/components/dashboard/recent-appointments"
import { StatsCard } from "@/components/dashboard/stats-cards"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Clinic overview and statistics.",
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    // Fetch real stats
    const [
        totalAppointments,
        totalClients,
        totalPets,
        todayAppointments
    ] = await Promise.all([
        prisma.appointment.count({ where: { clinicId: session.user.clinicId } }),
        prisma.user.count({ where: { clinicId: session.user.clinicId, role: "PET_OWNER" } }),
        prisma.pet.count({ where: { clinicId: session.user.clinicId, isActive: true } }),
        prisma.appointment.count({
            where: {
                clinicId: session.user.clinicId,
                appointmentDate: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        }),
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, Dr. {session.user.lastName}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/clients/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/pets/new">
                            <PawPrint className="mr-2 h-4 w-4" />
                            Add Pet
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/appointments">
                            <Plus className="mr-2 h-4 w-4" />
                            Book Appointment
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value="$45,231.89"
                    icon={DollarSign}
                    description="+20.1% from last month"
                    trend="up"
                    trendValue="20.1%"
                />
                <StatsCard
                    title="Active Clients"
                    value={totalClients.toString()}
                    icon={Users}
                    description="Total registered owners"
                    trend="neutral"
                />
                <StatsCard
                    title="Total Pets"
                    value={totalPets.toString()}
                    icon={PawPrint}
                    description="Active pets in clinic"
                    trend="up"
                    trendValue="+12"
                />
                <StatsCard
                    title="Appointments Today"
                    value={todayAppointments.toString()}
                    icon={Calendar}
                    description="Scheduled for today"
                    trend="neutral"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Monthly appointment volume.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest appointments booked.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentAppointments />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
