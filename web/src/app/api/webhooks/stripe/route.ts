import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any

                // Extract metadata
                const {
                    plan,
                    restaurantName,
                    slug,
                    contactEmail,
                    adminName,
                    username,
                    password,
                } = session.metadata

                const selectedPlan = STRIPE_PLANS[plan as PlanType]

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10)

                // Create organization, admin user, and subscription in a transaction
                const result = await prisma.$transaction(async (tx: any) => {
                    // 1. Create Organization
                    const organization = await tx.organization.create({
                        data: {
                            name: restaurantName,
                            slug,
                            maxTables: selectedPlan.maxTables,
                            maxUsers: selectedPlan.maxUsers,
                        },
                    })

                    // 2. Create Admin User
                    await tx.user.create({
                        data: {
                            username,
                            password: hashedPassword,
                            name: adminName,
                            role: 'admin',
                            organizationId: organization.id,
                        },
                    })

                    // 3. Create Subscription
                    const subscription = await tx.subscription.create({
                        data: {
                            organizationId: organization.id,
                            plan,
                            status: 'active',
                            stripeCustomerId: session.customer,
                            stripeSubscriptionId: session.subscription,
                            currentPeriodStart: new Date(session.current_period_start * 1000),
                            currentPeriodEnd: new Date(session.current_period_end * 1000),
                        },
                    })

                    return { organization, subscription }
                })

                console.log('Successfully created organization:', result.organization.slug)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any

                // Update subscription status
                await prisma.subscription.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: subscription.status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                })
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any

                // Mark subscription as cancelled
                await prisma.subscription.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: { status: 'cancelled' },
                })
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
