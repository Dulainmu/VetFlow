"use server"

import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, addMinutes, format, parse, isBefore, isAfter, set } from "date-fns"
import { Appointment, User } from "@prisma/client"
import { sendAppointmentConfirmation } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function getServices(clinicSlug: string) {
    try {
        console.log(`[getServices] Fetching services for clinic slug: ${clinicSlug}`)
        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug },
            select: { id: true }
        })

        if (!clinic) {
            console.warn(`[getServices] Clinic not found for slug: ${clinicSlug}`)
            return []
        }

        const services = await prisma.service.findMany({
            where: {
                clinicId: clinic.id,
                isActive: true,
                allowOnlineBooking: true
            },
            orderBy: {
                name: 'asc',
            },
        })

        console.log(`[getServices] Found ${services.length} services for clinic: ${clinicSlug}`)
        return services
    } catch (error) {
        console.error("Failed to fetch services:", error)
        // Re-throw or return empty? Returning empty hides the error.
        // Let's return empty but ensure it's logged.
        return []
    }
}

export async function getVets(clinicSlug: string) {
    try {
        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug },
            select: { id: true }
        })

        if (!clinic) return []

        const vets = await prisma.user.findMany({
            where: {
                clinicId: clinic.id,
                role: 'VET',
                availableForBooking: true,
                isActive: true
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
            }
        })

        // Map to the format expected by the frontend
        return vets.map((vet) => ({
            id: vet.id,
            name: `${vet.firstName} ${vet.lastName}`,
            image: vet.avatarUrl,
            role: vet.role
        }))
    } catch (error) {
        console.error("Failed to fetch vets:", error)
        return []
    }
}

