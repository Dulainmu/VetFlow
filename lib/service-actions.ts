"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    duration: z.number().min(5, "Duration must be at least 5 minutes"),
    price: z.number().min(0, "Price cannot be negative"),
    color: z.string().optional(),
})

export async function getServices(clinicId: string) {
    const session = await auth()
    if (!session?.user || session.user.clinicId !== clinicId) {
        throw new Error("Unauthorized")
    }

    const services = await prisma.service.findMany({
        where: {
            clinicId,
            isActive: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    return services
}

export async function createService(data: z.infer<typeof serviceSchema>) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const validated = serviceSchema.parse(data)

        await prisma.service.create({
            data: {
                clinicId: session.user.clinicId,
                name: validated.name,
                description: validated.description,
                duration: validated.duration,
                price: validated.price,
                color: validated.color || "#3b82f6",
                isActive: true,
                allowOnlineBooking: true,
            },
        })

        revalidatePath("/dashboard/settings")
        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to create service:", error)
        return { success: false, error: "Failed to create service" }
    }
}

export async function updateService(id: string, data: z.infer<typeof serviceSchema>) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const validated = serviceSchema.parse(data)

        await prisma.service.update({
            where: {
                id,
                clinicId: session.user.clinicId,
            },
            data: {
                name: validated.name,
                description: validated.description,
                duration: validated.duration,
                price: validated.price,
                color: validated.color,
            },
        })

        revalidatePath("/dashboard/settings")
        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to update service:", error)
        return { success: false, error: "Failed to update service" }
    }
}

export async function deleteService(id: string) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Soft delete by setting isActive to false
        await prisma.service.update({
            where: {
                id,
                clinicId: session.user.clinicId,
            },
            data: {
                isActive: false,
            },
        })

        revalidatePath("/dashboard/settings")
        revalidatePath("/dashboard/appointments")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete service:", error)
        return { success: false, error: "Failed to delete service" }
    }
}
