
import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/messagebird';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, message } = body;

        if (!phone || !message) {
            return NextResponse.json(
                { error: 'Phone and message are required' },
                { status: 400 }
            );
        }

        const result = await sendSMS({ recipient: phone, body });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Test SMS Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send SMS' },
            { status: 500 }
        );
    }
}
