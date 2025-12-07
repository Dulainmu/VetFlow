"use client"

import { AppointmentWithDetails } from "@/lib/appointment-actions"
import { AvailabilityRule, User } from "@prisma/client"
import { format, isSameDay, parse, setHours, setMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { updateAppointmentTime } from "@/lib/appointment-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CalendarViewProps {
    date: Date
    appointments: AppointmentWithDetails[]
    availabilityRules: (AvailabilityRule & { vet: User })[]
    vets: User[]
}

export function CalendarView({ date, appointments, availabilityRules, vets }: CalendarViewProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [draggingId, setDraggingId] = useState<string | null>(null)

    // Generate time slots (8 AM to 6 PM)
    const hours = Array.from({ length: 11 }, (_, i) => i + 8)

    // Filter vets to show only active ones
    const activeVets = vets.filter(v => v.isActive)

    const handleDragStart = (e: React.DragEvent, aptId: string) => {
        e.dataTransfer.setData("text/plain", aptId)
        setDraggingId(aptId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, vetId: string, hour: number) => {
        e.preventDefault()
        const aptId = e.dataTransfer.getData("text/plain")
        setDraggingId(null)

        if (!aptId) return

        // Calculate new date
        const newDate = new Date(date)
        newDate.setHours(hour, 0, 0, 0)

        // Optimistic UI update could go here, but for now we'll rely on revalidation
        // Check for conflicts before sending to server (Quick Client Check)
        const newStart = newDate
        const droppedApt = appointments.find(a => a.id === aptId)
        if (!droppedApt) return

        const newEnd = new Date(newStart.getTime() + droppedApt.duration * 60000)

        // Find conflicts
        const hasConflict = appointments.some(apt => {
            if (apt.id === aptId) return false // Ignore self
            if (apt.vetId !== vetId) return false // Only check target vet/resource
            if (apt.status === "CANCELED") return false

            const aptStart = new Date(apt.appointmentDate)
            const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000)

            // Overlap: (StartA < EndB) and (EndA > StartB)
            return newStart < aptEnd && newEnd > aptStart
        })

        if (hasConflict) {
            toast({
                title: "Conflict Detected",
                description: "This slot is already booked for this resource.",
                variant: "destructive",
            })
            return
        }

        const result = await updateAppointmentTime(aptId, newDate)

        if (result.success) {
            toast({
                title: "Appointment Rescheduled",
                description: `Moved to ${format(newDate, "h:mm a")}`,
            })
            router.refresh()
        } else {
            toast({
                title: "Error",
                description: "Failed to move appointment",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col border rounded-md overflow-hidden bg-background">
            {/* Header: Vets */}
            <div className="flex border-b">
                <div className="w-16 flex-shrink-0 border-r bg-muted/50"></div>
                {activeVets.map(vet => (
                    <div key={vet.id} className="flex-1 p-3 text-center border-r last:border-r-0 bg-muted/20">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={vet.avatarUrl || ""} />
                                <AvatarFallback>{vet.firstName[0]}{vet.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate w-full">
                                {vet.firstName}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto max-h-[600px]">
                <div className="relative min-w-[600px]">
                    {hours.map(hour => (
                        <div key={hour} className="flex h-20 border-b last:border-b-0">
                            {/* Time Label */}
                            <div className="w-16 flex-shrink-0 border-r p-2 text-xs text-muted-foreground text-right bg-muted/10">
                                {format(setHours(new Date(), hour), "h a")}
                            </div>

                            {/* Vet Slots */}
                            {activeVets.map(vet => {
                                // Find appointments for this vet in this hour
                                const vetAppointments = appointments.filter(apt => {
                                    if (!apt.vetId) return false
                                    if (apt.vetId !== vet.id) return false
                                    const aptHour = new Date(apt.appointmentDate).getHours()
                                    return aptHour === hour
                                })

                                // Find blocked time for this vet in this hour
                                const vetRules = availabilityRules.filter(rule => {
                                    if (rule.vetId !== vet.id) return false
                                    const startHour = new Date(rule.startDate!).getHours()
                                    const endHour = new Date(rule.endDate!).getHours()
                                    // Simple overlap check for hour block
                                    return hour >= startHour && hour < endHour
                                })

                                return (
                                    <div
                                        key={`${vet.id}-${hour}`}
                                        className="flex-1 border-r last:border-r-0 relative p-1 group transition-colors hover:bg-muted/30"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, vet.id, hour)}
                                    >
                                        {/* Render Appointments */}
                                        {vetAppointments.map(apt => (
                                            <TooltipProvider key={apt.id}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, apt.id)}
                                                            className={cn(
                                                                "absolute inset-x-1 rounded px-2 py-1 text-xs font-medium cursor-grab active:cursor-grabbing hover:opacity-90 transition-all overflow-hidden shadow-sm",
                                                                "bg-primary/10 border-l-4 border-primary text-primary-foreground",
                                                                apt.status === "CONFIRMED" && "bg-blue-100 text-blue-800 border-blue-500",
                                                                apt.status === "CHECKED_IN" && "bg-green-100 text-green-800 border-green-500",
                                                                apt.status === "CANCELED" && "bg-red-100 text-red-800 border-red-500 opacity-50",
                                                                draggingId === apt.id && "opacity-50"
                                                            )}
                                                            style={{
                                                                top: `${(new Date(apt.appointmentDate).getMinutes() / 60) * 100}%`,
                                                                height: `${(apt.duration / 60) * 100}%`,
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <div className="font-bold">{format(new Date(apt.appointmentDate), "h:mm")}</div>
                                                            <div className="truncate">{apt.pet.name} ({apt.service.name})</div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-bold">{apt.pet.name} - {apt.service.name}</p>
                                                        <p className="text-xs">{apt.pet.owner.firstName} {apt.pet.owner.lastName}</p>
                                                        <p className="text-xs">{format(new Date(apt.appointmentDate), "h:mm a")} ({apt.duration} min)</p>
                                                        <p className="text-xs capitalize">{apt.status.replace("_", " ").toLowerCase()}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}

                                        {/* Render Blocked Time */}
                                        {vetRules.map(rule => (
                                            <div key={rule.id}
                                                className={cn(
                                                    "absolute inset-x-0 bg-gray-100/80 flex items-center justify-center text-xs text-muted-foreground border-y border-dashed border-gray-300",
                                                    rule.type === "VACATION" && "bg-yellow-50/80"
                                                )}
                                                style={{
                                                    top: 0,
                                                    bottom: 0,
                                                    zIndex: 5
                                                }}
                                            >
                                                <span className="transform -rotate-45 font-medium opacity-50">
                                                    {rule.type === "VACATION" ? "VACATION" : "BLOCKED"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
