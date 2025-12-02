"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type BookingDetails = {
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    petName: string
    petSpecies: string
    petBreed: string
    petAge: string
    petGender: string
    password?: string // Add password to type
}

interface DetailsFormProps {
    defaultValues?: Partial<BookingDetails>
    onChange: (details: BookingDetails) => void
    emailExists?: boolean
    hasPassword?: boolean // New prop to know if existing user has password
    isCheckingEmail?: boolean
    showPasswordField?: boolean // New prop to force showing password field (e.g. guest upsell accepted)
}

export default function DetailsForm({
    defaultValues,
    onChange,
    emailExists = false,
    hasPassword = false,
    isCheckingEmail = false,
    showPasswordField = false
}: DetailsFormProps) {
    const [details, setDetails] = useState<BookingDetails>({
        ownerName: defaultValues?.ownerName || "",
        ownerEmail: defaultValues?.ownerEmail || "",
        ownerPhone: defaultValues?.ownerPhone || "",
        petName: defaultValues?.petName || "",
        petSpecies: defaultValues?.petSpecies || "",
        petBreed: defaultValues?.petBreed || "",
        petAge: defaultValues?.petAge || "",
        petGender: defaultValues?.petGender || "",
        password: defaultValues?.password || ""
    })

    const [password, setPassword] = useState(defaultValues?.password || "")

    const handleChange = (field: keyof BookingDetails, value: string) => {
        const newDetails = { ...details, [field]: value }
        setDetails(newDetails)
        onChange(newDetails)
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value)
        const newDetails = { ...details, password: value }
        onChange(newDetails)
    }

    // Effect to update parent with password when it changes
    const updatePassword = (val: string) => {
        setPassword(val)
        onChange({ ...details, password: val })
    }

    const showPasswordInput = showPasswordField || (emailExists && !hasPassword)

    return (
        <div className="space-y-8">
            {/* Login Prompt - Only show if email exists AND has password */}
            {emailExists && hasPassword && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="text-center sm:text-left">
                        <h4 className="font-medium text-blue-900">Already have an account?</h4>
                        <p className="text-sm text-blue-700">Log in to pre-fill your details and manage your booking.</p>
                    </div>
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 whitespace-nowrap">
                            Sign In
                        </Button>
                    </Link>
                </div>
            )}

            {/* Claim Account Prompt */}
            {emailExists && !hasPassword && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-purple-100 rounded-full mt-1">
                        <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-purple-900">Welcome back!</h4>
                        <p className="text-sm text-purple-700">
                            It looks like you've booked with us before. Set a password below to claim your account and track your pet's history.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Owner Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Owner Information</h3>

                    <div className="space-y-2">
                        <Label htmlFor="ownerName">Full Name</Label>
                        <Input
                            id="ownerName"
                            placeholder="John Doe"
                            value={details.ownerName}
                            onChange={(e) => handleChange("ownerName", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ownerEmail">Email Address</Label>
                        <div className="relative">
                            <Input
                                id="ownerEmail"
                                type="email"
                                placeholder="john@example.com"
                                value={details.ownerEmail}
                                onChange={(e) => handleChange("ownerEmail", e.target.value)}
                                className={cn(emailExists && hasPassword && "border-red-300 focus-visible:ring-red-200")}
                                required
                            />
                            {isCheckingEmail && (
                                <div className="absolute right-3 top-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                        {emailExists && hasPassword && (
                            <p className="text-xs text-red-600 font-medium animate-in slide-in-from-top-1">
                                This email is already registered. <Link href="/login" className="underline hover:text-red-700">Please log in</Link> to continue.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ownerPhone">Phone Number</Label>
                        <Input
                            id="ownerPhone"
                            type="tel"
                            placeholder="0400 000 000"
                            value={details.ownerPhone}
                            onChange={(e) => handleChange("ownerPhone", e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Field - Conditionally Rendered */}
                    {showPasswordInput && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="password">Set a Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => updatePassword(e.target.value)}
                                required
                                minLength={8}
                                className="border-purple-200 focus-visible:ring-purple-200"
                            />
                            <p className="text-xs text-gray-500">
                                {emailExists && !hasPassword
                                    ? "Create a password to secure your account."
                                    : "Create a password to save your details for next time."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pet Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Pet Information</h3>

                    <div className="space-y-2">
                        <Label htmlFor="petName">Pet's Name</Label>
                        <Input
                            id="petName"
                            placeholder="Bella"
                            value={details.petName}
                            onChange={(e) => handleChange("petName", e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="petSpecies">Species</Label>
                            <Select
                                value={details.petSpecies}
                                onValueChange={(value: string) => handleChange("petSpecies", value)}
                            >
                                <SelectTrigger id="petSpecies">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dog">Dog</SelectItem>
                                    <SelectItem value="Cat">Cat</SelectItem>
                                    <SelectItem value="Bird">Bird</SelectItem>
                                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="petGender">Gender</Label>
                            <Select
                                value={details.petGender}
                                onValueChange={(value: string) => handleChange("petGender", value)}
                            >
                                <SelectTrigger id="petGender">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="petBreed">Breed</Label>
                            <Input
                                id="petBreed"
                                placeholder="Golden Retriever"
                                value={details.petBreed}
                                onChange={(e) => handleChange("petBreed", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="petAge">Age (Years)</Label>
                            <Input
                                id="petAge"
                                type="number"
                                placeholder="3"
                                value={details.petAge}
                                onChange={(e) => handleChange("petAge", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

