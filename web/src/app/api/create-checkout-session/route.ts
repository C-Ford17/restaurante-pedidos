import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { plan, restaurantName, slug, contactEmail, adminName, username, password } = body

        // Validate plan
        if (!STRIPE_PLANS[plan as PlanType]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const selectedPlan = STRIPE_PLANS[plan as PlanType]

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPlan.stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/register/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/register/cancel`,
            metadata: {
                plan,
                restaurantName,
                slug,
                contactEmail,
                adminName,
                username,
                password, // Note: In production, hash this before storing in metadata
            },
            customer_email: contactEmail,
            subscription_data: {
                metadata: {
                    plan,
                    slug,
                },
            },
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
