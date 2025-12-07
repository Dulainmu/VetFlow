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
import { Button } from "@/components/ui/button"
import { Search, Eye, UserPlus } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader, PageContainer } from "@/components/shared"

export default async function ClientsPage({
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
        role: "PET_OWNER" as const,
        OR: query
            ? [
                { firstName: { contains: query, mode: "insensitive" as const } },
                { lastName: { contains: query, mode: "insensitive" as const } },
                { email: { contains: query, mode: "insensitive" as const } },
                { pets: { some: { name: { contains: query, mode: "insensitive" as const } } } },
            ]
            : undefined,
    }

    const [clients, totalClients] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                pets: true,
                _count: {
                    select: { appointments: true },
                },
            },
            skip: (currentPage - 1) * itemsPerPage,
            take: itemsPerPage,
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(totalClients / itemsPerPage)

    return (
        <PageContainer>
            <PageHeader title="Clients">
                <Button asChild className="card-hover">
                    <Link href="/dashboard/clients/new">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Client
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex items-center space-x-2 animate-fade-in">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients or pets..."
                        className="pl-8"
                        defaultValue={query}
                    />
                </div>
            </div>

            <div className="rounded-md border animate-scale-in bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Pets</TableHead>
                            <TableHead>Appointments</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client, idx) => (
                                <TableRow
                                    key={client.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage src={client.avatarUrl || ""} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {client.firstName[0]}
                                                    {client.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold">
                                                    {client.firstName} {client.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Member since {new Date(client.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{client.email}</span>
                                            <span className="text-muted-foreground">{client.phone || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {client.pets.map((pet) => (
                                                <Badge key={pet.id} variant="secondary" className="bg-primary/10 text-primary border-0">
                                                    {pet.name} ({pet.species})
                                                </Badge>
                                            ))}
                                            {client.pets.length === 0 && (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {client._count.appointments} visits
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
                                            <Link href={`/dashboard/clients/${client.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                >
                    {currentPage > 1 ? (
                        <Link href={`/dashboard/clients?page=${currentPage - 1}&query=${query}`}>
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
                        <Link href={`/dashboard/clients?page=${currentPage + 1}&query=${query}`}>
                            Next
                        </Link>
                    ) : (
                        <span>Next</span>
                    )}
                </Button>
            </div>
        </PageContainer>
    )
}
