import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        task: { findUnique: jest.fn(), update: jest.fn() },
        user: { update: jest.fn() },
        notification: { create: jest.fn() },
    },
}));

jest.mock('@/lib/auth', () => ({ verifyJWT: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));

describe('/api/tasks/complete', () => {
    const mockUserId = 'customer-1';
    const mockPayload = { id: mockUserId };

    beforeEach(() => {
        jest.clearAllMocks();
        (cookies as jest.Mock).mockResolvedValue({
            get: jest.fn(() => ({ value: 'token' })),
        });
        (verifyJWT as jest.Mock).mockResolvedValue(mockPayload);
    });

    it('should return 401 if no token', async () => {
        (cookies as jest.Mock).mockResolvedValue({ get: jest.fn(() => undefined) });

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'task-1' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should return 400 if taskId is missing', async () => {
        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing taskId');
    });

    it('should return 404 if task not found', async () => {
        (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'nonexistent' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(404);
        expect((await response.json()).error).toBe('Task not found');
    });

    it('should return 403 if user does not own the task', async () => {
        (prisma.task.findUnique as jest.Mock).mockResolvedValue({
            id: 'task-1',
            userId: 'other-owner',
            title: 'Task',
            status: 'IN_PROGRESS',
        });

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'task-1' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toContain('do not own');
    });

    it('should return 400 if task is not IN_PROGRESS', async () => {
        (prisma.task.findUnique as jest.Mock).mockResolvedValue({
            id: 'task-1',
            userId: mockUserId,
            title: 'Task',
            status: 'OPEN',
        });

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'task-1' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('in progress');
    });

    it('should complete task and update status to COMPLETED', async () => {
        const mockTask = {
            id: 'task-1',
            userId: mockUserId,
            title: 'Task',
            status: 'IN_PROGRESS',
            assignedUserId: 'provider-1',
            budgetType: 'fixed',
            budgetAmount: '500',
        };

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
        (prisma.task.update as jest.Mock).mockResolvedValue({
            ...mockTask,
            status: 'COMPLETED',
        });
        (prisma.user.update as jest.Mock).mockResolvedValue({});
        (prisma.notification.create as jest.Mock).mockResolvedValue({});

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'task-1' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Task completed');
        expect(data.task.status).toBe('COMPLETED');
        expect(prisma.task.update).toHaveBeenCalledWith({
            where: { id: 'task-1' },
            data: { status: 'COMPLETED' },
        });
        expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should increment provider balance for fixed budget task', async () => {
        const mockTask = {
            id: 'task-1',
            userId: mockUserId,
            title: 'Task',
            status: 'IN_PROGRESS',
            assignedUserId: 'provider-1',
            budgetType: 'fixed',
            budgetAmount: '500',
        };

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
        (prisma.task.update as jest.Mock).mockResolvedValue({});
        (prisma.user.update as jest.Mock).mockResolvedValue({});
        (prisma.notification.create as jest.Mock).mockResolvedValue({});

        const request = new NextRequest('http://localhost/api/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ taskId: 'task-1' }),
        });

        await POST(request);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'provider-1' },
            data: { balance: { increment: 500 } },
        });
    });
});
