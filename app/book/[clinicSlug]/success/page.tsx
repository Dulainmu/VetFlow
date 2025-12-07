"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function BookingSuccessPage({ params }: { params: { clinicSlug: string } }) {
    const searchParams = useSearchParams()
    // PayHere returns order_id as a param, or we pass bookingId
    const bookingId = searchParams.get('bookingId') || searchParams.get('order_id')

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center border-0 shadow-lg">
                <CardContent className="pt-12 pb-12 px-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-300">
                        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Booking Confirmed!</h1>

                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        Thank you! Your appointment has been successfully scheduled.
                        A confirmation email with all the details has been sent to your inbox.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800">
                        <p className="font-medium">Please check your email/spam folder for your booking receipt.</p>
                    </div>

                    <div className="space-y-3">
                        <Link href={`/book/${params.clinicSlug}`}>
                            <Button variant="outline" className="w-full h-12 text-base">
                                <Calendar className="w-4 h-4 mr-2" />
                                Book Another Appointment
                            </Button>
                        </Link>

                        <Link href="/">
                            <Button className="w-full h-12 text-base bg-gray-900 hover:bg-black text-white">
                                Back to Home
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-gray-400 mt-8">
                        Booking Reference: #{bookingId?.slice(-6) || "PENDING"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