export async function getAvailableSlots(date: Date, clinicSlug: string, serviceId: string, vetId?: string) {
    try {
        // 1. Fetch Clinic, Service, and Holidays
        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug },
            include: {
                users: {
                    where: { role: 'VET', isActive: true, availableForBooking: true }
                },
                publicHolidays: {
                    where: { date: startOfDay(date) }
                },
                resources: {
                    where: { isActive: true }
                }
            }
        })

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                resources: {
                    include: { resource: true }
                }
            }
        })

        if (!clinic || !service) return []

        // 2. Check for Public Holiday
        if (clinic.publicHolidays.length > 0) {
            console.log(`[getAvailableSlots] Date ${date} is a public holiday: ${clinic.publicHolidays[0].name}`)
            return []
        }

        // 3. Determine Business Hours for the day
        const dayOfWeek = format(date, 'EEEE').toLowerCase() // 'monday', 'tuesday', etc.
        const businessHours = clinic.businessHours as any
        const dayConfig = businessHours[dayOfWeek]

        if (!dayConfig || dayConfig.closed) return []

        // Parse open/close times
        const openTime = parse(dayConfig.open, 'HH:mm', date)
        const closeTime = parse(dayConfig.close, 'HH:mm', date)
        const now = new Date()

        // 4. Fetch Existing Appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                clinicId: clinic.id,
                appointmentDate: {
                    gte: startOfDay(date),
                    lt: endOfDay(date)
                },
                status: {
                    notIn: ['CANCELED', 'NO_SHOW', 'PENDING']
                }
            },
            include: {
                resources: true // Include booked resources
            }
        })

        // 5. Generate Slots
        const slots: string[] = []
        const interval = 30 // minutes
        let currentSlot = openTime

        // If today, don't show past slots
        if (isSameDay(date, now)) {
            const earliestSlot = addMinutes(now, 60)
            if (isAfter(earliestSlot, currentSlot)) {
                const remainder = earliestSlot.getMinutes() % interval
                currentSlot = addMinutes(earliestSlot, remainder === 0 ? 0 : interval - remainder)
            }
        }

        // Required Resources for this Service
        const requiredResources = service.resources.map(sr => sr.resource)

        while (isBefore(addMinutes(currentSlot, service.duration), closeTime) || currentSlot.getTime() === closeTime.getTime()) {
            const slotEnd = addMinutes(currentSlot, service.duration)

            let isSlotAvailable = false

            // Check Resource Availability
            let resourcesAvailable = true
            if (requiredResources.length > 0) {
                // For each required resource type, check if we have an available instance
                // This is a simplified check: assumes we need 1 of each required resource type
                // In a real app, we'd match specific resource IDs or types more robustly

                // Group required resources by type (e.g. ROOM, EQUIPMENT) - actually we link specific resources to services in this schema
                // So we need to check if *those specific resources* are free? 
                // Wait, usually you link a "type" requirement, but here we linked specific resources in ServiceResource.
                // Let's assume ServiceResource links specific resources (e.g. "Surgery Room 1").
                // If so, we just check if that specific resource is booked.

                for (const reqRes of requiredResources) {
                    const isResourceBooked = appointments.some(appt => {
                        const apptStart = appt.appointmentDate
                        const apptEnd = addMinutes(apptStart, appt.duration)
                        const overlaps = (
                            (currentSlot >= apptStart && currentSlot < apptEnd) ||
                            (slotEnd > apptStart && slotEnd <= apptEnd) ||
                            (currentSlot <= apptStart && slotEnd >= apptEnd)
                        )
                        // Check if this appointment uses the required resource
                        // We need to fetch appointment resources. 
                        // The schema has AppointmentResource.
                        // We included `resources` in the appointment fetch above.
                        const usesResource = appt.resources.some(ar => ar.resourceId === reqRes.id)

                        return overlaps && usesResource
                    })

                    if (isResourceBooked) {
                        resourcesAvailable = false
                        break
                    }
                }
            }

            if (resourcesAvailable) {
                if (vetId) {
                    // Specific Vet
                    const vetAppointments = appointments.filter((a: Appointment) => a.vetId === vetId)
                    const hasConflict = vetAppointments.some((appt: Appointment) => {
                        const apptStart = appt.appointmentDate
                        const apptEnd = addMinutes(apptStart, appt.duration)
                        return (
                            (currentSlot >= apptStart && currentSlot < apptEnd) ||
                            (slotEnd > apptStart && slotEnd <= apptEnd) ||
                            (currentSlot <= apptStart && slotEnd >= apptEnd)
                        )
                    })
                    isSlotAvailable = !hasConflict
                } else {
                    // Any Vet
                    const availableVets = clinic.users.filter((vet: User) => {
                        const vetAppointments = appointments.filter((a: Appointment) => a.vetId === vet.id)
                        const hasConflict = vetAppointments.some((appt: Appointment) => {
                            const apptStart = appt.appointmentDate
                            const apptEnd = addMinutes(apptStart, appt.duration)
                            return (
                                (currentSlot >= apptStart && currentSlot < apptEnd) ||
                                (slotEnd > apptStart && slotEnd <= apptEnd) ||
                                (currentSlot <= apptStart && slotEnd >= apptEnd)
                            )
                        })
                        return !hasConflict
                    })
                    isSlotAvailable = availableVets.length > 0
                }
            }

            if (isSlotAvailable) {
                slots.push(format(currentSlot, 'HH:mm'))
            }

            currentSlot = addMinutes(currentSlot, interval)
        }

        return slots

    } catch (error) {
        console.error("Failed to fetch slots:", error)
        return []
    }
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
}

