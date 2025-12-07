"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Star, Shield, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true)

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    }

    const pricing = [
        {
            name: "Starter",
            price: 99,
            description: "Perfect for small clinics just getting started.",
            features: [
                "1 Clinic Location",
                "Up to 2 Vets",
                "100 Appointments/mo",
                "Basic Patient Records",
                "Email Support",
                "Automated Email Reminders"
            ],
            cta: "Start Free Trial",
            color: "blue",
            popular: false
        },
        {
            name: "Professional",
            price: 199,
            description: "The complete solution for modern practices.",
            features: [
                "1-3 Clinic Locations",
                "Up to 5 Vets",
                "Unlimited Appointments",
                "Advanced Reporting & Analytics",
                "Priority Support (1hr response)",
                "SMS Reminders (500/mo included)",
                "No-Show Protection (Deposit System)",
                "Data Migration Assistant"
            ],
            cta: "Get Started",
            color: "primary",
            popular: true
        }
    ]

    return (
        <section id="pricing" className="py-32 bg-gray-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl mix-blend-multiply" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-4 block">
                        Simple, Transparent Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Invest in your clinic's <br /> growth, not busywork.
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Stop paying for features you don't use. Start saving hours of admin time every single day.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {pricing.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative p-8 rounded-[2.5rem] border ${plan.popular
                                ? "bg-white border-primary-200 shadow-2xl shadow-primary-900/10"
                                : "bg-white/50 border-gray-200 shadow-xl"
                                } flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary-600/30 flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-current" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight text-gray-900">${plan.price}</span>
                                    <span className="text-gray-500 font-medium">/month</span>
                                </div>
                                <p className="text-gray-500 mt-4 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="flex-grow mb-8 space-y-4">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 p-1 rounded-full ${plan.popular ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"
                                            }`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-gray-600 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/register/clinic" className="block">
                                <Button
                                    size="lg"
                                    variant={plan.popular ? "default" : "outline"}
                                    className={`w-full h-14 text-lg rounded-2xl font-bold transition-all duration-300 ${plan.popular
                                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                        : "border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>

                            {plan.popular && (
                                <p className="text-center text-xs text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    30-day money-back guarantee
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-100 mb-8">
                        <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-gray-900 font-medium">Pays for itself by preventing just <strong>1 no-show</strong> a month.</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
