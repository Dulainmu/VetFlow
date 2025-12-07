import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getClinicProfile } from "@/lib/clinic-actions"
import { BusinessHoursForm } from "@/components/settings/business-hours-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Package, Truck } from "lucide-react"
import { getServices } from "@/lib/service-actions"
import { ServicesList } from "@/components/settings/services-list"
import { PageHeader, PageContainer, AnimatedCard } from "@/components/shared"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.clinicId) {
        redirect("/login")
    }

    const [clinic, services] = await Promise.all([
        getClinicProfile(session.user.clinicId),
        getServices(session.user.clinicId),
    ])

    if (!clinic) {
        return <div>Clinic not found</div>
    }

    return (
        <PageContainer>
            <PageHeader title="Settings" />

            <Tabs defaultValue="profile" className="space-y-4 animate-fade-in">
                <TabsList>
                    <TabsTrigger value="profile">Clinic Profile</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <div className="animate-scale-in">
                        <BusinessHoursForm clinic={clinic} />
                    </div>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4 stagger-children">
                    <AnimatedCard
                        title="Staff Management"
                        description="Manage veterinarians, receptionists, and other staff members."
                    >
                        <p className="mb-4 text-sm text-muted-foreground">
                            Go to the dedicated Staff Management page to add, remove, or update staff accounts.
                        </p>
                        <Button asChild className="card-hover">
                            <Link href="/dashboard/settings/staff">
                                <Users className="mr-2 h-4 w-4" /> Manage Staff
                            </Link>
                        </Button>
                    </AnimatedCard>
                    <AnimatedCard
                        title="Holidays"
                        description="Configure public holidays and clinic closure dates."
                        delay={50}
                    >
                        <p className="mb-4 text-sm text-muted-foreground">
                            Set up dates when the clinic will be closed.
                        </p>
                        <Button asChild variant="outline" className="card-hover">
                            <Link href="/dashboard/settings/holidays">
                                <Calendar className="mr-2 h-4 w-4" /> Manage Holidays
                            </Link>
                        </Button>
                    </AnimatedCard>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                    <div className="animate-scale-in">
                        <ServicesList services={services} />
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4 stagger-children">
                    <AnimatedCard
                        title="Resources & Equipment"
                        description="Manage rooms, equipment, and mobile units."
                    >
                        <p className="mb-4 text-sm text-muted-foreground">
                            Define resources like Surgery Rooms, Mobile Vans, and Equipment that can be booked.
                        </p>
                        <Button asChild className="card-hover">
                            <Link href="/dashboard/settings/resources">
                                <Package className="mr-2 h-4 w-4" /> Manage Resources
                            </Link>
                        </Button>
                    </AnimatedCard>
                    <AnimatedCard
                        title="Availability Rules"
                        description="Set up blocked times and availability patterns."
                        delay={50}
                    >
                        <p className="mb-4 text-sm text-muted-foreground">
                            Configure when vets and resources are available or blocked.
                        </p>
                        <Button asChild variant="outline" className="card-hover">
                            <Link href="/dashboard/settings/availability">
                                <Truck className="mr-2 h-4 w-4" /> Manage Availability
                            </Link>
                        </Button>
                    </AnimatedCard>
                </TabsContent>
            </Tabs>
        </PageContainer>
    )
}
