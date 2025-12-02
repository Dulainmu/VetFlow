
import { auth } from "@/auth"
import { getInvoice } from "@/lib/billing-actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog"
import { Printer } from "lucide-react"

export default async function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    const invoice = await getInvoice(params.id)
    if (!invoice) redirect("/dashboard/billing")

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoiceNumber}</h2>
                    <p className="text-muted-foreground">
                        Issued on {format(invoice.issueDate, "MMMM d, yyyy")}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    {invoice.status !== "PAID" && (
                        <RecordPaymentDialog invoiceId={invoice.id} balance={invoice.total - invoice.amountPaid} />
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="font-medium">
                                {invoice.appointment?.pet.owner.firstName} {invoice.appointment?.pet.owner.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{invoice.appointment?.pet.owner.email}</p>
                            <p className="text-sm text-muted-foreground">{invoice.appointment?.pet.owner.mobile}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Total Amount</p>
                                <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-sm font-medium">Amount Paid</p>
                                <p className="text-2xl font-bold text-green-600">${invoice.amountPaid.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Badge
                                variant={
                                    invoice.status === "PAID"
                                        ? "default"
                                        : invoice.status === "OVERDUE"
                                            ? "destructive"
                                            : "secondary"
                                }
                                className="text-lg px-4 py-1"
                            >
                                {invoice.status.replace("_", " ")}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {invoice.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-medium">${item.total.toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>GST (10%)</span>
                                <span>${invoice.tax.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {invoice.payments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {invoice.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">
                                            {format(payment.processedAt, "MMM d, yyyy")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.method.replace("_", " ")} {payment.reference ? `(${payment.reference})` : ""}
                                        </p>
                                    </div>
                                    <p className="font-medium text-green-600">
                                        +${payment.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
