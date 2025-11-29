"use client"

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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createVaccination } from "@/lib/vaccination-actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Syringe } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    vaccineName: z.string().min(1, "Vaccine name is required"),
    dateGiven: z.string(),
    nextDueDate: z.string().optional(),
    batchNumber: z.string().optional(),
    notes: z.string().optional(),
})

export function VaccinationDialog({ petId }: { petId: string }) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vaccineName: "",
            dateGiven: new Date().toISOString().split("T")[0],
            nextDueDate: "",
            batchNumber: "",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await createVaccination({
            petId,
            vaccineName: values.vaccineName,
            dateGiven: values.dateGiven,
            nextDueDate: values.nextDueDate || undefined,
            batchNumber: values.batchNumber,
            notes: values.notes,
        })

        if (result.success) {
            toast({
                title: "Vaccination recorded",
                description: "The vaccination record has been saved.",
            })
            setOpen(false)
            form.reset()
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Syringe className="mr-2 h-4 w-4" />
                    Add Vaccination
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Vaccination</DialogTitle>
                    <DialogDescription>
                        Record a vaccination and set the next due date.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="vaccineName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vaccine Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. C5, F3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dateGiven"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date Given</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nextDueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Next Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="batchNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Batch #" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Reaction, site, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Vaccination
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
