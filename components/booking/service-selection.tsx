"use client"

import { useEffect, useState } from "react"
import { getServices } from "@/lib/booking-actions"
import { Check, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the type based on the Prisma model
type Service = {
    id: string
    name: string
    description: string | null
    duration: number
    price: number | null
}

interface ServiceSelectionProps {
    clinicSlug: string
    selectedServiceId?: string
    onSelect: (service: Service) => void
}

export default function ServiceSelection({ clinicSlug, selectedServiceId, onSelect }: ServiceSelectionProps) {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getServices(clinicSlug)
                setServices(data)
            } catch (error) {
                console.error("Error loading services:", error)
            } finally {
                setLoading(false)
            }
        }
        loadServices()
    }, [clinicSlug])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
                const isSelected = selectedServiceId === service.id
                return (
                    <div
                        key={service.id}
                        onClick={() => onSelect(service)}
                        className={cn(
                            "relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                            isSelected
                                ? "border-primary-600 bg-primary-50"
                                : "border-gray-100 bg-white hover:border-primary-200"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={cn("font-semibold text-lg", isSelected ? "text-primary-900" : "text-gray-900")}>
                                {service.name}
                            </h3>
                            {isSelected && (
                                <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                            {service.description || "Professional veterinary service"}
                        </p>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-1.5 text-primary-500" />
                                {service.duration} mins
                            </div>
                            <div className="flex items-center text-gray-600">
                                <DollarSign className="h-4 w-4 mr-1 text-primary-500" />
                                {service.price !== null ? service.price : "Varies"}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
