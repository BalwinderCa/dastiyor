import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. Authenticate Filter
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = payload.id as string;

        // 2. Parse Body
        const body = await request.json();
        const { taskId, providerId } = body; // We can accept responseId too, but providerId is direct for Schema

        if (!taskId || !providerId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 3. Verify Ownership
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.userId !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this task' }, { status: 403 });
        }

        // 4. Update Task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status: 'IN_PROGRESS',
                assignedUserId: providerId
            }
        });

        // Notify Provider
        await prisma.notification.create({
            data: {
                userId: providerId,
                type: 'OFFER_ACCEPTED',
                title: 'Отклик принят!',
                message: `Вас выбрали исполнителем задания "${task.title}". Свяжитесь с заказчиком.`,
                link: `/tasks/${taskId}`
            }
        });

        return NextResponse.json({ message: 'Task accepted', task: updatedTask });

    } catch (error) {
        console.error('Accept Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
