
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/reports/date-range-picker"
import { OverviewChart, RevenuePieChart } from "@/components/reports/charts"
import { getAppointmentTrends, getRevenueMetrics, getVetPerformance, DateRange } from "@/lib/analytics-actions"
import { Loader2, DollarSign, Users, Calendar } from "lucide-react"
import { PageHeader, PageContainer, StaggerGrid, AnimatedCard } from "@/components/shared"

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange>("7d")
    const [loading, setLoading] = useState(true)
    const [trends, setTrends] = useState<any[]>([])
    const [revenue, setRevenue] = useState<{ totalRevenue: number; byService: any[] }>({ totalRevenue: 0, byService: [] })
    const [vetPerformance, setVetPerformance] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const [trendsData, revenueData, vetData] = await Promise.all([
                    getAppointmentTrends(dateRange),
                    getRevenueMetrics(dateRange),
                    getVetPerformance(dateRange),
                ])
                setTrends(trendsData)
                setRevenue(revenueData)
                setVetPerformance(vetData)
            } catch (error) {
                console.error("Failed to load analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [dateRange])

    return (
        <PageContainer>
            <PageHeader title="Reports & Analytics">
                <DateRangePicker value={dateRange} onValueChange={setDateRange} />
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center h-96 animate-fade-in">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="overview" className="space-y-4 animate-fade-in">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="performance">Vet Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <StaggerGrid cols={4}>
                            <AnimatedCard>
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <span className="text-sm font-medium">Total Appointments</span>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">
                                    {trends.reduce((acc, curr) => acc + curr.total, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">In selected period</p>
                            </AnimatedCard>
                            <AnimatedCard delay={50}>
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <span className="text-sm font-medium">Total Revenue</span>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">Rs. {revenue.totalRevenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">In selected period</p>
                            </AnimatedCard>
                        </StaggerGrid>
                        <AnimatedCard
                            title="Appointment Trends"
                            className="col-span-4"
                            delay={100}
                        >
                            <OverviewChart data={trends} />
                        </AnimatedCard>
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 stagger-children">
                            <AnimatedCard
                                title="Revenue by Service"
                                description="Distribution of revenue across different service types."
                                className="col-span-4"
                            >
                                <RevenuePieChart data={revenue.byService} />
                            </AnimatedCard>
                            <AnimatedCard
                                title="Top Services"
                                description="Highest earning services in this period."
                                className="col-span-3"
                                delay={50}
                            >
                                <div className="space-y-4">
                                    {revenue.byService.slice(0, 5).map((service, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <p className="text-sm font-medium">{service.name}</p>
                                            <div className="font-bold text-primary">
                                                +Rs. {service.value.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AnimatedCard>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <AnimatedCard
                            title="Veterinarian Performance"
                            description="Appointments completed and revenue generated per vet."
                        >
                            <div className="space-y-4">
                                {vetPerformance.map((vet, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border rounded-lg card-hover animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {vet.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{vet.name}</p>
                                                <p className="text-sm text-muted-foreground">{vet.appointments} appointments</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-lg">
                                            Rs. {vet.revenue.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AnimatedCard>
                    </TabsContent>
                </Tabs>
            )}
        </PageContainer>
    )
}
