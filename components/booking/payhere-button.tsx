"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PayHereButtonProps {
    config: {
        merchant_id: string;
        base_url: string;
        return_url: string;
        cancel_url: string;
        notify_url: string;
    }
    payment: {
        order_id: string;
        items: string;
        currency: string;
        amount: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
        hash: string;
    }
    autoSubmit?: boolean
}

export function PayHereButton({ config, payment, autoSubmit = false }: PayHereButtonProps) {
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (autoSubmit && formRef.current) {
            formRef.current.submit()
        }
    }, [autoSubmit])

    return (
        <form ref={formRef} method="post" action={config.base_url}>
            <input type="hidden" name="merchant_id" value={config.merchant_id} />
            <input type="hidden" name="return_url" value={config.return_url} />
            <input type="hidden" name="cancel_url" value={config.cancel_url} />
            <input type="hidden" name="notify_url" value={config.notify_url} />

            <input type="hidden" name="order_id" value={payment.order_id} />
            <input type="hidden" name="items" value={payment.items} />
            <input type="hidden" name="currency" value={payment.currency} />
            <input type="hidden" name="amount" value={payment.amount} />

            <input type="hidden" name="first_name" value={payment.first_name} />
            <input type="hidden" name="last_name" value={payment.last_name} />
            <input type="hidden" name="email" value={payment.email} />
            <input type="hidden" name="phone" value={payment.phone} />
            <input type="hidden" name="address" value={payment.address} />
            <input type="hidden" name="city" value={payment.city} />
            <input type="hidden" name="country" value={payment.country} />

            <input type="hidden" name="hash" value={payment.hash} />

            {!autoSubmit && (
                <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all">
                    Pay with PayHere (LKR {payment.amount})
                </Button>
            )}

            {autoSubmit && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                    <span>Redirecting to Payment Gateway...</span>
                </div>
            )}
        </form>
    )
}
