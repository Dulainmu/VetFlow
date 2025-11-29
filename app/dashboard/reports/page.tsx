import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAppointmentStats, getRevenueStats } from "@/lib/report-actions"
import { redirect } from "next/navigation"
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Client component wrapper for charts to avoid SSR issues with Recharts
import { ReportsCharts } from "@/components/reports/reports-charts"

export default async function ReportsPage() {
    const session = await auth()
    if (!session?.user?.clinicId) redirect("/login")

    const revenueData = await getRevenueStats()
    const appointmentData = await getAppointmentStats()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ReportsCharts type="revenue" data={revenueData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Appointments by Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReportsCharts type="appointments" data={appointmentData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
