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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createMedicalRecord } from "@/lib/medical-actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    visitDate: z.string(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatment: z.string().optional(),
    notes: z.string().optional(),
    weight: z.string().optional(), // Input as string, convert to number
    temperature: z.string().optional(),
    heartRate: z.string().optional(),
})

export function MedicalRecordDialog({ petId }: { petId: string }) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            visitDate: new Date().toISOString().split("T")[0],
            diagnosis: "",
            treatment: "",
            notes: "",
            weight: "",
            temperature: "",
            heartRate: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await createMedicalRecord({
            petId,
            visitDate: values.visitDate,
            diagnosis: values.diagnosis,
            treatment: values.treatment,
            notes: values.notes,
            weight: values.weight ? parseFloat(values.weight) : undefined,
            temperature: values.temperature ? parseFloat(values.temperature) : undefined,
            heartRate: values.heartRate ? parseInt(values.heartRate) : undefined,
        })

        if (result.success) {
            toast({
                title: "Record created",
                description: "The medical record has been saved.",
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
                    <FileText className="mr-2 h-4 w-4" />
                    Add Record
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Medical Record</DialogTitle>
                    <DialogDescription>
                        Record details of the visit, diagnosis, and treatment.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="visitDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visit Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="diagnosis"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Diagnosis</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Otitis Externa" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Temp (°C)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="heartRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>HR (bpm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="treatment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Treatment / Plan</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Medications prescribed, procedures performed..." {...field} />
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
                                    <FormLabel>Internal Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional observations..." {...field} />
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
                                Save Record
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
