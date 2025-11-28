"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Heart, Clock, MapPin, Phone, ArrowRight, Stethoscope, Syringe, Scissors, Star, Activity } from "lucide-react"

export default function LandingPage() {
    const { scrollY } = useScroll()
    const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
    const headerY = useTransform(scrollY, [0, 100], [-20, 0])

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    }

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900 font-sans">
            {/* Floating Header */}
            <motion.nav
                style={{ opacity: headerOpacity, y: headerY }}
                className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm"
            >
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-600/20">
                            <Heart className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Happy Paws</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#services" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Services</Link>
                        <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">About</Link>
                        <Link href="#team" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Team</Link>
                        <Link href="/book/happy-paws">
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 shadow-lg shadow-primary-600/20 transition-all hover:scale-105">
                                Book Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section - 100vh */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC]">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl animate-blob" />
                    <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-teal-100/40 to-emerald-100/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-gradient-to-t from-orange-100/40 to-rose-100/40 rounded-full blur-3xl animate-blob animation-delay-4000" />
                </div>

                <div className="container mx-auto px-6 relative z-10 pt-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-2xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-8"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-gray-600">Accepting new patients</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight">
                                Modern care for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                                    modern pets.
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                                Experience veterinary care reimagined. We combine advanced medicine with a gentle touch to keep your best friend happy and healthy.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/book/happy-paws">
                                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                        Book Appointment
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50">
                                    <Phone className="mr-2 w-5 h-5" />
                                    (02) 1234 5678
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <img
                                            key={i}
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt="User"
                                            className="w-10 h-10 rounded-full border-2 border-white"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center text-yellow-400 mb-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Loved by 2,000+ pet parents</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                                <img
                                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Happy dog"
                                    className="w-full h-auto object-cover"
                                />

                                {/* Floating Glass Cards */}
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 max-w-[180px]"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="font-bold text-gray-900">Health</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full w-[92%]" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">Optimal Condition</p>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center gap-4"
                                >
                                    <div className="bg-blue-100 p-3 rounded-xl">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Open 7 Days</p>
                                        <p className="text-sm text-gray-500">8:00 AM - 8:00 PM</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-2xl" />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-gray-400 to-transparent" />
                </motion.div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-32 bg-gray-50 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <motion.span variants={fadeIn} className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-4 block">
                            Our Expertise
                        </motion.span>
                        <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Comprehensive Care for <br /> Every Stage of Life
                        </motion.h2>
                        <motion.p variants={fadeIn} className="text-xl text-gray-600 leading-relaxed">
                            From preventative wellness to advanced surgery, we provide everything your pet needs under one roof.
                        </motion.p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Stethoscope className="w-8 h-8 text-white" />,
                                title: "Wellness Exams",
                                desc: "Comprehensive nose-to-tail checkups to keep your pet in peak condition.",
                                color: "bg-blue-500",
                                gradient: "from-blue-500 to-blue-600"
                            },
                            {
                                icon: <Syringe className="w-8 h-8 text-white" />,
                                title: "Vaccinations",
                                desc: "Essential protection against common diseases tailored to your pet's lifestyle.",
                                color: "bg-emerald-500",
                                gradient: "from-emerald-500 to-emerald-600"
                            },
                            {
                                icon: <Scissors className="w-8 h-8 text-white" />,
                                title: "Surgery & Dental",
                                desc: "Advanced surgical suite and dental care facilities for complete health.",
                                color: "bg-purple-500",
                                gradient: "from-purple-500 to-purple-600"
                            }
                        ].map((service, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                                className="group bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-900/5 border border-gray-100 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-bl-[100px] transition-all duration-500 group-hover:scale-150`} />

                                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">{service.desc}</p>
                                <Link href="/book/happy-paws" className="inline-flex items-center text-gray-900 font-bold group-hover:text-primary-600 transition-colors">
                                    Book Service <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 bg-[#0F172A] text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/10 text-blue-200">
                                <Star className="w-4 h-4 fill-current" />
                                Serving Sydney Since 2010
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                                More than a clinic. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">We're family.</span>
                            </h2>
                            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
                                Happy Paws began with a simple mission: to treat every pet as if they were our own. We combine cutting-edge technology with old-fashioned compassion to provide the highest standard of care.
                            </p>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-10 mt-12 border-t border-white/10 pt-12">
                                {[
                                    { label: "Happy Pets", value: "15k+" },
                                    { label: "Veterinary Experts", value: "50+" },
                                    { label: "Years of Excellence", value: "12+" },
                                    { label: "Industry Awards", value: "24" },
                                ].map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="text-4xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                                        <div className="text-gray-400 font-medium text-sm uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="mt-24"
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                        alt="Clinic interior"
                                        className="rounded-[2rem] shadow-2xl border-4 border-white/10"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: -40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                        alt="Happy dog"
                                        className="rounded-[2rem] shadow-2xl border-4 border-white/10"
                                    />
                                    <div className="mt-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                                        <p className="text-gray-200 italic">"The best care I've ever received for my dog. The team is simply amazing!"</p>
                                        <p className="text-blue-300 mt-4 font-bold text-sm">- Sarah & Max</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Meet the Experts</h2>
                        <p className="text-xl text-gray-600">
                            Passionate professionals committed to your pet's health and happiness.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                name: "Dr. Sarah Wilson",
                                role: "Medical Director",
                                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                specialty: "Surgery"
                            },
                            {
                                name: "Dr. Michael Chen",
                                role: "Senior Vet",
                                image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                specialty: "Internal Med"
                            },
                            {
                                name: "Emily Parker",
                                role: "Head Nurse",
                                image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                specialty: "Patient Care"
                            },
                            {
                                name: "James Wilson",
                                role: "Manager",
                                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                specialty: "Operations"
                            }
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group relative"
                            >
                                <div className="relative overflow-hidden rounded-[2rem] aspect-[3/4] mb-6 shadow-lg">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                                        <p className="text-sm font-medium text-gray-300 mb-4">{member.specialty}</p>
                                        <div className="flex gap-3">
                                            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white hover:text-primary-900 transition-colors">
                                                <LinkedinIcon className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white hover:text-primary-900 transition-colors">
                                                <MailIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-primary-600 font-medium">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-br from-primary-900 to-blue-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary-900/30">
                        {/* Animated Background */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            {/* CTA Section */}
                            <section className="py-32 bg-white relative overflow-hidden">
                                <div className="container mx-auto px-6">
                                    <div className="bg-gradient-to-br from-primary-900 via-blue-900 to-primary-950 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary-900/40 group">
                                        {/* Animated Background */}
                                        <div className="absolute inset-0">
                                            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse animation-delay-2000" />
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                        </div>

                                        {/* Floating Elements */}
                                        <motion.div
                                            animate={{ y: [0, -20, 0] }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-12 left-12 hidden lg:block"
                                        >
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl transform -rotate-12">
                                                <Calendar className="w-8 h-8 text-blue-300 mb-2" />
                                                <div className="w-16 h-2 bg-white/20 rounded-full mb-1" />
                                                <div className="w-10 h-2 bg-white/10 rounded-full" />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            animate={{ y: [0, 20, 0] }}
                                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                            className="absolute bottom-12 right-12 hidden lg:block"
                                        >
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl transform rotate-12">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                                                        <Check className="w-6 h-6 text-primary-900" />
                                                    </div>
                                                    <div>
                                                        <div className="w-20 h-2 bg-white/20 rounded-full mb-1" />
                                                        <div className="w-12 h-2 bg-white/10 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="relative z-10 max-w-4xl mx-auto">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/10 text-blue-200">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                Available Today
                                            </div>

                                            <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                                                Ready to schedule <br /> a visit?
                                            </h2>
                                            <p className="text-xl md:text-2xl text-blue-100 mb-12 font-light max-w-2xl mx-auto">
                                                Join <span className="font-bold text-white">15,000+ happy pets</span>. Book your appointment online in less than 2 minutes.
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                                <Link href="/book/happy-paws">
                                                    <Button size="lg" className="bg-white text-primary-900 hover:bg-blue-50 h-16 px-12 text-lg font-bold rounded-full shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group/btn">
                                                        <span className="relative z-10">Book Appointment Now</span>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                                    </Button>
                                                </Link>
                                                <Link href="#contact">
                                                    <Button variant="outline" size="lg" className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 h-16 px-12 text-lg font-bold rounded-full backdrop-blur-sm hover:border-white/40 transition-all">
                                                        Contact Support
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-blue-200/60">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-gray-300 overflow-hidden">
                                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p>Trusted by local pet owners</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <footer id="contact" className="bg-white border-t border-gray-100 pt-24 pb-12">
                                <div className="container mx-auto px-6">
                                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                                        <div className="col-span-1 md:col-span-2">
                                            <div className="flex items-center space-x-2 mb-8">
                                                <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-600/20">
                                                    <Heart className="w-6 h-6 text-white fill-current" />
                                                </div>
                                                <span className="text-2xl font-bold text-gray-900 tracking-tight">Happy Paws</span>
                                            </div>
                                            <p className="text-gray-500 max-w-sm leading-relaxed text-lg">
                                                Providing exceptional veterinary care to the Sydney community since 2010. We treat your pets like family.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-8 text-lg">Contact</h4>
                                            <ul className="space-y-6 text-gray-500">
                                                <li className="flex items-start group">
                                                    <div className="bg-primary-50 p-2 rounded-lg mr-4 group-hover:bg-primary-100 transition-colors">
                                                        <MapPin className="w-5 h-5 text-primary-600 shrink-0" />
                                                    </div>
                                                    <span className="group-hover:text-primary-700 transition-colors">123 Pet Street, <br /> Sydney NSW 2000</span>
                                                </li>
                                                <li className="flex items-center group">
                                                    <div className="bg-primary-50 p-2 rounded-lg mr-4 group-hover:bg-primary-100 transition-colors">
                                                        <Phone className="w-5 h-5 text-primary-600 shrink-0" />
                                                    </div>
                                                    <span className="group-hover:text-primary-700 transition-colors font-medium">(02) 1234 5678</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-8 text-lg">Hours</h4>
                                            <ul className="space-y-4 text-gray-500">
                                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                    <span>Mon - Fri</span>
                                                    <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-full text-sm">8am - 8pm</span>
                                                </li>
                                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                    <span>Saturday</span>
                                                    <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-full text-sm">9am - 5pm</span>
                                                </li>
                                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                    <span>Sunday</span>
                                                    <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-full text-sm">10am - 4pm</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                                        <p>© 2025 Happy Paws Veterinary Clinic. All rights reserved.</p>
                                        <div className="flex gap-8">
                                            <Link href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
                                            <Link href="#" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
                                            <Link href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</Link>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>
                        )
}

                        function LinkedinIcon({className}: {className ?: string}) {
    return (
                        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        )
}

                        function MailIcon({className}: {className ?: string}) {
    return (
                        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        )
}
