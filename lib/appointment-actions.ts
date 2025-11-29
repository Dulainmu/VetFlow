"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AppointmentStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
    include: {
        pet: {
            include: {
                owner: true
            }
        }
        service: true
        vet: true
    }
}>

export async function getAppointments({
    clinicId,
    date,
    vetId,
    status,
    page = 1,
    limit = 10,
}: {
    clinicId: string
    date?: Date
    vetId?: string
    status?: AppointmentStatus
    page?: number
    limit?: number
}) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }

    const skip = (page - 1) * limit

    const where: Prisma.AppointmentWhereInput = {
        clinicId,
        ...(date && {
            appointmentDate: {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lt: new Date(date.setHours(23, 59, 59, 999)),
            },
        }),
        ...(vetId && { vetId }),
        ...(status && { status }),
    }

    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            include: {
                pet: {
                    include: {
                        owner: true,
                    },
                },
                service: true,
                vet: true,
            },
            orderBy: {
                appointmentDate: "asc",
            },
            skip,
            take: limit,
        }),
        prisma.appointment.count({ where }),
    ])

    return {
        appointments,
        total,
        totalPages: Math.ceil(total / limit),
    }
}

export async function updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.appointment.update({
            where: {
                id: appointmentId,
                clinicId: session.user.clinicId, // Ensure ownership
            },
            data: { status },
        })

        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to update appointment status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function searchOwners(clinicId: string, query: string) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }

    const owners = await prisma.user.findMany({
        where: {
            clinicId,
            role: "PET_OWNER",
            OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { mobile: { contains: query, mode: "insensitive" } },
            ],
        },
        take: 5,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
        },
    })

    return owners
}

export async function getPetsForOwner(ownerId: string) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        throw new Error("Unauthorized")
    }

    const pets = await prisma.pet.findMany({
        where: {
            ownerId,
            clinicId: session.user.clinicId,
        },
        select: {
            id: true,
            name: true,
            species: true,
        },
    })

    return pets
}

export async function createManualAppointment(data: {
    clinicId: string
    ownerId: string
    petId: string
    serviceId: string
    vetId: string
    date: Date
    notes?: string
}) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== data.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Get service duration
        const service = await prisma.service.findUnique({
            where: { id: data.serviceId },
        })

        if (!service) {
            return { success: false, error: "Service not found" }
        }

        await prisma.appointment.create({
            data: {
                clinicId: data.clinicId,
                petId: data.petId,
                vetId: data.vetId,
                serviceId: data.serviceId,
                bookedById: session.user.id, // Booked by Admin/Staff
                appointmentDate: data.date,
                duration: service.duration,
                status: "CONFIRMED",
                internalNotes: data.notes,
                bookingSource: "ADMIN", // Explicitly set source
            },
        })

        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Manual booking failed:", error)
        return { success: false, error: "Failed to create appointment" }
    }
}

export async function createAvailabilityRule(data: {
    clinicId: string
    vetId: string
    startDate: Date
    endDate: Date
    type: "BLOCKED" | "VACATION"
    notes?: string
}) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== data.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.availabilityRule.create({
            data: {
                clinicId: data.clinicId,
                vetId: data.vetId,
                startDate: data.startDate,
                endDate: data.endDate,
                type: data.type,
                notes: data.notes,
                isActive: true,
            },
        })

        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to create availability rule:", error)
        return { success: false, error: "Failed to block time" }
    }
}

export async function getAvailabilityRules(clinicId: string, date: Date) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const rules = await prisma.availabilityRule.findMany({
        where: {
            clinicId,
            isActive: true,
            OR: [
                {
                    // Starts today
                    startDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                {
                    // Ends today
                    endDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                {
                    // Spans across today
                    startDate: { lt: startOfDay },
                    endDate: { gt: endOfDay },
                },
            ],
        },
        include: {
            vet: true,
        },
    })

    return rules
}

export async function updateAppointmentTime(
    id: string,
    newDate: Date,
    newDuration?: number
) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.appointment.update({
            where: {
                id,
                clinicId: session.user.clinicId,
            },
            data: {
                appointmentDate: newDate,
                duration: newDuration, // Optional update if resized
            },
        })

        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to update appointment time:", error)
        return { success: false, error: "Failed to update appointment" }
    }
}
