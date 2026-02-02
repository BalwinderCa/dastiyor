import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Simple protection
    if (secret !== 'seed-demo') {
        return NextResponse.json({ error: 'Unauthorized. Use ?secret=seed-demo' }, { status: 401 });
    }

    try {
        console.log('Seeding database via API...');

        // 1. Create Users
        const customerPassword = await bcrypt.hash('password123', 10);
        const providerPassword = await bcrypt.hash('password123', 10);

        const customer = await prisma.user.upsert({
            where: { email: 'customer@example.com' },
            update: {},
            create: {
                email: 'customer@example.com',
                fullName: 'Джон Клиент',
                password: customerPassword,
                role: 'CUSTOMER',
                phone: '+992900000001',
            },
        });

        const provider = await prisma.user.upsert({
            where: { email: 'provider@example.com' },
            update: {},
            create: {
                email: 'provider@example.com',
                fullName: 'Мастер Профи',
                password: providerPassword,
                role: 'PROVIDER',
                bio: 'Профессиональный мастер с 10-летним стажем. Сантехника, электрика, мелкий ремонт.',
                skills: 'Сантехника, Электрика, Сборка мебели',
                phone: '+992900000002',
                isVerified: true,
                balance: 500,
            },
        });

        // 2. Create Tasks (Linked to Customer)
        const tasksData = [
            {
                title: 'Починить кран на кухне',
                description: 'Капает кран на кухне, нужно заменить прокладку или смеситель целиком.',
                category: 'Ремонт',
                budgetType: 'fixed',
                budgetAmount: '150',
                city: 'Душанбе',
                urgency: 'normal',
                status: 'OPEN',
            },
            {
                title: 'Генеральная уборка квартиры',
                description: 'Требуется полная уборка 3-комнатной квартиры после ремонта.',
                category: 'Уборка',
                budgetType: 'negotiable',
                city: 'Худжанд',
                urgency: 'urgent',
                status: 'OPEN',
            },
            {
                title: 'Доствака документов в аэропорт',
                description: 'Нужно срочно отвезти пакет документов в грузовой терминал.',
                category: 'Доставка',
                budgetType: 'fixed',
                budgetAmount: '50',
                city: 'Душанбе',
                urgency: 'urgent',
                status: 'OPEN',
            },
            {
                title: 'Создать лендинг пейдж',
                description: 'Нужен простой одностраничный сайт для кофейни.',
                category: 'IT и Веб',
                budgetType: 'negotiable',
                city: 'Удаленно',
                urgency: 'normal',
                status: 'OPEN',
            },
            {
                title: 'Ремонт стиральной машины',
                description: 'Стиральная машина LG не сливает воду.',
                category: 'Ремонт',
                budgetType: 'fixed',
                budgetAmount: '200',
                city: 'Душанбе',
                urgency: 'normal',
                status: 'OPEN',
            }
        ];

        for (const t of tasksData) {
            // Check if task exists to avoid duplicates on re-run
            const exists = await prisma.task.findFirst({
                where: {
                    title: t.title,
                    userId: customer.id
                }
            });

            if (!exists) {
                await prisma.task.create({
                    data: {
                        ...t,
                        userId: customer.id,
                        images: JSON.stringify(['https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3']),
                    },
                });
            }
        }

        return NextResponse.json({
            message: 'Database seeded successfully',
            users: {
                customer: 'customer@example.com / password123',
                provider: 'provider@example.com / password123'
            }
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
