"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createManualAppointment, searchOwners, getPetsForOwner } from "@/lib/appointment-actions"
import { Service, User } from "@prisma/client"

const formSchema = z.object({
    ownerId: z.string().min(1, "Owner is required"),
    petId: z.string().min(1, "Pet is required"),
    serviceId: z.string().min(1, "Service is required"),
    vetId: z.string().min(1, "Vet is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    notes: z.string().optional(),
    force: z.boolean().default(false).optional(),
})

interface CreateAppointmentDialogProps {
    clinicId: string
    services: Service[]
    vets: User[]
}

export function CreateAppointmentDialog({ clinicId, services, vets }: CreateAppointmentDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const [owners, setOwners] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([])
    const [pets, setPets] = useState<{ id: string; name: string; species: string }[]>([])
    const [isSearchingOwners, setIsSearchingOwners] = useState(false)
    const [openOwnerSearch, setOpenOwnerSearch] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ownerId: "",
            petId: "",
            serviceId: "",
            vetId: "",
            date: format(new Date(), "yyyy-MM-dd"),
            time: "09:00",
            notes: "",
        },
    })

    const selectedOwnerId = form.watch("ownerId")

    // Fetch pets when owner changes
    useEffect(() => {
        if (selectedOwnerId) {
            getPetsForOwner(selectedOwnerId).then(setPets)
        } else {
            setPets([])
        }
    }, [selectedOwnerId])

    async function onSearchOwners(query: string) {
        if (query.length < 2) return
        setIsSearchingOwners(true)
        try {
            const results = await searchOwners(clinicId, query)
            setOwners(results)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearchingOwners(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const appointmentDate = new Date(`${values.date}T${values.time}`)

        const result = await createManualAppointment({
            clinicId,
            ownerId: values.ownerId,
            petId: values.petId,
            serviceId: values.serviceId,
            vetId: values.vetId,
            date: appointmentDate,
            notes: values.notes,
            force: values.force,
        })

        if (result.success) {
            toast({
                title: "Appointment created",
                description: "The appointment has been successfully booked.",
            })
            setOpen(false)
            form.reset()
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Appointment</DialogTitle>
                    <DialogDescription>
                        Manually book an appointment for an existing client.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Owner Search */}
                        <FormField
                            control={form.control}
                            name="ownerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Owner</FormLabel>
                                    <Popover open={openOwnerSearch} onOpenChange={setOpenOwnerSearch}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openOwnerSearch}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? owners.find((owner) => owner.id === field.value)
                                                            ? `${owners.find((owner) => owner.id === field.value)?.firstName} ${owners.find((owner) => owner.id === field.value)?.lastName}`
                                                            : "Select owner..."
                                                        : "Search owner..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Search by name, email or mobile..."
                                                    onValueChange={(value: string) => onSearchOwners(value)}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No owners found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {owners.map((owner) => (
                                                            <CommandItem
                                                                key={owner.id}
                                                                value={owner.id}
                                                                onSelect={() => {
                                                                    form.setValue("ownerId", owner.id)
                                                                    setOpenOwnerSearch(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        owner.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{owner.firstName} {owner.lastName}</span>
                                                                    <span className="text-xs text-muted-foreground">{owner.email}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pet Selection */}
                        <FormField
                            control={form.control}
                            name="petId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pet</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedOwnerId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select pet" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pets.map((pet) => (
                                                <SelectItem key={pet.id} value={pet.id}>
                                                    {pet.name} ({pet.species.toLowerCase()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Service Selection */}
                            <FormField
                                control={form.control}
                                name="serviceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select service" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {services.map((service) => (
                                                    <SelectItem key={service.id} value={service.id}>
                                                        {service.name} ({service.duration} min)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Vet Selection */}
                            <FormField
                                control={form.control}
                                name="vetId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vet</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vet" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vets.map((vet) => (
                                                    <SelectItem key={vet.id} value={vet.id}>
                                                        {vet.firstName} {vet.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Time */}
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Internal Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any special instructions..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center space-x-2 pt-4">
                            <Checkbox id="force" onCheckedChange={(checked) => form.setValue("force", checked as boolean)} />
                            <label
                                htmlFor="force"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-600"
                            >
                                Emergency Override (Force Book)
                            </label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting} variant={form.watch("force") ? "destructive" : "default"}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.watch("force") ? "Force Book Appointment" : "Create Appointment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
