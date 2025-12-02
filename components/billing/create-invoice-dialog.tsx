
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
import { createInvoice } from "@/lib/billing-actions"
import { Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { getUninvoicedAppointments } from "@/lib/appointment-actions" // We need to create this

export function CreateInvoiceDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [appointments, setAppointments] = useState<any[]>([])
    const [selectedAppt, setSelectedAppt] = useState<string>("")
    const { toast } = useToast()
    const router = useRouter()

    // Load appointments when dialog opens
    async function onOpenChange(open: boolean) {
        setOpen(open)
        if (open) {
            setLoading(true)
            try {
                const data = await getUninvoicedAppointments()
                setAppointments(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    async function handleCreate() {
        if (!selectedAppt) return

        setLoading(true)
        try {
            const result = await createInvoice(selectedAppt)
            if (result.success) {
                toast({
                    title: "Invoice created",
                    description: "Redirecting to invoice details...",
                })
                setOpen(false)
                router.push(`/dashboard/billing/${result.invoiceId}`)
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                    <DialogDescription>
                        Select a completed appointment to generate an invoice.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="appointment">Appointment</Label>
                        <Select value={selectedAppt} onValueChange={setSelectedAppt}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select appointment" />
                            </SelectTrigger>
                            <SelectContent>
                                {appointments.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No uninvoiced appointments
                                    </SelectItem>
                                ) : (
                                    appointments.map((appt) => (
                                        <SelectItem key={appt.id} value={appt.id}>
                                            {appt.pet.owner.firstName} {appt.pet.owner.lastName} - {appt.service.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={!selectedAppt || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Invoice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
