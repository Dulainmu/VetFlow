"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Shield, History, Calendar } from "lucide-react"

interface GuestUpsellDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSignUp: () => void
    onGuest: () => void
}

export default function GuestUpsellDialog({ open, onOpenChange, onSignUp, onGuest }: GuestUpsellDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">Save your details for next time?</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Create a free account to unlock these benefits:
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <History className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-purple-900">Track Pet History</h4>
                            <p className="text-sm text-purple-700">View past appointments and medical notes.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Easy Re-booking</h4>
                            <p className="text-sm text-blue-700">Book future visits in seconds without re-entering details.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
                    <Button onClick={onSignUp} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md">
                        Yes, create my account
                    </Button>
                    <Button variant="ghost" onClick={onGuest} className="w-full text-gray-500 hover:text-gray-900">
                        No thanks, continue as guest
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
