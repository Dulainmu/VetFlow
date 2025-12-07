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
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, ArrowRight, Loader2, CreditCard, Store, Sparkles } from "lucide-react"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-blue-400/20 dark:from-primary-600/10 dark:to-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl" />
            </div>

            {/* Theme Toggle - Fixed Position */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Premium Progress Steps */}
                <div className="mb-10">
                    <div className="flex justify-between items-center relative">
                        {/* Progress Line */}
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
                        <div
                            className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-primary-500 to-primary-600 -z-10 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map((step) => {
                            const isCompleted = currentStep > step.id
                            const isCurrent = currentStep === step.id
                            return (
                                <div key={step.id} className="flex flex-col items-center">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.1 : 1,
                                            boxShadow: isCurrent ? '0 0 20px -5px hsl(var(--primary) / 0.5)' : 'none'
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                                            ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                                            : isCurrent
                                                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-500/20"
                                                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700"
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                                    </motion.div>
                                    <span className={`text-xs mt-3 font-semibold tracking-wide ${isCurrent ? "text-primary-600 dark:text-primary-400" : isCompleted ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}`}>
                                        {step.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Premium Card Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card"
                >
                    {/* Gradient Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 p-8">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNNDAgNDBsLTQwIDBoNDBsMC00MCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-white/80" />
                                <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Premium Booking</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
                            <p className="text-primary-100 mt-2">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}</p>
                        </div>
                    </div>

                    <CardContent className="p-8 bg-white dark:bg-slate-900/90">
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
                        <div className="flex justify-between mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className={`${currentStep === 1 ? "invisible" : ""} border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            {
                                currentStep === 6 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white min-w-[160px] shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
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
                                        className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white min-w-[140px] shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Next Step
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )
                            }
                        </div>
                    </CardContent>
                </motion.div>
            </div>
        </div>
    )
}

