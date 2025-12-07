"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2, CalendarIcon } from "lucide-react"
import { createAvailabilityRule, getAvailabilityRules, deleteAvailabilityRule } from "@/lib/availability-actions"
import { AvailabilityType } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function AvailabilityPage() {
    const [rules, setRules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const { toast } = useToast()

    // Form state
    const [type, setType] = useState<AvailabilityType>("BLOCKED")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [notes, setNotes] = useState("")

    useEffect(() => {
        loadRules()
    }, [])

    async function loadRules() {
        setLoading(true)
        const data = await getAvailabilityRules()
        setRules(data)
        setLoading(false)
    }

    async function handleCreate() {
        if (!startDate || !endDate) {
            toast({ variant: "destructive", title: "Dates required" })
            return
        }

        const res = await createAvailabilityRule({
            startDate,
            endDate,
            type,
            notes,
            vetId: undefined // Clinic-wide by default for now
        })

        if (res.success) {
            toast({ title: "Rule created" })
            setCreateOpen(false)
            setStartDate(undefined)
            setEndDate(undefined)
            setNotes("")
            loadRules()
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return
        const res = await deleteAvailabilityRule(id)
        if (res.success) {
            toast({ title: "Rule deleted" })
            loadRules()
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error })
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Availability Rules</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Availability Rule</DialogTitle>
                            <DialogDescription>
                                Block time for holidays, maintenance, or closed days.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as AvailabilityType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BLOCKED">Blocked (Closed)</SelectItem>
                                        <SelectItem value="VACATION">Vacation (Staff)</SelectItem>
                                        <SelectItem value="OVERRIDE">Override</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for blocking..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Save Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.type}</TableCell>
                                    <TableCell>{format(new Date(rule.startDate), "PPP")}</TableCell>
                                    <TableCell>{format(new Date(rule.endDate), "PPP")}</TableCell>
                                    <TableCell>{rule.notes}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No availability rules found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
