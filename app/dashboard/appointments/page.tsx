import { auth } from "@/auth"
import { getAppointments, getAvailabilityRules } from "@/lib/appointment-actions"
import { columns } from "@/components/appointments/columns"
import { DataTable } from "@/components/appointments/data-table"
import { redirect } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CreateAppointmentDialog } from "@/components/appointments/create-appointment-dialog"
import { CalendarView } from "@/components/appointments/calendar-view"
import { BlockTimeDialog } from "@/components/appointments/block-time-dialog"
import { PageHeader, PageContainer } from "@/components/shared"


export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: { date?: string; page?: string; view?: string }
}) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        redirect("/login")
    }

    const date = searchParams.date ? new Date(searchParams.date) : new Date()
    const page = Number(searchParams.page) || 1
    const view = searchParams.view || "list"

    // Fetch appointments
    const { appointments, totalPages } = await getAppointments({
        clinicId: session.user.clinicId,
        date,
        page: view === "calendar" ? 1 : page,
        limit: view === "calendar" ? 100 : 10,
    })

    // Fetch data for create dialog and calendar
    const [services, vets, availabilityRules] = await Promise.all([
        prisma.service.findMany({
            where: { clinicId: session.user.clinicId, isActive: true },
        }),
        prisma.user.findMany({
            where: {
                clinicId: session.user.clinicId,
                role: "VET",
                isActive: true
            },
        }),
        getAvailabilityRules(session.user.clinicId, date),
    ])

    // Helper to change date
    const prevDate = new Date(date)
    prevDate.setDate(prevDate.getDate() - 1)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    return (
        <PageContainer>
            <PageHeader title="Appointments">
                <BlockTimeDialog clinicId={session.user.clinicId} vets={vets} />
                <CreateAppointmentDialog
                    clinicId={session.user.clinicId}
                    services={services}
                    vets={vets}
                />
            </PageHeader>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" asChild className="card-hover">
                        <Link href={`?date=${format(prevDate, "yyyy-MM-dd")}&view=${view}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center border rounded-md px-3 py-2 bg-background">
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        <span className="text-sm font-medium">
                            {format(date, "EEEE, MMMM do, yyyy")}
                        </span>
                    </div>
                    <Button variant="outline" size="icon" asChild className="card-hover">
                        <Link href={`?date=${format(nextDate, "yyyy-MM-dd")}&view=${view}`}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`?date=${format(new Date(), "yyyy-MM-dd")}&view=${view}`}>
                            Today
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                    <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="sm"
                        asChild
                    >
                        <Link href={`?date=${format(date, "yyyy-MM-dd")}&view=list`}>
                            <List className="mr-2 h-4 w-4" /> List
                        </Link>
                    </Button>
                    <Button
                        variant={view === "calendar" ? "secondary" : "ghost"}
                        size="sm"
                        asChild
                    >
                        <Link href={`?date=${format(date, "yyyy-MM-dd")}&view=calendar`}>
                            <LayoutGrid className="mr-2 h-4 w-4" /> Calendar
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="animate-scale-in">
                {view === "list" ? (
                    <DataTable columns={columns} data={appointments} />
                ) : (
                    <CalendarView
                        date={date}
                        appointments={appointments}
                        availabilityRules={availabilityRules as any}
                        vets={vets}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    asChild
                >
                    <Link href={`?date=${format(date, "yyyy-MM-dd")}&page=${page - 1}&view=${view}`}>
                        Previous
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild
                >
                    <Link href={`?date=${format(date, "yyyy-MM-dd")}&page=${page + 1}&view=${view}`}>
                        Next
                    </Link>
                </Button>
            </div>
        </PageContainer>
    )
}
