"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createBooking, getAvailableSlots, getServices, getVets } from "@/lib/booking-actions"
import ServiceSelection from "@/components/booking/service-selection"
import VetSelection from "@/components/booking/vet-selection"
import TimeSelection from "@/components/booking/time-selection"
import DetailsForm from "@/components/booking/details-form"
import BookingSummary from "@/components/booking/booking-summary"
import { format, addMinutes } from "date-fns"
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, ArrowRight, Loader2, CreditCard, Store } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { PayHereButton } from "@/components/booking/payhere-button"
import { getPayHerePaymentDetails } from "@/lib/payhere-actions"
import { ThemeToggle } from "@/components/theme-toggle"


const STEPS = [
    { id: 1, name: "Service", description: "Choose a service" },
    { id: 2, name: "Vet", description: "Select a veterinarian" },
    { id: 3, name: "Time", description: "Pick a date & time" },
    { id: 4, name: "Details", description: "Your information" },
    { id: 5, name: "Payment", description: "Secure checkout" },
    { id: 6, name: "Confirm", description: "Review booking" },
]

// ... (Keep existing interfaces: Service, Vet, etc.)
interface Service {
    id: string
    name: string
    description: string | null
    duration: number
    price: number | null
    depositAmount: number
}

interface Vet {
    id: string
    name: string | null
    image: string | null
    role: string
}

