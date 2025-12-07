"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AvailabilityType } from "@prisma/client"

export async function createAvailabilityRule(data: {
    vetId?: string
    startDate: Date
    endDate: Date
    type: AvailabilityType
    notes?: string
}) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.availabilityRule.create({
            data: {
                clinicId: session.user.clinicId,
                vetId: data.vetId,
                startDate: data.startDate,
                endDate: data.endDate,
                type: data.type,
                notes: data.notes,
                isActive: true,
            },
        })

        revalidatePath("/dashboard/settings/availability")
        return { success: true }
    } catch (error) {
        console.error("Failed to create rule:", error)
        return { success: false, error: "Failed to create rule" }
    }
}

export async function getAvailabilityRules() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    try {
        return await prisma.availabilityRule.findMany({
            where: {
                clinicId: session.user.clinicId,
                isActive: true
            },
            include: { vet: true },
            orderBy: { startDate: "desc" },
        })
    } catch (error) {
        console.error("Failed to fetch rules:", error)
        return []
    }
}

export async function deleteAvailabilityRule(id: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.availabilityRule.update({
            where: { id, clinicId: session.user.clinicId },
            data: { isActive: false } // Soft delete
        })

        revalidatePath("/dashboard/settings/availability")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete rule:", error)
        return { success: false, error: "Failed to delete rule" }
    }
}
