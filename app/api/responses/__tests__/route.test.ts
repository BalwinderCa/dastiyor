import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        response: {
            findMany: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
        },
        user: { findUnique: jest.fn() },
        task: { findUnique: jest.fn() },
        notification: { create: jest.fn() },
    },
}));

jest.mock('@/lib/auth', () => ({
    verifyJWT: jest.fn(),
}));

jest.mock('@/lib/rate-limit', () => ({
    checkRateLimit: jest.fn(() => ({ allowed: true })),
    getClientIP: jest.fn(() => '127.0.0.1'),
    rateLimitExceededResponse: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

describe('/api/responses', () => {
    const mockUserId = 'user-1';
    const mockToken = 'valid-token';
    const mockPayload = { id: mockUserId, email: 'test@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        (cookies as jest.Mock).mockResolvedValue({
            get: jest.fn(() => ({ value: mockToken })),
            getAll: jest.fn(() => []),
        });
        (verifyJWT as jest.Mock).mockResolvedValue(mockPayload);
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: mockUserId,
            role: 'PROVIDER',
            subscription: { isActive: true, endDate: new Date(Date.now() + 86400000), plan: 'standard' },
        });
        (prisma.task.findUnique as jest.Mock).mockResolvedValue({ userId: 'owner-1', title: 'Test Task' });
        (prisma.response.count as jest.Mock).mockResolvedValue(0);
        (prisma.notification.create as jest.Mock).mockResolvedValue({});
    });

    describe('GET', () => {
        // GET is not exported from app/api/responses/route.ts
        it.skip('should return 401 if no token provided', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn(() => undefined),
                getAll: jest.fn(() => []),
            });

            const request = new NextRequest('http://localhost/api/responses?taskId=task-1');
            const response = await (await import('../route')).GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toContain('Unauthorized');
        });

        it.skip('should return 400 if taskId is missing', async () => {
            const request = new NextRequest('http://localhost/api/responses');
            const response = await (await import('../route')).GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('taskId');
        });

        it.skip('should fetch responses for a task', async () => {
            const mockResponses = [
                {
                    id: 'resp-1',
                    message: 'I can help with this',
                    price: '500',
                    status: 'PENDING',
                    user: {
                        id: 'user-2',
                        fullName: 'Provider User',
                    },
                },
            ];

            (prisma.response.findMany as jest.Mock).mockResolvedValue(mockResponses);

            const request = new NextRequest('http://localhost/api/responses?taskId=task-1');
            const response = await (await import('../route')).GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.responses).toBeDefined();
            expect(data.responses).toHaveLength(1);
        });
    });

    describe('POST', () => {
        it('should return 401 if no token provided', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn(() => undefined),
                getAll: jest.fn(() => []),
            });

            const request = new NextRequest('http://localhost/api/responses', {
                method: 'POST',
                body: JSON.stringify({
                    taskId: 'task-1',
                    message: 'I can help',
                    price: '500',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toContain('Unauthorized');
        });

        it('should return 400 if required fields are missing', async () => {
            const request = new NextRequest('http://localhost/api/responses', {
                method: 'POST',
                body: JSON.stringify({
                    taskId: 'task-1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
        });

        it('should create a response successfully', async () => {
            const mockResponse = {
                id: 'resp-1',
                message: 'I can help with this task',
                price: '500',
                status: 'PENDING',
                taskId: 'task-1',
                userId: mockUserId,
                createdAt: new Date(),
            };

            (prisma.response.create as jest.Mock).mockResolvedValue(mockResponse);

            const request = new NextRequest('http://localhost/api/responses', {
                method: 'POST',
                body: JSON.stringify({
                    taskId: 'task-1',
                    message: 'I can help with this task',
                    price: '500',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.response).toBeDefined();
            expect(data.response.message).toBe('I can help with this task');
            expect(prisma.response.create).toHaveBeenCalled();
        });
    });
});
