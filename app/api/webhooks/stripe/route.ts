
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.PaymentIntent

    if (event.type === "payment_intent.succeeded") {
        const paymentIntentId = session.id

        // Find appointment associated with this payment intent
        const appointment = await prisma.appointment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId } as any,
            include: { service: true }
        }) as any

        if (appointment) {
            // 1. Update Appointment Status
            await prisma.appointment.update({
                where: { id: appointment.id },
                data: { status: "CONFIRMED" },
            })

            // 2. Create Invoice (Paid)
            const invoiceNumber = `INV-${new Date().getFullYear()}-${appointment.id.slice(-4).toUpperCase()}`
            const subtotal = appointment.service.price || 0
            const tax = subtotal * 0.1
            const total = subtotal + tax

            const invoice = await (prisma as any).invoice.create({
                data: {
                    clinicId: appointment.clinicId,
                    appointmentId: appointment.id,
                    invoiceNumber,
                    status: "PAID",
                    dueDate: new Date(),
                    subtotal,
                    tax,
                    total,
                    amountPaid: total,
                    items: {
                        create: {
                            description: appointment.service.name,
                            unitPrice: subtotal,
                            total: subtotal,
                        }
                    }
                }
            })

            // 3. Record Payment
            await (prisma as any).payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: total,
                    method: "CARD",
                    stripePaymentIntentId: paymentIntentId,
                    reference: paymentIntentId,
                }
            })
        }
    }

    return new NextResponse(null, { status: 200 })
}
