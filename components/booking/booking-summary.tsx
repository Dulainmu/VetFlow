"use client"

import { format } from "date-fns"
import { Calendar, Clock, User, Stethoscope, PawPrint } from "lucide-react"

interface BookingSummaryProps {
    serviceName?: string
    servicePrice?: number | null
    vetName?: string | null
    date?: Date
    time?: string
    details: {
        ownerName: string
        petName: string
        petSpecies: string
    }
}

export default function BookingSummary({
    serviceName,
    servicePrice,
    vetName,
    date,
    time,
    details
}: BookingSummaryProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Booking Summary</h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Service & Vet */}
                <div className="flex items-start gap-4">
                    <div className="bg-primary-50 p-2 rounded-lg">
                        <Stethoscope className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{serviceName || "Service"}</p>
                        <p className="text-sm text-gray-500">
                            with {vetName || "Any Available Vet"}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-gray-900">
                        {servicePrice !== null && servicePrice !== undefined ? `$${servicePrice}` : "Varies"}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-4">
                    <div className="bg-primary-50 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">
                            {date ? format(date, "EEEE, MMMM do, yyyy") : "Date"}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {time || "Time"}
                        </div>
                    </div>
                </div>

                {/* Patient */}
                <div className="flex items-start gap-4">
                    <div className="bg-primary-50 p-2 rounded-lg">
                        <PawPrint className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{details.petName}</p>
                        <p className="text-sm text-gray-500">
                            {details.petSpecies} • Owner: {details.ownerName}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="text-xl font-bold text-primary-600">
                            {servicePrice !== null && servicePrice !== undefined ? `$${servicePrice}` : "Varies"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