export async function createBooking(data: {
    clinicSlug: string
    serviceId: string
    vetId?: string | null
    date: Date
    time: string
    details: {
        ownerName: string
        ownerEmail: string
        ownerPhone: string
        petName: string
        petSpecies: string
        petBreed: string
        petAge: string
        petGender: string
    }
    stripePaymentIntentId?: string
    password?: string // Optional password for account creation/claiming
}) {
    try {
        const clinic = await prisma.clinic.findUnique({
            where: { slug: data.clinicSlug },
            include: {
                users: {
                    where: { role: 'VET', isActive: true, availableForBooking: true }
                }
            }
        })

        if (!clinic) throw new Error("Clinic not found")

        // 1. Find or create owner
        let owner = await prisma.user.findUnique({
            where: { email: data.details.ownerEmail }
        })

        // Handle Password / Account Creation Logic
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10)

            if (owner) {
                // User exists - check if unclaimed (no password)
                if (!owner.password) {
                    // Claim account: Update password and details
                    owner = await prisma.user.update({
                        where: { id: owner.id },
                        data: {
                            firstName: data.details.ownerName.split(' ')[0],
                            lastName: data.details.ownerName.split(' ').slice(1).join(' ') || '',
                            phone: data.details.ownerPhone,
                            password: hashedPassword,
                            role: 'PET_OWNER', // Ensure role
                        }
                    })
                } else {
                    // User has password - technically shouldn't reach here if UI checks correctly,
                    // but we just proceed using the existing user (ignoring the new password)
                    // or we could throw an error. For booking flow, let's proceed but maybe log warning.
                    console.warn("Booking attempted with password for existing user with password.")
                }
            } else {
                // Create NEW user with password
                const nameParts = data.details.ownerName.split(' ')
                const firstName = nameParts[0]
                const lastName = nameParts.slice(1).join(' ') || ''

                owner = await prisma.user.create({
                    data: {
                        email: data.details.ownerEmail,
                        firstName,
                        lastName,
                        phone: data.details.ownerPhone,
                        role: 'PET_OWNER',
                        clinicId: clinic.id,
                        password: hashedPassword, // Set password
                    }
                })
            }
        } else if (!owner) {
            // No password provided, and user doesn't exist -> Create GUEST (passwordless)
            const nameParts = data.details.ownerName.split(' ')
            const firstName = nameParts[0]
            const lastName = nameParts.slice(1).join(' ') || ''

            owner = await prisma.user.create({
                data: {
                    email: data.details.ownerEmail,
                    firstName,
                    lastName,
                    phone: data.details.ownerPhone,
                    role: 'PET_OWNER',
                    clinicId: clinic.id,
                    // No password
                }
            })
        }

        // 2. Find or create pet
        // Simple check by name and owner for now
        let pet = await prisma.pet.findFirst({
            where: {
                ownerId: owner.id,
                name: { equals: data.details.petName, mode: 'insensitive' }
            }
        })

        if (!pet) {
            pet = await prisma.pet.create({
                data: {
                    name: data.details.petName,
                    species: data.details.petSpecies.toUpperCase() as any, // Simple cast for MVP
                    breed: data.details.petBreed,
                    gender: data.details.petGender.toUpperCase() as any,
                    ownerId: owner.id,
                    clinicId: clinic.id,
                }
            })
        }

        // 3. Determine Vet
        let assignedVetId = data.vetId
        const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
        if (!service) throw new Error("Service not found")

        if (!assignedVetId) {
            // Find an available vet for this slot
            const appointmentDate = parse(data.time, 'HH:mm', data.date)
            const appointmentEnd = addMinutes(appointmentDate, service.duration)

            // Get all appointments overlapping this slot
            const conflictingAppointments = await prisma.appointment.findMany({
                where: {
                    clinicId: clinic.id,
                    appointmentDate: {
                        lt: appointmentEnd
                    },
                    status: { notIn: ['CANCELED', 'NO_SHOW'] }
                }
            })

            const availableVet = clinic.users.find((vet: User) => {
                const vetAppointments = conflictingAppointments.filter((a: Appointment) => a.vetId === vet.id)
                const hasConflict = vetAppointments.some((appt: Appointment) => {
                    const apptStart = appt.appointmentDate
                    const apptEnd = addMinutes(apptStart, appt.duration)
                    return (
                        (appointmentDate >= apptStart && appointmentDate < apptEnd) ||
                        (appointmentEnd > apptStart && appointmentEnd <= apptEnd) ||
                        (appointmentDate <= apptStart && appointmentEnd >= apptEnd)
                    )
                })
                return !hasConflict
            })

            if (availableVet) {
                assignedVetId = availableVet.id
            } else {
                throw new Error("No vets available for this slot")
            }
        }

        // 4. Create appointment
        const appointmentDate = parse(data.time, 'HH:mm', data.date)

        const appointment = await prisma.appointment.create({
            data: {
                clinicId: clinic.id,
                petId: pet.id,
                vetId: assignedVetId,
                serviceId: data.serviceId,
                bookedById: owner.id, // Booked by owner
                appointmentDate,
                duration: service.duration,
                status: 'CONFIRMED',
                reasonForVisit: `Online Booking: ${service.name}`,
            }
        })

        // 5. Send Confirmation Email
        // Run in background (don't await) to speed up response
        sendAppointmentConfirmation({
            to: owner.email,
            appointmentDate: appointment.appointmentDate,
            petName: pet.name,
            serviceName: service.name,
            clinicName: clinic.name,
            clinicAddress: clinic.address,
            vetName: assignedVetId ? (await prisma.user.findUnique({ where: { id: assignedVetId } }))?.firstName + ' ' + (await prisma.user.findUnique({ where: { id: assignedVetId } }))?.lastName : 'Available Vet',
        }).catch(err => console.error("Failed to send email:", err))

        return { success: true, bookingId: appointment.id }
    } catch (error) {
        console.error("Booking failed:", error)
        return { success: false, error: "Failed to create booking" }
    }
}
