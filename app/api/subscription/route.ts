import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// Plan configurations
const PLANS = {
    basic: {
        name: 'Basic',
        price: 99,
        durationDays: 7, // Basic plan is 7 days as per spec
        responsesPerDay: 15 // Basic: 15 responses per day
    },
    standard: {
        name: 'Standard',
        price: 199,
        durationDays: 30,
        responsesPerMonth: 50
    },
    premium: {
        name: 'Premium',
        price: 399,
        durationDays: 30,
        responsesPerMonth: -1 // Unlimited
    }
};

// GET - Get current subscription
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId: payload.id as string }
        });

        if (!subscription) {
            return NextResponse.json({ subscription: null });
        }

        const isActive = subscription.isActive && new Date(subscription.endDate) > new Date();

        return NextResponse.json({
            subscription: {
                ...subscription,
                isCurrentlyActive: isActive,
                daysRemaining: isActive
                    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 0
            }
        });

    } catch (error) {
        console.error('Get Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Create or update subscription (simulated payment)
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = payload.id as string;
        const body = await request.json();
        const { plan } = body;

        if (!plan || !PLANS[plan as keyof typeof PLANS]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const planConfig = PLANS[plan as keyof typeof PLANS];

        // Check if user already has a subscription
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId }
        });

        const startDate = new Date();
        let endDate = new Date();

        // If upgrading/extending, add to existing end date if still active
        if (existingSubscription && existingSubscription.isActive && new Date(existingSubscription.endDate) > new Date()) {
            endDate = new Date(existingSubscription.endDate);
        }

        endDate.setDate(endDate.getDate() + planConfig.durationDays);

        // Simulate payment processing
        console.log(`[SIMULATED PAYMENT] User ${userId} paid ${planConfig.price} TJS for ${planConfig.name} plan`);

        let subscription;

        if (existingSubscription) {
            // Update existing subscription
            subscription = await prisma.subscription.update({
                where: { userId },
                data: {
                    plan,
                    startDate: existingSubscription.isActive ? existingSubscription.startDate : startDate,
                    endDate,
                    isActive: true
                }
            });
        } else {
            // Create new subscription
            subscription = await prisma.subscription.create({
                data: {
                    userId,
                    plan,
                    startDate,
                    endDate,
                    isActive: true
                }
            });
        }

        return NextResponse.json({
            message: 'Subscription activated successfully',
            subscription: {
                ...subscription,
                planDetails: planConfig
            }
        });

    } catch (error) {
        console.error('Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Cancel subscription
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = payload.id as string;

        const subscription = await prisma.subscription.findUnique({
            where: { userId }
        });

        if (!subscription) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        // Don't delete, just mark as inactive (subscription continues until end date)
        await prisma.subscription.update({
            where: { userId },
            data: { isActive: false }
        });

        return NextResponse.json({
            message: 'Subscription cancelled. You will have access until the end of your billing period.'
        });

    } catch (error) {
        console.error('Cancel Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
