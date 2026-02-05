import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
})

// Plan configurations
export const STRIPE_PLANS = {
    starter: {
        name: 'Starter',
        price: 29,
        maxTables: 5,
        maxUsers: 2,
        // Add your Stripe Price ID here after creating products in Stripe Dashboard
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    },
    professional: {
        name: 'Professional',
        price: 79,
        maxTables: 20,
        maxUsers: 10,
        stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    },
    enterprise: {
        name: 'Enterprise',
        price: 199,
        maxTables: 999,
        maxUsers: 999,
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    },
} as const

export type PlanType = keyof typeof STRIPE_PLANS
