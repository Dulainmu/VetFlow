
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InvoiceStatus, PaymentMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { logActivity } from "./activity-logger"

export async function createInvoice(appointmentId: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { service: true, pet: { include: { owner: true } } },
        })

        if (!appointment) return { success: false, error: "Appointment not found" }

        // Check if invoice already exists
        const existingInvoice = await prisma.invoice.findUnique({
            where: { appointmentId },
        })

        if (existingInvoice) return { success: false, error: "Invoice already exists" }

        // Generate Invoice Number
        const count = await prisma.invoice.count({
            where: { clinicId: session.user.clinicId },
        })
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

        const subtotal = appointment.service.price || 0
        const tax = subtotal * 0.1 // 10% GST
        const total = subtotal + tax

        const invoice = await prisma.invoice.create({
            data: {
                clinicId: session.user.clinicId,
                appointmentId,
                invoiceNumber,
                status: "DRAFT",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days due
                subtotal,
                tax,
                total,
                items: {
                    create: {
                        description: appointment.service.name,
                        unitPrice: subtotal,
                        total: subtotal,
                    },
                },
            },
        })

        await logActivity(session.user.id, session.user.clinicId, "CREATE_INVOICE", `Created invoice ${invoiceNumber}`)

        revalidatePath("/dashboard/billing")
        return { success: true, invoiceId: invoice.id }
    } catch (error) {
        console.error("Failed to create invoice:", error)
        return { success: false, error: "Failed to create invoice" }
    }
}

export async function recordPayment(invoiceId: string, amount: number, method: PaymentMethod, notes?: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return { success: false, error: "Unauthorized" }

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
        })

        if (!invoice) return { success: false, error: "Invoice not found" }

        const newAmountPaid = invoice.amountPaid + amount
        let newStatus: InvoiceStatus = invoice.status

        if (newAmountPaid >= invoice.total) {
            newStatus = "PAID"
        } else if (newAmountPaid > 0) {
            newStatus = "PARTIALLY_PAID"
        }

        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    invoiceId,
                    amount,
                    method,
                    notes,
                },
            }),
            prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    amountPaid: newAmountPaid,
                    status: newStatus,
                },
            }),
        ])

        await logActivity(session.user.id, session.user.clinicId, "RECORD_PAYMENT", `Recorded payment of $${amount} for invoice ${invoice.invoiceNumber}`)

        revalidatePath(`/dashboard/billing/${invoiceId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to record payment:", error)
        return { success: false, error: "Failed to record payment" }
    }
}

export async function getInvoices() {
    const session = await auth()
    if (!session?.user?.clinicId) return []

    try {
        return await prisma.invoice.findMany({
            where: { clinicId: session.user.clinicId },
            include: {
                appointment: {
                    include: {
                        pet: {
                            include: { owner: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })
    } catch (error) {
        console.error("Failed to fetch invoices:", error)
        return []
    }
}

export async function getInvoice(id: string) {
    const session = await auth()
    if (!session?.user?.clinicId) return null

    try {
        return await prisma.invoice.findUnique({
            where: { id, clinicId: session.user.clinicId },
            include: {
                items: true,
                payments: true,
                appointment: {
                    include: {
                        pet: {
                            include: { owner: true }
                        }
                    }
                }
            },
        })
    } catch (error) {
        console.error("Failed to fetch invoice:", error)
        return null
    }
}
