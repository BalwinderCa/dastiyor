import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// POST - Request password reset
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate any existing tokens for this user
        await prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true }
        });

        // Create new reset token
        await prisma.passwordReset.create({
            data: {
                token,
                expiresAt,
                userId: user.id
            }
        });

        // In production, you would send an email here
        // For development, we'll log the reset link
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        console.log('='.repeat(60));
        console.log('PASSWORD RESET LINK (Development Mode):');
        console.log(resetLink);
        console.log('='.repeat(60));

        return NextResponse.json({
            message: 'If an account exists with this email, a password reset link has been sent.',
            // Only include token in development for testing
            ...(process.env.NODE_ENV === 'development' && { debug_token: token })
        });

    } catch (error) {
        console.error('Password Reset Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
