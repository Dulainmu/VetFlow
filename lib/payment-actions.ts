
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function createPaymentIntent(amount: number, currency: string = "aud") {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: session.user.id,
            },
        })

        return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id }
    } catch (error) {
        console.error("Error creating payment intent:", error)
        return { error: "Failed to create payment intent" }
    }
}

export async function createStripeCustomer(email: string, name: string) {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
        })
        return customer
    } catch (error) {
        console.error("Error creating Stripe customer:", error)
        throw error
    }
}
