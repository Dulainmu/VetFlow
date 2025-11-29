import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, FileText, Syringe } from "lucide-react"
import Link from "next/link"
import { MedicalRecordDialog } from "@/components/medical/medical-record-dialog"
import { VaccinationDialog } from "@/components/medical/vaccination-dialog"

export default async function PetDetailsPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    const pet = await prisma.pet.findUnique({
        where: {
            id: params.id,
            clinicId: session.user.clinicId,
        },
        include: {
            owner: true,
            vaccinations: {
                orderBy: { dateGiven: "desc" }
            },
            medicalRecords: {
                orderBy: { visitDate: "desc" },
                include: {
                    vet: true
                }
            },
            appointments: {
                orderBy: { appointmentDate: "desc" },
                take: 5,
                include: {
                    service: true
                }
            }
        }
    })

    if (!pet) notFound()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/pets">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">{pet.name}</h2>
                    <Badge variant={pet.isActive ? "default" : "secondary"}>
                        {pet.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Actions will go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Pet Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={pet.photoUrl || ""} />
                            <AvatarFallback className="text-4xl">
                                {pet.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Species</p>
                                    <p className="font-medium">{pet.species}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Breed</p>
                                    <p className="font-medium">{pet.breed || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Gender</p>
                                    <p className="font-medium">{pet.gender}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Age</p>
                                    <p className="font-medium">
                                        {pet.dateOfBirth ?
                                            `${new Date().getFullYear() - new Date(pet.dateOfBirth).getFullYear()} years`
                                            : "Unknown"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Weight</p>
                                    <p className="font-medium">{pet.weight ? `${pet.weight} kg` : "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Microchip</p>
                                    <p className="font-medium">{pet.microchipNo || "None"}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium mb-2">Owner Details</p>
                                <Link href={`/dashboard/clients/${pet.ownerId}`} className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>{pet.owner.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{pet.owner.firstName} {pet.owner.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{pet.owner.email}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-5">
                    <Tabs defaultValue="medical" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="medical">Medical History</TabsTrigger>
                            <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="medical" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Medical Records</h3>
                                <MedicalRecordDialog petId={pet.id} />
                            </div>
                            {pet.medicalRecords.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No medical records found.
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pet.medicalRecords.map((record) => (
                                        <Card key={record.id}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base">
                                                            {format(record.visitDate, "PPP")}
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground">
                                                            Dr. {record.vet.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                                                        <p>{record.diagnosis || "No diagnosis recorded"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Treatment</p>
                                                        <p>{record.treatment || "No treatment recorded"}</p>
                                                    </div>
                                                    {record.notes && (
                                                        <div className="col-span-2">
                                                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                                            <p className="text-sm">{record.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="vaccinations" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Vaccinations</h3>
                                <VaccinationDialog petId={pet.id} />
                            </div>
                            {pet.vaccinations.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No vaccinations recorded.
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="relative w-full overflow-auto">
                                            <table className="w-full caption-bottom text-sm">
                                                <thead className="[&_tr]:border-b">
                                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vaccine</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Given</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Next Due</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="[&_tr:last-child]:border-0">
                                                    {pet.vaccinations.map((vax) => (
                                                        <tr key={vax.id} className="border-b transition-colors hover:bg-muted/50">
                                                            <td className="p-4 align-middle font-medium">{vax.vaccineName}</td>
                                                            <td className="p-4 align-middle">{format(vax.dateGiven, "MMM d, yyyy")}</td>
                                                            <td className="p-4 align-middle">{vax.nextDueDate ? format(vax.nextDueDate, "MMM d, yyyy") : "-"}</td>
                                                            <td className="p-4 align-middle">
                                                                {vax.nextDueDate && new Date(vax.nextDueDate) < new Date() ? (
                                                                    <Badge variant="destructive">Overdue</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Up to date</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="appointments" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Recent Appointments</h3>
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/appointments">View All</Link>
                                </Button>
                            </div>
                            {pet.appointments.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No appointments found.
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pet.appointments.map((apt) => (
                                        <Card key={apt.id}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{apt.service.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(apt.appointmentDate, "PPP")} at {format(apt.appointmentDate, "p")}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    apt.status === "CONFIRMED" ? "default" :
                                                        apt.status === "COMPLETED" ? "secondary" :
                                                            apt.status === "CANCELED" ? "destructive" : "outline"
                                                }>
                                                    {apt.status}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
