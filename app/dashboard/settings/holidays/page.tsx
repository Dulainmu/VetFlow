"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPublicHoliday, deletePublicHoliday, getPublicHolidays } from "@/lib/resource-actions"
import { PublicHoliday } from "@prisma/client"
import { Trash2, Plus, Calendar } from "lucide-react"
import { format } from "date-fns"

export default function HolidaysPage({ params }: { params: { clinicSlug: string } }) {
    const [holidays, setHolidays] = useState<PublicHoliday[]>([])
    const [newName, setNewName] = useState("")
    const [newDate, setNewDate] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadHolidays()
    }, [])

    async function loadHolidays() {
        const data = await getPublicHolidays()
        setHolidays(data)
        setLoading(false)
    }

    async function handleAdd() {
        if (!newName || !newDate) return
        await createPublicHoliday({ name: newName, date: new Date(newDate) })
        setNewName("")
        setNewDate("")
        loadHolidays()
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure?")) {
            await deletePublicHoliday(id)
            loadHolidays()
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Public Holidays</h1>
                <p className="text-gray-500">Manage clinic closures for holidays.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex gap-4">
                    <Input
                        placeholder="Holiday Name (e.g. Christmas)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-[200px]"
                    />
                    <Button onClick={handleAdd} disabled={!newName || !newDate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>

                <div className="space-y-2">
                    {loading ? <p>Loading...</p> : holidays.map((holiday) => (
                        <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium w-32">{format(new Date(holiday.date), 'MMM d, yyyy')}</span>
                                <span className="font-medium">{holiday.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(holiday.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {!loading && holidays.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No holidays added yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
