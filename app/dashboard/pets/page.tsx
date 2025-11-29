import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Search, Eye, Plus, PawPrint } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function PetsPage({
    searchParams,
}: {
    searchParams: { query?: string; page?: string }
}) {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    const query = searchParams?.query || ""
    const currentPage = Number(searchParams?.page) || 1
    const itemsPerPage = 10

    const where = {
        clinicId: session.user.clinicId,
        isActive: true,
        OR: query
            ? [
                { name: { contains: query, mode: "insensitive" as const } },
                { species: { equals: query.toUpperCase() as any } }, // Simple species match
                { breed: { contains: query, mode: "insensitive" as const } },
                { owner: { firstName: { contains: query, mode: "insensitive" as const } } },
                { owner: { lastName: { contains: query, mode: "insensitive" as const } } },
            ]
            : undefined,
    }

    const [pets, totalPets] = await Promise.all([
        prisma.pet.findMany({
            where,
            include: {
                owner: true,
            },
            skip: (currentPage - 1) * itemsPerPage,
            take: itemsPerPage,
            orderBy: { createdAt: "desc" },
        }),
        prisma.pet.count({ where }),
    ])

    const totalPages = Math.ceil(totalPets / itemsPerPage)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Pets</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/dashboard/pets/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Pet
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search pets, breeds, or owners..."
                        className="pl-8"
                        defaultValue={query}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pet</TableHead>
                            <TableHead>Species/Breed</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No pets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pets.map((pet) => (
                                <TableRow key={pet.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <PawPrint className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{pet.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {pet.gender}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="capitalize">{pet.species.toLowerCase()}</span>
                                            <span className="text-muted-foreground">{pet.breed || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/dashboard/clients/${pet.ownerId}`}
                                            className="hover:underline text-primary"
                                        >
                                            {pet.owner.firstName} {pet.owner.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {pet.dateOfBirth ? new Date().getFullYear() - new Date(pet.dateOfBirth).getFullYear() : "?"} yrs
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* We can add a pet details view later if needed, for now link to client */}
                                        <Link
                                            href={`/dashboard/pets/${pet.id}`}
                                            className={buttonVariants({ variant: "ghost", size: "icon" })}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Simple Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                >
                    {currentPage > 1 ? (
                        <Link href={`/dashboard/pets?page=${currentPage - 1}&query=${query}`}>
                            Previous
                        </Link>
                    ) : (
                        <span>Previous</span>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                >
                    {currentPage < totalPages ? (
                        <Link href={`/dashboard/pets?page=${currentPage + 1}&query=${query}`}>
                            Next
                        </Link>
                    ) : (
                        <span>Next</span>
                    )}
                </Button>
            </div>
        </div>
    )
}
