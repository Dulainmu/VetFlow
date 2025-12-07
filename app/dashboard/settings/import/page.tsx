"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, FileType, CheckCircle, XCircle } from "lucide-react"
import { importClientsAndPets } from "@/lib/import-service"

// Clinic ID is handled server-side in the action for security.

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isImporting, setIsImporting] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setIsImporting(true)
        try {
            const text = await file.text()
            // We need to fetch the clinic ID. 
            // Since this is a client component, we don't have direct access to session securely for passing ID.
            // The Server Action should handle `auth()`.
            // The Server Action now handles auth internally
            const res = await importClientsAndPets(text)
            setResult(res)
        } catch (error) {
            console.error("Import error:", error)
            setResult({ success: false, error: "Failed to upload file" })
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Data Migration</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Import Clients & Pets</CardTitle>
                        <CardDescription>Upload a CSV file to bulk import data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                            <Upload className="w-12 h-12 text-blue-500 mb-4" />
                            <p className="font-medium text-gray-700 mb-1">Upload Client Data (CSV)</p>
                            <p className="text-sm text-gray-500 mb-2">Drag and drop or click to browse</p>
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="max-w-xs"
                            />
                        </div>

                        {file && (
                            <div className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-md">
                                <FileType className="w-5 h-5 mr-3" />
                                <span className="font-medium truncate flex-1">{file.name}</span>
                                <span className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        )}

                        <Button
                            onClick={handleImport}
                            disabled={!file || isImporting}
                            className="w-full"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                "Start Import"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Import status and summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!result && !isImporting && (
                            <p className="text-gray-500 text-sm">No import run yet.</p>
                        )}

                        {result && (
                            <div className="space-y-4">
                                {result.success ? (
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <AlertTitle className="text-green-800">Import Successful</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            Processed {result.count} records.
                                            {result.failures > 0 && ` (${result.failures} failed)`}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <XCircle className="w-4 h-4" />
                                        <AlertTitle>Import Failed</AlertTitle>
                                        <AlertDescription>{result.error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        <div className="mt-6">
                            <h4 className="font-semibold mb-2 text-sm">CSV Format Required:</h4>
                            <code className="block bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                OwnerFirstName,OwnerLastName,OwnerEmail,OwnerPhone,PetName,PetSpecies,PetBreed
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
