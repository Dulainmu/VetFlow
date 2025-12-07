
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()

        const merchant_id = formData.get('merchant_id')?.toString()
        const order_id = formData.get('order_id')?.toString()
        const payhere_amount = formData.get('payhere_amount')?.toString()
        const payhere_currency = formData.get('payhere_currency')?.toString()
        const status_code = formData.get('status_code')?.toString()
        const md5sig = formData.get('md5sig')?.toString()

        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET!

        // Validate Signature
        // md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(md5(merchant_secret)))
        const secretHash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase()
        const dataStr = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`
        const localSig = crypto.createHash('md5').update(dataStr).digest('hex').toUpperCase()

        if (localSig !== md5sig) {
            console.error("PayHere Signature Mismatch")
            return NextResponse.json({ error: "Signature Mismatch" }, { status: 400 })
        }

        // Process Payment
        if (status_code === '2') {
            // Success
            await prisma.appointment.update({
                where: { id: order_id },
                data: {
                    status: 'CONFIRMED', // or 'DEPOSIT_PAID'
                    // You might want to store payment ref: formData.get('payment_id')
                }
            })
            console.log(`Payment confirmed for Booking ${order_id}`)
        } else {
            // Failed or Cancelled
            console.log(`Payment failed/cancelled for Booking ${order_id} - Status: ${status_code}`)
            // Optionally update status to 'PAYMENT_FAILED'
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("PayHere Webhook Error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
