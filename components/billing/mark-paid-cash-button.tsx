"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { recordPayment } from "@/lib/billing-actions"
import { Loader2, Banknote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface MarkPaidCashButtonProps {
    invoiceId: string
    balance: number
}

export function MarkPaidCashButton({ invoiceId, balance }: MarkPaidCashButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    async function handleMarkPaid() {
        if (!confirm(`Mark Rs. ${balance.toFixed(2)} as paid with Cash?`)) return

        setLoading(true)
        try {
            const result = await recordPayment(invoiceId, balance, "CASH", "Marked as paid at reception")
            if (result.success) {
                toast({
                    title: "Payment Recorded ✓",
                    description: "Invoice marked as paid with Cash.",
                })
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleMarkPaid}
            disabled={loading}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Banknote className="mr-2 h-4 w-4" />
            )}
            Mark Paid (Cash)
        </Button>
    )
}
