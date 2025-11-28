"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Check, Loader2, X } from "lucide-react"
import ServiceSelection from "@/components/booking/service-selection"
import VetSelection from "@/components/booking/vet-selection"
import TimeSelection from "@/components/booking/time-selection"
import DetailsForm, { BookingDetails } from "@/components/booking/details-form"
import BookingSummary from "@/components/booking/booking-summary"
import { createBooking } from "@/lib/booking-actions"

// Steps
const STEPS = [
    { id: 1, name: "Service", description: "Choose a service" },
    { id: 2, name: "Vet", description: "Select a veterinarian" },
    { id: 3, name: "Time", description: "Pick a date & time" },
    { id: 4, name: "Details", description: "Your information" },
    { id: 5, name: "Confirm", description: "Review booking" },
]

type Service = {
    id: string
    name: string
    description: string | null
    duration: number
    price: number | null
}

type Vet = {
    id: string
    name: string | null
    image: string | null
    role: string
}

export default function BookingPage({ params }: { params: { clinicSlug: string } }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

    // Booking State
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedVet, setSelectedVet] = useState<Vet | null>(null) // null = Any Vet
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        petName: "",
        petSpecies: "",
        petBreed: "",
        petAge: "",
        petGender: "",
    })

    const nextStep = async () => {
        if (currentStep === STEPS.length) {
            // Submit Booking
            await handleBookingSubmit()
        } else {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
    }

    const handleVetSelect = (vet: Vet | null) => {
        setSelectedVet(vet)
    }

    const handleTimeSelect = (date: Date, time: string) => {
        setSelectedDate(date)
        setSelectedTime(time)
    }

    const handleDetailsChange = (details: BookingDetails) => {
        setBookingDetails(details)
    }

    const handleBookingSubmit = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return

        setIsSubmitting(true)
        try {
            const result = await createBooking({
                clinicSlug: params.clinicSlug,
                serviceId: selectedService.id,
                vetId: selectedVet?.id,
                date: selectedDate,
                time: selectedTime,
                details: bookingDetails,
            })

            if (result.success && result.bookingId) {
                setBookingSuccess(result.bookingId)
            } else {
                // Handle error (toast or alert)
                alert("Booking failed. Please try again.")
            }
        } catch (error) {
            console.error("Booking error:", error)
            alert("An unexpected error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    }

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                        Your appointment has been successfully scheduled. We've sent a confirmation email to {bookingDetails.ownerEmail}.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Booking Reference</p>
                        <p className="text-xl font-mono font-bold text-primary-600">{bookingSuccess}</p>
                    </div>
                    <Button
                        className="w-full bg-primary-600 hover:bg-primary-700"
                        onClick={() => window.location.reload()}
                    >
                        Book Another Appointment
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-3xl" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <Link href="/" className="absolute right-0 top-0 md:right-[-3rem] md:top-[-1rem]">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-sm">
                            <X className="w-6 h-6" />
                        </Button>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Book an Appointment</h1>
                        <p className="text-lg text-gray-600">Schedule a visit with <span className="font-semibold text-primary-600">{params.clinicSlug}</span></p>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex justify-between items-center relative px-2">
                        <div className="absolute left-0 top-1/2 w-full h-1.5 bg-gray-200 -z-10 rounded-full" />
                        <motion.div
                            className="absolute left-0 top-1/2 h-1.5 bg-primary-600 -z-10 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center relative group">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: currentStep >= step.id ? "#2563eb" : "#ffffff",
                                        borderColor: currentStep >= step.id ? "#2563eb" : "#e5e7eb",
                                        scale: currentStep === step.id ? 1.1 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${currentStep >= step.id ? "text-white" : "text-gray-400"}`}
                                >
                                    {currentStep > step.id ? <Check className="w-6 h-6" /> : <span className="font-bold">{step.id}</span>}
                                </motion.div>
                                <span className={`absolute -bottom-8 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${currentStep >= step.id ? "text-primary-700" : "text-gray-400"
                                    }`}>
                                    {step.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                    <div className="flex-1 p-8 overflow-hidden relative">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="h-full"
                            >
                                {/* Step Content */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">Select a Service</h2>
                                            <p className="text-gray-500">Choose the type of appointment you need.</p>
                                        </div>
                                        <ServiceSelection
                                            clinicSlug={params.clinicSlug}
                                            selectedServiceId={selectedService?.id}
                                            onSelect={handleServiceSelect}
                                        />
                                    </div>
                                )}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">Choose a Veterinarian</h2>
                                            <p className="text-gray-500">Select a preferred vet or choose "Any available".</p>
                                        </div>
                                        <VetSelection
                                            clinicSlug={params.clinicSlug}
                                            selectedVetId={selectedVet?.id} // undefined if null
                                            onSelect={handleVetSelect}
                                        />
                                    </div>
                                )}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">Select Date & Time</h2>
                                            <p className="text-gray-500">Pick a slot that works for you.</p>
                                        </div>
                                        <TimeSelection
                                            clinicSlug={params.clinicSlug}
                                            serviceId={selectedService?.id || ""}
                                            vetId={selectedVet?.id}
                                            selectedDate={selectedDate}
                                            selectedTime={selectedTime}
                                            onSelect={handleTimeSelect}
                                        />
                                    </div>
                                )}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">Your Details</h2>
                                            <p className="text-gray-500">Tell us about yourself and your pet.</p>
                                        </div>
                                        <DetailsForm
                                            defaultValues={bookingDetails}
                                            onChange={handleDetailsChange}
                                        />
                                    </div>
                                )}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">Confirm Booking</h2>
                                            <p className="text-gray-500">Review your appointment details.</p>
                                        </div>
                                        <BookingSummary
                                            serviceName={selectedService?.name}
                                            servicePrice={selectedService?.price}
                                            vetName={selectedVet?.name}
                                            date={selectedDate}
                                            time={selectedTime}
                                            details={bookingDetails}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Navigation */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1 || isSubmitting}
                            className={currentStep === 1 ? "invisible" : ""}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            onClick={nextStep}
                            disabled={
                                (currentStep === 1 && !selectedService) || // Require service selection
                                (currentStep === 3 && (!selectedDate || !selectedTime)) || // Require date & time
                                (currentStep === 4 && (!bookingDetails.ownerName || !bookingDetails.ownerEmail || !bookingDetails.petName)) || // Require details
                                isSubmitting
                            }
                            className="bg-primary-600 hover:bg-primary-700 text-white min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : currentStep === STEPS.length ? (
                                "Confirm Booking"
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
