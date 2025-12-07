import crypto from 'crypto';

export interface PayHerePaymentRequest {
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
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
    hash?: string;
}

export function generatePayHereHash(orderId: string, amount: string, currency: string) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Hash generation: md5(merchant_id + order_id + amount + currency + getMd5Params(merchant_secret))
    // Note: PayHere documentation says: 
    // UPPERCASE(MD5(merchant_id + order_id + amountFormatted + currency + UPPERCASE(MD5(merchant_secret))))

    const merchantSecretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const dataToHash = merchantId + orderId + formattedAmount + currency + merchantSecretHash;
    const hash = crypto.createHash('md5').update(dataToHash).digest('hex').toUpperCase();

    return hash;
}

export function getPayHereConfig() {
    return {
        merchantId: process.env.PAYHERE_MERCHANT_ID!,
        baseUrl: process.env.NEXT_PUBLIC_PAYHERE_BASE_URL || "https://sandbox.payhere.lk/pay/checkout",
        returnUrl: process.env.NEXT_PUBLIC_APP_URL + "/portal/appointments?payment=success",
        cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/book", // Should ideally go back to specific clinic booking
        notifyUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/webhooks/payhere"
    }
}
