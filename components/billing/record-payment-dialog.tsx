
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { recordPayment } from "@/lib/billing-actions"
import { Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PaymentMethod } from "@prisma/client"

interface RecordPaymentDialogProps {
    invoiceId: string
    balance: number
}

export function RecordPaymentDialog({ invoiceId, balance }: RecordPaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(balance.toString())
    const [method, setMethod] = useState<PaymentMethod>("CARD")
    const [notes, setNotes] = useState("")
    const { toast } = useToast()

    async function handlePayment() {
        const paymentAmount = parseFloat(amount)
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid amount",
                description: "Please enter a valid payment amount.",
            })
            return
        }

        setLoading(true)
        try {
            const result = await recordPayment(invoiceId, paymentAmount, method, notes)
            if (result.success) {
                toast({
                    title: "Payment recorded",
                    description: "The payment has been successfully recorded.",
                })
                setOpen(false)
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for this invoice. Remaining balance: Rs. {balance.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                <SelectItem value="INSURANCE">Insurance</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Transaction ID, etc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handlePayment} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
