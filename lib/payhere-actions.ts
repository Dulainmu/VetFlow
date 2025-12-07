"use server"

import { prisma } from "@/lib/prisma"
import { generatePayHereHash, getPayHereConfig } from "@/lib/payhere"

export async function getPayHerePaymentDetails(bookingId: string) {
    try {
        const booking = await prisma.appointment.findUnique({
            where: { id: bookingId },
            include: {
                service: true,
                bookedBy: true,
                clinic: true
            }
        })

        if (!booking || !booking.service || !booking.bookedBy) {
            return { error: "Booking not found" }
        }

        const amount = booking.service.depositAmount > 0
            ? booking.service.depositAmount
            : booking.service.price || 0;

        // Ensure we have a valid amount
        if (amount <= 0) return { error: "No payment required" }

        const config = getPayHereConfig()
        // Override return URL to be specific if needed
        config.returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/book/${booking.clinic.slug}/success?bookingId=${booking.id}`

        const hash = generatePayHereHash(
            booking.id,
            amount.toString(),
            "LKR"
        )

        // const nameParts = (booking.bookedBy.name || "").split(" ") // User has no name field
        const firstName = booking.bookedBy.firstName || "Guest"
        const lastName = booking.bookedBy.lastName || ""

        return {
            config: {
                merchant_id: config.merchantId,
                base_url: config.baseUrl,
                return_url: config.returnUrl,
                cancel_url: config.cancelUrl,
                notify_url: config.notifyUrl,
            },
            payment: {
                order_id: booking.id,
                items: `Booking: ${booking.service.name}`,
                currency: "LKR",
                amount: amount.toFixed(2),
                first_name: firstName,
                last_name: lastName,
                email: booking.bookedBy.email || "",
                phone: booking.bookedBy.phone || "",
                address: booking.clinic.address || "Main Street",
                city: "Colombo", // Data might be missing, default needed
                country: "Sri Lanka",
                hash: hash
            }
        }

    } catch (error) {
        console.error("Failed to generate PayHere details:", error)
        return { error: "Internal Server Error" }
    }
}
