
import { auth } from "@/auth"
import { getInvoices } from "@/lib/billing-actions"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog"
import { PageHeader, PageContainer } from "@/components/shared"

export default async function BillingPage() {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    const invoices = await getInvoices()

    return (
        <PageContainer>
            <PageHeader title="Billing & Invoices">
                <CreateInvoiceDialog />
            </PageHeader>

            <div className="rounded-md border animate-scale-in bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice, idx) => (
                                <TableRow
                                    key={invoice.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="font-medium">
                                        {invoice.invoiceNumber}
                                    </TableCell>
                                    <TableCell>
                                        {format(invoice.issueDate, "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        {invoice.appointment?.pet.owner.firstName} {invoice.appointment?.pet.owner.lastName}
                                        <div className="text-xs text-muted-foreground">
                                            {invoice.appointment?.pet.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>Rs. {invoice.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                invoice.status === "PAID"
                                                    ? "default"
                                                    : invoice.status === "OVERDUE"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                            className={
                                                invoice.status === "PAID" ? "bg-green-600 hover:bg-green-700" : ""
                                            }
                                        >
                                            {invoice.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                                            <Link href={`/dashboard/billing/${invoice.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </PageContainer>
    )
}
