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
import { Plus, Trash2, Loader2 } from "lucide-react"
import { createResource, getResources, deleteResource } from "@/lib/resource-actions"
import { ResourceType } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

export default function ResourcesPage() {
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [createOpen, setCreateOpen] = useState(false)
    const { toast } = useToast()

    // Form state
    const [name, setName] = useState("")
    const [type, setType] = useState<ResourceType>("ROOM")

    useEffect(() => {
        loadResources()
    }, [])

    async function loadResources() {
        setLoading(true)
        const data = await getResources()
        setResources(data)
        setLoading(false)
    }

    async function handleCreate() {
        if (!name) return

        const res = await createResource({ name, type })
        if (res.success) {
            toast({ title: "Resource created" })
            setCreateOpen(false)
            setName("")
            loadResources()
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return
        const res = await deleteResource(id)
        if (res.success) {
            toast({ title: "Resource deleted" })
            loadResources()
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error })
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Resource</DialogTitle>
                            <DialogDescription>
                                Add a room or equipment to manage availability.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Consult Room 1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ROOM">Room</SelectItem>
                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                        <SelectItem value="VEHICLE">Vehicle (Mobile Van)</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Save</Button>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.name}</TableCell>
                                    <TableCell>{resource.type}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {resources.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                        No resources found.
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
