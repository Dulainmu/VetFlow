"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ResourceType } from "@prisma/client"

export async function createResource(data: {
    name: string
    type: ResourceType
}) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.resource.create({
            data: {
                clinicId: session.user.clinicId,
                name: data.name,
                type: data.type,
            },
        })

        revalidatePath("/dashboard/settings/resources")
        return { success: true }
    } catch (error) {
        console.error("Failed to create resource:", error)
        return { success: false, error: "Failed to create resource" }
    }
}

export async function getResources() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    try {
        return await prisma.resource.findMany({
            where: { clinicId: session.user.clinicId },
            orderBy: { name: "asc" },
        })
    } catch (error) {
        console.error("Failed to fetch resources:", error)
        return []
    }
}

export async function deleteResource(id: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.resource.delete({
            where: { id, clinicId: session.user.clinicId },
        })

        revalidatePath("/dashboard/settings/resources")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete resource:", error)
        return { success: false, error: "Failed to delete resource" }
    }
}

// ==== Public Holidays ====

export async function getPublicHolidays() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    try {
        return await prisma.publicHoliday.findMany({
            where: { clinicId: session.user.clinicId },
            orderBy: { date: "asc" },
        })
    } catch (error) {
        console.error("Failed to fetch holidays:", error)
        return []
    }
}

export async function createPublicHoliday(data: {
    name: string
    date: Date
}) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.publicHoliday.create({
            data: {
                clinicId: session.user.clinicId,
                name: data.name,
                date: data.date,
            },
        })

        revalidatePath("/dashboard/settings/holidays")
        return { success: true }
    } catch (error) {
        console.error("Failed to create holiday:", error)
        return { success: false, error: "Failed to create holiday" }
    }
}

export async function deletePublicHoliday(id: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        await prisma.publicHoliday.delete({
            where: { id, clinicId: session.user.clinicId },
        })

        revalidatePath("/dashboard/settings/holidays")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete holiday:", error)
        return { success: false, error: "Failed to delete holiday" }
    }
}