export default function BookingPage({ params }: { params: { clinicSlug: string } }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingId, setBookingId] = useState<string | null>(null)

    // Data State
    const [services, setServices] = useState<Service[]>([])
    const [vets, setVets] = useState<Vet[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    // Selection State
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedVet, setSelectedVet] = useState<Vet | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Details State
    const [details, setDetails] = useState<{
        ownerName: string
        ownerEmail: string
        ownerPhone: string
        petName: string
        petSpecies: string
        petBreed: string
        petAge: string
        petGender: string
    }>({
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        petName: "",
        petSpecies: "DOG",
        petBreed: "",
        petAge: "",
        petGender: "MALE",
    })

    // Payment State
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CLINIC'>('ONLINE')
    const [payHereData, setPayHereData] = useState<any>(null)

    // ... (Keep existing useEffects for loading data)
    useEffect(() => {
        getServices(params.clinicSlug).then((data: any) => setServices(data))
        getVets(params.clinicSlug).then(setVets)
    }, [params.clinicSlug])

    useEffect(() => {
        if (selectedService && selectedDate) {
            getAvailableSlots(selectedDate, params.clinicSlug, selectedService.id, selectedVet?.id)
                .then(setAvailableSlots)
        }
    }, [selectedDate, selectedService, selectedVet, params.clinicSlug])

    // Email Check Effect



    const nextStep = () => {
        // Step 4: Details Validation & Logic
        if (currentStep === 4) {
            // Basic validation
            if (!details.ownerName || !details.ownerEmail || !details.ownerPhone || !details.petName) {
                return // Should be handled by disabled button, but extra safety
            }

            if (!details.ownerName || !details.ownerEmail || !details.ownerPhone || !details.petName) {
                return // Should be handled by disabled button, but extra safety
            }
        }

        if (currentStep === 4) {
            // Check if payment is needed
            const needsPayment = (selectedService?.depositAmount || 0) > 0 || (selectedService?.price || 0) > 0
            if (!needsPayment) {
                setDirection(1)
                setCurrentStep(6) // Skip payment
                return
            }
        }

        setDirection(1)
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }

    const prevStep = () => {
        if (currentStep === 6) {
            // Check if payment was skipped
            const needsPayment = (selectedService?.depositAmount || 0) > 0 || (selectedService?.price || 0) > 0
            if (!needsPayment) {
                setDirection(-1)
                setCurrentStep(4) // Go back to details
                return
            }
        }

        setDirection(-1)
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }



    const handleSubmit = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return

        setIsSubmitting(true)
        try {
            const result = await createBooking({
                clinicSlug: params.clinicSlug,
                serviceId: selectedService.id,
                vetId: selectedVet?.id,
                date: selectedDate,
                time: selectedTime,
                details,
                paymentMethod: paymentMethod // Pass payment method
            })

            if (result.success) {
                const bId = result.bookingId!
                setBookingId(bId)

                if (paymentMethod === 'ONLINE') {
                    // Fetch PayHere Details
                    const payData = await getPayHerePaymentDetails(bId)
                    if (payData && !payData.error) {
                        setPayHereData(payData)
                    } else {
                        console.error("Failed to get PayHere details")
                        // Should probably show error, but booking is made. 
                        // Maybe manual retry?
                    }
                }
            } else {
                alert("Booking failed. Please try again.")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Upsell Handlers


    if (bookingId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    {paymentMethod === 'ONLINE' && payHereData ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CreditCard className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost There!</h2>
                            <p className="text-gray-600 mb-8">
                                Your booking is held. Please complete the payment to confirm.
                            </p>
                            <PayHereButton
                                config={payHereData.config}
                                payment={payHereData.payment}
                                autoSubmit={false}
                            />
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-gray-600 mb-8">
                                Your appointment has been successfully scheduled. We've sent a confirmation email and WhatsApp message to {details.ownerEmail}.
                            </p>
                            <div className="space-y-3">
                                <Link href="/portal/appointments">
                                    <Button className="w-full">View My Appointments</Button>
                                </Link>
                                <Link href="/">
                                    <Button variant="outline" className="w-full">Back to Home</Button>
                                </Link>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-slate-800 -z-10" />
                        {STEPS.map((step) => {
                            const isCompleted = currentStep > step.id
                            const isCurrent = currentStep === step.id
                            return (
                                <div key={step.id} className="flex flex-col items-center bg-gray-50 dark:bg-slate-900 px-2 transition-colors duration-200">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${isCompleted || isCurrent
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                            : "bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                                            } `}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"} `}>
                                        {step.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <Card className="overflow-hidden shadow-lg border-0 bg-white dark:bg-slate-950">
                    <div className="bg-gray-900 dark:bg-slate-800 p-6 text-white transition-colors duration-200">
                        <h1 className="text-2xl font-bold">Book Appointment</h1>
                        <p className="text-gray-400">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}</p>
                    </div>

                    <CardContent className="p-6">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                initial={{ x: direction > 0 ? 20 : -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction > 0 ? -20 : 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Step 1: Service */}
                                {currentStep === 1 && (
                                    <ServiceSelection
                                        clinicSlug={params.clinicSlug}
                                        selectedServiceId={selectedService?.id}
                                        onSelect={setSelectedService}
                                    />
                                )}

                                {/* Step 2: Vet */}
                                {currentStep === 2 && (
                                    <VetSelection
                                        clinicSlug={params.clinicSlug}
                                        selectedVetId={selectedVet?.id}
                                        onSelect={setSelectedVet}
                                    />
                                )}

                                {/* Step 3: Time */}
                                {currentStep === 3 && selectedService && (
                                    <TimeSelection
                                        clinicSlug={params.clinicSlug}
                                        serviceId={selectedService.id}
                                        vetId={selectedVet?.id}
                                        selectedDate={selectedDate}
                                        selectedTime={selectedTime || undefined}
                                        onSelect={(date, time) => {
                                            setSelectedDate(date)
                                            setSelectedTime(time)
                                        }}
                                    />
                                )}

                                {/* Step 4: Details */}
                                {currentStep === 4 && (
                                    <DetailsForm
                                        defaultValues={details}
                                        onChange={setDetails}
                                    />
                                )}

                                {/* Step 5: Payment */}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Service Total</span>
                                                <span className="font-semibold text-lg">Rs. {selectedService?.price}</span>
                                            </div>
                                            {selectedService?.depositAmount! > 0 && (
                                                <div className="flex justify-between items-center text-primary-700 bg-primary-50 p-2 rounded">
                                                    <span className="font-medium">Deposit Required</span>
                                                    <span className="font-bold">Rs. {selectedService?.depositAmount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Payment Method</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div
                                                    className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'ONLINE' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                    onClick={() => setPaymentMethod('ONLINE')}
                                                >
                                                    <CreditCard className="w-6 h-6" />
                                                    <span className="font-medium">Pay Online</span>
                                                </div>
                                                <div
                                                    className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'CLINIC' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                    onClick={() => setPaymentMethod('CLINIC')}
                                                >
                                                    <Store className="w-6 h-6" />
                                                    <span className="font-medium">Pay at Clinic</span>
                                                </div>
                                            </div>
                                        </div>

                                        {paymentMethod === 'ONLINE' ? (
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                                                <p className="font-medium mb-1">Online Payment Enabled (PayHere)</p>
                                                <p className="text-sm">
                                                    You will be redirected to our secure payment gateway to complete your booking.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                                                <p className="text-sm">
                                                    You can pay for your appointment when you arrive at the clinic.
                                                    Please note that your booking is still subject to our cancellation policy.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 6: Confirm */}
                                {currentStep === 6 && (
                                    <BookingSummary
                                        serviceName={selectedService?.name}
                                        servicePrice={selectedService?.price}
                                        vetName={selectedVet?.name}
                                        date={selectedDate}
                                        time={selectedTime || undefined}
                                        details={details}
                                    />
                                )}
                            </motion.div >
                        </AnimatePresence >

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className={`${currentStep === 1 ? "invisible" : ""} hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            {
                                currentStep === 6 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white min-w-[140px] transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Booking...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Booking
                                                <Check className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={nextStep}
                                        disabled={
                                            (currentStep === 1 && !selectedService) ||
                                            (currentStep === 3 && !selectedTime) ||
                                            (currentStep === 4 && (
                                                !details.ownerName ||
                                                !details.ownerEmail
                                            ))
                                        }
                                        className="bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white min-w-[140px] transition-colors"
                                    >
                                        Next Step
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

