import { MercadoPagoConfig, Preference } from 'mercadopago'

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables')
}

// Initialize Mercado Pago client
export const mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
        timeout: 5000,
    },
})

// Plan configurations
export const MERCADOPAGO_PLANS = {
    starter: {
        name: 'Starter',
        price: 29,
        maxTables: 5,
        maxUsers: 2,
        description: 'Perfecto para restaurantes pequeños',
    },
    professional: {
        name: 'Professional',
        price: 79,
        maxTables: 20,
        maxUsers: 10,
        description: 'Ideal para restaurantes en crecimiento',
    },
    enterprise: {
        name: 'Enterprise',
        price: 199,
        maxTables: 999,
        maxUsers: 999,
        description: 'Para cadenas y múltiples locales',
    },
} as const

export type PlanType = keyof typeof MERCADOPAGO_PLANS
