"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createVaccinationSchema = z.object({
    petId: z.string().min(1),
    vaccineName: z.string().min(1, "Vaccine name is required"),
    dateGiven: z.string(), // YYYY-MM-DD
    nextDueDate: z.string().optional(), // YYYY-MM-DD
    batchNumber: z.string().optional(),
    notes: z.string().optional(),
})

export async function createVaccination(data: z.infer<typeof createVaccinationSchema>) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const validated = createVaccinationSchema.parse(data)

        await prisma.vaccination.create({
            data: {
                petId: validated.petId,
                vaccineName: validated.vaccineName,
                dateGiven: new Date(validated.dateGiven),
                nextDueDate: validated.nextDueDate ? new Date(validated.nextDueDate) : undefined,
                batchNumber: validated.batchNumber,
                notes: validated.notes,
                givenBy: session.user.lastName || session.user.email || "Unknown", // Simple string for now
            }
        })

        revalidatePath(`/dashboard/pets/${validated.petId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to create vaccination:", error)
        return { success: false, error: "Failed to create vaccination" }
    }
}
