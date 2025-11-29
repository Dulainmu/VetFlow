"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"

export async function getRevenueStats() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    // Get last 6 months
    const stats = []
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        const appointments = await prisma.appointment.findMany({
            where: {
                clinicId: session.user.clinicId,
                status: "COMPLETED",
                appointmentDate: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                service: true
            }
        })

        const revenue = appointments.reduce((sum, apt) => sum + (apt.service.price || 0), 0)

        stats.push({
            name: format(date, "MMM"),
            total: revenue
        })
    }

    return stats
}

export async function getAppointmentStats() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    const appointments = await prisma.appointment.findMany({
        where: {
            clinicId: session.user.clinicId,
        },
        include: {
            service: true
        }
    })

    const serviceCounts: Record<string, number> = {}
    appointments.forEach(apt => {
        const serviceName = apt.service.name
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
    })

    return Object.entries(serviceCounts).map(([name, value]) => ({
        name,
        value
    }))
}
