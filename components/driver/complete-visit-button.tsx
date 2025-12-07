"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateAppointmentStatus } from "@/lib/appointment-actions"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CompleteVisitButtonProps {
    appointmentId: string
    isCompleted: boolean
}

export function CompleteVisitButton({ appointmentId, isCompleted }: CompleteVisitButtonProps) {
    const [loading, setLoading] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [notes, setNotes] = useState("")
    const { toast } = useToast()
    const router = useRouter()

    async function handleComplete() {
        setLoading(true)
        try {
            const result = await updateAppointmentStatus(appointmentId, "COMPLETED")
            if (result.success) {
                toast({
                    title: "Visit Completed ✓",
                    description: "Appointment marked as completed.",
                })
                setShowNotes(false)
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

    if (isCompleted) {
        return (
            <Button disabled variant="outline" className="shrink-0">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Completed
            </Button>
        )
    }

    return (
        <>
            <Button
                onClick={() => setShowNotes(true)}
                disabled={loading}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-6 py-6 shrink-0"
            >
                {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                Complete Visit
            </Button>

            <Dialog open={showNotes} onOpenChange={setShowNotes}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Visit</DialogTitle>
                        <DialogDescription>
                            Add any notes about the visit (optional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="notes">Visit Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="E.g., Rabies vaccination given, pet was calm..."
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNotes(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleComplete}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
