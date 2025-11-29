"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createMedicalRecordSchema = z.object({
    petId: z.string().min(1),
    visitDate: z.string(), // YYYY-MM-DD
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatment: z.string().optional(),
    notes: z.string().optional(),
    weight: z.coerce.number().optional(),
    temperature: z.coerce.number().optional(),
    heartRate: z.coerce.number().optional(),
})

export async function createMedicalRecord(data: z.infer<typeof createMedicalRecordSchema>) {
    const session = await auth()
    if (!session?.user?.clinicId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const validated = createMedicalRecordSchema.parse(data)

        await prisma.medicalRecord.create({
            data: {
                clinicId: session.user.clinicId,
                petId: validated.petId,
                vetId: session.user.id, // Assuming the logged-in user is the vet
                visitDate: new Date(validated.visitDate),
                diagnosis: validated.diagnosis,
                treatment: validated.treatment,
                notes: validated.notes,
                weight: validated.weight,
                temperature: validated.temperature,
                heartRate: validated.heartRate,
            }
        })

        // Update pet weight if provided
        if (validated.weight) {
            await prisma.pet.update({
                where: { id: validated.petId },
                data: { weight: validated.weight }
            })
        }

        revalidatePath(`/dashboard/pets/${validated.petId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to create medical record:", error)
        return { success: false, error: "Failed to create medical record" }
    }
}
