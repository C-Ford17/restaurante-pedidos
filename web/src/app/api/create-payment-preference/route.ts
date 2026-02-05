import { NextRequest, NextResponse } from 'next/server'
import { mercadopago, MERCADOPAGO_PLANS, PlanType } from '@/lib/mercadopago'
import { Preference } from 'mercadopago'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { plan, restaurantName, slug, contactEmail, adminName, username, password } = body

        // Validate plan
        if (!MERCADOPAGO_PLANS[plan as PlanType]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const selectedPlan = MERCADOPAGO_PLANS[plan as PlanType]

        // Create Mercado Pago Preference
        const preference = new Preference(mercadopago)

        const preferenceData = await preference.create({
            body: {
                items: [
                    {
                        id: plan,
                        title: `Plan ${selectedPlan.name} - ${restaurantName}`,
                        description: selectedPlan.description,
                        quantity: 1,
                        unit_price: selectedPlan.price,
                        currency_id: 'USD', // Change to 'COP' for Colombian Pesos
                    },
                ],
                payer: {
                    email: contactEmail,
                    name: adminName,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/register/success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/register/cancel`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/register/pending`,
                },
                auto_return: 'approved',
                metadata: {
                    plan,
                    restaurantName,
                    slug,
                    contactEmail,
                    adminName,
                    username,
                    password, // Note: In production, hash this before storing
                },
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
            },
        })

        return NextResponse.json({
            preferenceId: preferenceData.id,
            initPoint: preferenceData.init_point,
        })
    } catch (error: any) {
        console.error('Error creating Mercado Pago preference:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create payment preference' },
            { status: 500 }
        )
    }
}
