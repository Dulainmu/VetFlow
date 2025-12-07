import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, User, PawPrint } from "lucide-react"
import { CompleteVisitButton } from "@/components/driver/complete-visit-button"
import { PageHeader, PageContainer } from "@/components/shared"

export default async function DriverSchedulePage() {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    // Drivers see their assigned appointments (by resource)
    // For now, show all appointments for today that have a resource assigned
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId: session.user.clinicId,
            appointmentDate: {
                gte: today,
                lt: tomorrow,
            },
            resourceId: { not: null }, // Only mobile appointments
            status: { in: ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"] },
        },
        include: {
            pet: {
                include: { owner: true },
            },
            service: true,
            resource: true,
        },
        orderBy: { appointmentDate: "asc" },
    })

    return (
        <PageContainer className="max-w-2xl mx-auto">
            <PageHeader
                title="My Schedule"
                description={`${format(today, "EEEE, MMMM d, yyyy")} • ${appointments.length} visits`}
            />

            {appointments.length === 0 ? (
                <Card className="animate-fade-in">
                    <CardContent className="py-12 text-center">
                        <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No visits scheduled</p>
                        <p className="text-muted-foreground">Check back later for new assignments.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt, idx) => (
                        <Card
                            key={apt.id}
                            className="animate-slide-up card-hover"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Time */}
                                        <div className="flex items-center gap-2 text-lg font-bold text-primary">
                                            <Clock className="h-5 w-5" />
                                            {format(new Date(apt.appointmentDate), "h:mm a")}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                ({apt.duration} min)
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">
                                                    {apt.pet.owner.address || "Address not provided"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {apt.pet.owner.city}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Owner & Pet */}
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-medium">
                                                {apt.pet.owner.firstName} {apt.pet.owner.lastName}
                                            </span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="flex items-center gap-1">
                                                <PawPrint className="h-4 w-4" />
                                                {apt.pet.name} ({apt.pet.species})
                                            </span>
                                        </div>

                                        {/* Service */}
                                        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                            {apt.service.name}
                                        </div>

                                        {/* Resource/Vehicle */}
                                        {apt.resource && (
                                            <p className="text-sm text-muted-foreground">
                                                Vehicle: {apt.resource.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Complete Button */}
                                    <CompleteVisitButton
                                        appointmentId={apt.id}
                                        isCompleted={apt.status === "COMPLETED"}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    )
}
