import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        task: {
            findMany: jest.fn(),
            create: jest.fn(),
            count: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    verifyJWT: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

describe('/api/tasks', () => {
    const mockUserId = 'user-1';
    const mockToken = 'valid-token';
    const mockPayload = { id: mockUserId, email: 'test@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn(() => ({ value: mockToken })),
        });
        (verifyJWT as jest.Mock).mockResolvedValue(mockPayload);
    });

    describe('GET', () => {
        it('should return tasks without authentication for public access', async () => {
            const mockTasks = [
                {
                    id: 'task-1',
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'OPEN',
                    createdAt: new Date(),
                },
            ];

            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
            (prisma.task.count as jest.Mock).mockResolvedValue(1);

            const request = new NextRequest('http://localhost/api/tasks');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.tasks).toBeDefined();
            expect(data.tasks).toHaveLength(1);
        });

        it('should filter tasks by category', async () => {
            const request = new NextRequest('http://localhost/api/tasks?category=Cleaning');
            await GET(request);

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        category: 'Cleaning',
                    }),
                })
            );
        });

        it('should filter tasks by city', async () => {
            const request = new NextRequest('http://localhost/api/tasks?city=Dushanbe');
            await GET(request);

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        city: 'Dushanbe',
                    }),
                })
            );
        });

        it('should filter tasks by status', async () => {
            const request = new NextRequest('http://localhost/api/tasks?status=OPEN');
            await GET(request);

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: 'OPEN',
                    }),
                })
            );
        });

        it('should return user tasks when my=true', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.task.count as jest.Mock).mockResolvedValue(0);

            const request = new NextRequest('http://localhost/api/tasks?my=true');
            await GET(request);

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                    }),
                })
            );
        });
    });

    describe('POST', () => {
        it('should return 401 if no token provided', async () => {
            (cookies as jest.Mock).mockReturnValue({
                get: jest.fn(() => undefined),
            });

            const request = new NextRequest('http://localhost/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Task',
                    description: 'Test Description',
                    category: 'Cleaning',
                    city: 'Dushanbe',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 400 if required fields are missing', async () => {
            const request = new NextRequest('http://localhost/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Task',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
        });

        it('should create a task successfully', async () => {
            const mockTask = {
                id: 'task-1',
                title: 'Test Task',
                description: 'Test Description',
                category: 'Cleaning',
                city: 'Dushanbe',
                userId: mockUserId,
                status: 'OPEN',
                createdAt: new Date(),
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

            const request = new NextRequest('http://localhost/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Task',
                    description: 'This is a detailed test description for the task',
                    category: 'Cleaning',
                    city: 'Dushanbe',
                    budgetType: 'fixed',
                    budgetAmount: '500',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.task).toBeDefined();
            expect(data.task.title).toBe('Test Task');
            expect(prisma.task.create).toHaveBeenCalled();
        });
    });
});
