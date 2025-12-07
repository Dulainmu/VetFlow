import { Metadata } from "next"
import { Calendar, DollarSign, PawPrint, Plus, UserPlus, Users } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

import { PageHeader, PageContainer, StaggerGrid, AnimatedCard } from "@/components/shared"
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
        <PageContainer>
            <PageHeader
                title="Dashboard"
                description={`Welcome back, Dr. ${session.user.lastName}. Here's what's happening today.`}
            >
                <Button asChild variant="outline" className="card-hover">
                    <Link href="/dashboard/clients/new">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Client
                    </Link>
                </Button>
                <Button asChild variant="outline" className="card-hover">
                    <Link href="/dashboard/pets/new">
                        <PawPrint className="mr-2 h-4 w-4" />
                        Add Pet
                    </Link>
                </Button>
                <Button asChild className="card-hover">
                    <Link href="/dashboard/appointments">
                        <Plus className="mr-2 h-4 w-4" />
                        Book Appointment
                    </Link>
                </Button>
            </PageHeader>

            <StaggerGrid cols={4}>
                <StatsCard
                    title="Total Revenue"
                    value="Rs. 45,231"
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
            </StaggerGrid>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 stagger-children">
                <AnimatedCard
                    title="Overview"
                    description="Monthly appointment volume."
                    className="col-span-4"
                    delay={100}
                >
                    <OverviewChart />
                </AnimatedCard>
                <AnimatedCard
                    title="Recent Activity"
                    description="Latest appointments booked."
                    className="col-span-3"
                    delay={150}
                >
                    <RecentAppointments />
                </AnimatedCard>
            </div>
        </PageContainer>
    )
}
