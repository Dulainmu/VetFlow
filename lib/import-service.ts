"use server"

import { prisma } from "@/lib/prisma"
import Papa from "papaparse"
import bcrypt from "bcryptjs"

interface ImportRow {
    OwnerFirstName: string
    OwnerLastName: string
    OwnerEmail: string
    OwnerPhone: string
    PetName: string
    PetSpecies: string
    PetBreed: string
    PetGender: string
    PetAge?: string
}

import { auth } from "@/auth"

// ... 

export async function importClientsAndPets(csvContent: string, _unusedClinicId?: string) {
    try {
        const session = await auth()
        if (!session?.user?.clinicId || session.user.role !== 'CLINIC_ADMIN') {
            return { success: false, error: "Unauthorized: Admins only" }
        }
        const clinicId = session.user.clinicId

        const { data, errors } = Papa.parse<ImportRow>(csvContent, {
            header: true,
            skipEmptyLines: true
        })

        if (errors.length > 0) {
            console.error("CSV Parse Errors:", errors)
            return { success: false, error: "Invalid CSV Format" }
        }

        let successCount = 0
        let failureCount = 0

        // Process sequentially (could optimize with Promise.all but reliability first)
        for (const row of data) {
            try {
                if (!row.OwnerEmail || !row.PetName) {
                    failureCount++
                    continue
                }

                // 1. Find or Create Owner
                let owner = await prisma.user.findUnique({
                    where: { email: row.OwnerEmail }
                })

                if (!owner) {
                    const hashedPassword = await bcrypt.hash("temp1234", 10) // Temporary password
                    owner = await prisma.user.create({
                        data: {
                            firstName: row.OwnerFirstName,
                            lastName: row.OwnerLastName || "",
                            email: row.OwnerEmail,
                            phone: row.OwnerPhone || "",
                            role: 'PET_OWNER',
                            clinicId: clinicId,
                            password: hashedPassword,
                            isActive: true
                        }
                    })
                }

                // 2. Create Pet
                await prisma.pet.create({
                    data: {
                        name: row.PetName,
                        species: (row.PetSpecies?.toUpperCase() as any) || 'DOG',
                        breed: row.PetBreed || "Unknown",
                        gender: (row.PetGender?.toUpperCase() as any) || 'UNKNOWN',
                        dateOfBirth: row.PetAge ? new Date(new Date().getFullYear() - parseInt(row.PetAge), 0, 1) : undefined, // Approx DOB
                        ownerId: owner.id,
                        clinicId: clinicId
                    }
                })

                successCount++
            } catch (err) {
                console.error("Import Error Row:", row, err)
                failureCount++
            }
        }

        return { success: true, count: successCount, failures: failureCount }

    } catch (error) {
        console.error("Import Failed:", error)
        return { success: false, error: "System Error" }
    }
}
