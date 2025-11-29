import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export async function RecentAppointments() {
    const session = await auth()
    if (!session?.user?.clinicId) return null

    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId: session.user.clinicId,
        },
        include: {
            pet: {
                include: {
                    owner: true
                }
            },
            service: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    })

    if (appointments.length === 0) {
        return <div className="text-sm text-muted-foreground text-center py-4">No recent appointments.</div>
    }

    return (
        <div className="space-y-8">
            {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={apt.pet.owner.avatarUrl || ""} alt="Avatar" />
                        <AvatarFallback>{apt.pet.owner.firstName[0]}{apt.pet.owner.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{apt.pet.owner.firstName} {apt.pet.owner.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                            {apt.pet.name} • {apt.service.name}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                        <div className="flex flex-col items-end gap-1">
                            <span>{format(apt.appointmentDate, "MMM d")}</span>
                            <Badge variant={
                                apt.status === "CONFIRMED" ? "default" :
                                    apt.status === "COMPLETED" ? "secondary" :
                                        apt.status === "CANCELED" ? "destructive" : "outline"
                            } className="text-[10px] px-1 py-0 h-5">
                                {apt.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
