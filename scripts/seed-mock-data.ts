import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = ['Ремонт', 'IT и Веб', 'Уборка', 'Доставка', 'Образование', 'Красота', 'Ремонт техники'];
const CITIES = ['Душанбе', 'Худжанд', 'Бохтар', 'Куляб', 'Истаравшан'];
const URGENCY_LEVELS = ['urgent', 'normal', 'low'];
const BUDGET_TYPES = ['fixed', 'negotiable'];

async function seedMockData() {
    try {
        console.log('🧹 Cleaning existing data (keeping users)...');

        // Delete all data except users
        await prisma.review.deleteMany({});
        await prisma.message.deleteMany({});
        await prisma.notification.deleteMany({});
        await prisma.taskFavorite.deleteMany({});
        await prisma.response.deleteMany({});
        await prisma.task.deleteMany({});
        await prisma.passwordReset.deleteMany({});

        console.log('✅ Existing data cleaned');

        // Get existing users or create more if needed
        const existingUsers = await prisma.user.findMany();
        console.log(`📊 Found ${existingUsers.length} existing users`);

        // Create additional test users if needed
        let users = [...existingUsers];
        console.log('👥 Creating additional test users if needed...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const additionalUsers = [
            {
                email: 'customer1@test.com',
                fullName: 'Али Алиев',
                role: 'CUSTOMER',
                phone: '+992901111111',
            },
            {
                email: 'customer2@test.com',
                fullName: 'Мария Петрова',
                role: 'CUSTOMER',
                phone: '+992901111112',
            },
            {
                email: 'provider1@test.com',
                fullName: 'Иван Иванов',
                role: 'PROVIDER',
                phone: '+992901111113',
                bio: 'Опытный мастер с 10+ летним стажем. Специализируюсь на ремонте и отделке.',
                skills: 'Ремонт, Отделка, Сантехника',
                isVerified: true,
            },
            {
                email: 'provider2@test.com',
                fullName: 'Ахмед Рахимов',
                role: 'PROVIDER',
                phone: '+992901111114',
                bio: 'IT специалист. Разработка сайтов и мобильных приложений.',
                skills: 'Веб-разработка, React, Node.js',
                isVerified: true,
            },
            {
                email: 'provider3@test.com',
                fullName: 'Сергей Уборщиков',
                role: 'PROVIDER',
                phone: '+992901111115',
                bio: 'Профессиональная уборка квартир и офисов. Работаю быстро и качественно.',
                skills: 'Уборка, Химчистка',
                isVerified: true,
            },
            {
                email: 'provider4@test.com',
                fullName: 'Джахон Доставкин',
                role: 'PROVIDER',
                phone: '+992901111116',
                bio: 'Доставка и перевозка грузов. Грузовая машина, опытный водитель.',
                skills: 'Доставка, Перевозка',
                isVerified: true,
            },
        ];

        for (const userData of additionalUsers) {
            const existing = await prisma.user.findUnique({
                where: { email: userData.email }
            });
            
            if (!existing) {
                const newUser = await prisma.user.create({
                    data: {
                        ...userData,
                        password: hashedPassword,
                    }
                });
                users.push(newUser);
                console.log(`  ✓ Created user: ${userData.email}`);
            }
        }

        // Separate users by role
        const customers = users.filter(u => u.role === 'CUSTOMER');
        const providers = users.filter(u => u.role === 'PROVIDER');

        console.log(`👤 Customers: ${customers.length}, 🔧 Providers: ${providers.length}`);

        // Create subscriptions for providers
        console.log('💳 Creating subscriptions for providers...');
        for (const provider of providers) {
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

            await prisma.subscription.upsert({
                where: { userId: provider.id },
                update: {
                    plan: Math.random() > 0.5 ? 'premium' : 'standard',
                    startDate: new Date(),
                    endDate: subscriptionEndDate,
                    isActive: true,
                },
                create: {
                    userId: provider.id,
                    plan: Math.random() > 0.5 ? 'premium' : 'standard',
                    startDate: new Date(),
                    endDate: subscriptionEndDate,
                    isActive: true,
                },
            });
        }

        // Create mock tasks
        console.log('📋 Creating mock tasks...');
        const taskTemplates = [
            {
                title: 'Нужен ремонт ванной комнаты',
                description: 'Требуется полный ремонт ванной комнаты: замена плитки, установка новой сантехники, покраска стен. Площадь 6 кв.м. Нужен опытный мастер.',
                category: 'Ремонт',
                subcategory: 'Санузел',
                budgetType: 'fixed',
                budgetAmount: '1500',
                city: 'Душанбе',
                urgency: 'normal',
            },
            {
                title: 'Разработка сайта для компании',
                description: 'Нужен современный корпоративный сайт с адаптивным дизайном. Требования: React, TypeScript, интеграция с API. Срок: 2 недели.',
                category: 'IT и Веб',
                subcategory: 'Веб-разработка',
                budgetType: 'fixed',
                budgetAmount: '5000',
                city: 'Душанбе',
                urgency: 'urgent',
            },
            {
                title: 'Генеральная уборка квартиры',
                description: 'Требуется генеральная уборка 3-комнатной квартиры. Нужно помыть окна, полы, пылесосить, убрать кухню и ванную. Площадь 80 кв.м.',
                category: 'Уборка',
                subcategory: 'Генеральная уборка',
                budgetType: 'negotiable',
                budgetAmount: null,
                city: 'Худжанд',
                urgency: 'normal',
            },
            {
                title: 'Доставка мебели из магазина',
                description: 'Нужна доставка дивана и стола из магазина мебели до квартиры. Расстояние 5 км. Нужна грузовая машина.',
                category: 'Доставка',
                subcategory: 'Перевозка мебели',
                budgetType: 'fixed',
                budgetAmount: '300',
                city: 'Душанбе',
                urgency: 'low',
            },
            {
                title: 'Ремонт ноутбука',
                description: 'Ноутбук не включается. Возможно проблема с батареей или материнской платой. Нужна диагностика и ремонт.',
                category: 'Ремонт техники',
                subcategory: 'Компьютеры',
                budgetType: 'negotiable',
                budgetAmount: null,
                city: 'Душанбе',
                urgency: 'urgent',
            },
            {
                title: 'Уроки английского языка',
                description: 'Ищу репетитора английского языка для ребенка 10 лет. Занятия 2 раза в неделю по 1 часу. Нужен опытный преподаватель.',
                category: 'Образование',
                subcategory: 'Языки',
                budgetType: 'fixed',
                budgetAmount: '200',
                city: 'Душанбе',
                urgency: 'normal',
            },
            {
                title: 'Маникюр и педикюр на дом',
                description: 'Нужен мастер для маникюра и педикюра на дом. Время: завтра вечером. Нужны все инструменты.',
                category: 'Красота',
                subcategory: 'Ногти',
                budgetType: 'fixed',
                budgetAmount: '250',
                city: 'Душанбе',
                urgency: 'normal',
            },
            {
                title: 'Покраска стен в квартире',
                description: 'Нужна покраска стен в 2-комнатной квартире. Площадь стен примерно 100 кв.м. Цвет уже выбран. Нужен опытный маляр.',
                category: 'Ремонт',
                subcategory: 'Отделка',
                budgetType: 'fixed',
                budgetAmount: '800',
                city: 'Худжанд',
                urgency: 'low',
            },
            {
                title: 'Разработка мобильного приложения',
                description: 'Нужна разработка мобильного приложения для iOS и Android. Функционал: каталог товаров, корзина, оплата. Срок: 1 месяц.',
                category: 'IT и Веб',
                subcategory: 'Мобильные приложения',
                budgetType: 'negotiable',
                budgetAmount: null,
                city: 'Душанбе',
                urgency: 'normal',
            },
            {
                title: 'Уборка офиса после ремонта',
                description: 'Требуется уборка офиса после ремонта. Нужно убрать строительный мусор, помыть полы, окна, протереть пыль. Площадь 150 кв.м.',
                category: 'Уборка',
                subcategory: 'Офисная уборка',
                budgetType: 'fixed',
                budgetAmount: '600',
                city: 'Душанбе',
                urgency: 'urgent',
            },
        ];

        const createdTasks = [];
        for (let i = 0; i < taskTemplates.length && i < customers.length; i++) {
            const template = taskTemplates[i];
            const customer = customers[i % customers.length];
            
            // Create task with some date variation
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7));
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 3);

            const task = await prisma.task.create({
                data: {
                    title: template.title,
                    description: template.description,
                    category: template.category,
                    subcategory: template.subcategory,
                    budgetType: template.budgetType,
                    budgetAmount: template.budgetAmount,
                    city: template.city,
                    address: `ул. Примерная, д. ${Math.floor(Math.random() * 100)}`,
                    urgency: template.urgency,
                    dueDate: Math.random() > 0.3 ? dueDate : null,
                    status: Math.random() > 0.7 ? 'IN_PROGRESS' : 'OPEN',
                    userId: customer.id,
                    createdAt,
                },
            });
            createdTasks.push(task);
            console.log(`  ✓ Created task: ${template.title}`);
        }

        // Create responses for some tasks
        console.log('💬 Creating mock responses...');
        let acceptedTaskId: string | null = null;
        
        for (const task of createdTasks.filter(t => t.status === 'OPEN')) {
            // 70% chance to have responses
            if (Math.random() > 0.3) {
                const numResponses = Math.floor(Math.random() * 3) + 1;
                const shuffledProviders = [...providers].sort(() => Math.random() - 0.5);
                
                for (let i = 0; i < numResponses && i < shuffledProviders.length; i++) {
                    const provider = shuffledProviders[i];
                    const price = task.budgetType === 'fixed' 
                        ? String(Math.floor(parseInt(task.budgetAmount || '0') * (0.8 + Math.random() * 0.4)))
                        : String(Math.floor(Math.random() * 2000) + 500);
                    
                    // Only accept one response per task
                    const shouldAccept = !acceptedTaskId && Math.random() > 0.6;
                    
                    const response = await prisma.response.create({
                        data: {
                            taskId: task.id,
                            userId: provider.id,
                            message: [
                                'Готов выполнить работу качественно и в срок.',
                                'Имею большой опыт в данной области, выполню быстро и качественно.',
                                'Могу приступить к работе уже завтра.',
                                'Предлагаю оптимальное решение по доступной цене.',
                                'Работаю профессионально, гарантирую качество.',
                            ][Math.floor(Math.random() * 5)],
                            price: price,
                            estimatedTime: [
                                '1 день',
                                '2-3 дня',
                                '1 неделя',
                                '2 недели',
                            ][Math.floor(Math.random() * 4)],
                            status: shouldAccept ? 'ACCEPTED' : 'PENDING',
                        },
                    });

                    // If response is accepted, update task
                    if (response.status === 'ACCEPTED') {
                        await prisma.task.update({
                            where: { id: task.id },
                            data: {
                                status: 'IN_PROGRESS',
                                assignedUserId: provider.id,
                            },
                        });
                        acceptedTaskId = task.id;
                    }

                    console.log(`  ✓ Created response from ${provider.fullName} for task "${task.title}"`);
                }
            }
        }

        // Create some messages
        console.log('💌 Creating mock messages...');
        const tasksWithAssignments = await prisma.task.findMany({
            where: { assignedUserId: { not: null } },
            include: { user: true, assignedUser: true },
        });

        for (const task of tasksWithAssignments) {
            if (task.assignedUserId && task.user) {
                // Customer to Provider
                await prisma.message.create({
                    data: {
                        senderId: task.userId,
                        receiverId: task.assignedUserId,
                        content: 'Здравствуйте! Когда сможете начать работу?',
                        taskId: task.id,
                        isRead: true,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    },
                });

                // Provider to Customer
                await prisma.message.create({
                    data: {
                        senderId: task.assignedUserId,
                        receiverId: task.userId,
                        content: 'Добрый день! Могу начать уже завтра утром. Подойдет?',
                        taskId: task.id,
                        isRead: true,
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    },
                });

                // Customer reply
                await prisma.message.create({
                    data: {
                        senderId: task.userId,
                        receiverId: task.assignedUserId,
                        content: 'Да, отлично! Буду ждать вас в 9 утра.',
                        taskId: task.id,
                        isRead: false,
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    },
                });
                console.log(`  ✓ Created messages for task "${task.title}"`);
            }
        }

        // Create some messages between users without task context
        if (customers.length > 0 && providers.length > 0) {
            const customer = customers[0];
            const provider = providers[0];
            
            await prisma.message.create({
                data: {
                    senderId: customer.id,
                    receiverId: provider.id,
                    content: 'Привет! Хотел бы обсудить возможное сотрудничество.',
                    isRead: false,
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                },
            });
        }

        // Mark some tasks as completed and create reviews
        console.log('⭐ Creating completed tasks and reviews...');
        const inProgressTasks = await prisma.task.findMany({
            where: { status: 'IN_PROGRESS' },
            include: { assignedUser: true, user: true },
        });

        // Mark 2 tasks as completed and add reviews
        for (const task of inProgressTasks.slice(0, 2)) {
            if (task.assignedUser && task.user) {
                // Mark as completed
                await prisma.task.update({
                    where: { id: task.id },
                    data: { status: 'COMPLETED' },
                });

                // Create review
                await prisma.review.create({
                    data: {
                        taskId: task.id,
                        reviewerId: task.userId,
                        reviewedId: task.assignedUserId!,
                        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                        comment: [
                            'Отличная работа! Все выполнено качественно и в срок.',
                            'Очень доволен результатом. Рекомендую!',
                            'Профессионал своего дела. Спасибо!',
                            'Работа выполнена на высшем уровне. Буду обращаться еще.',
                        ][Math.floor(Math.random() * 4)],
                    },
                });
                console.log(`  ✓ Created review for task "${task.title}"`);
            }
        }

        // Create some notifications
        console.log('🔔 Creating mock notifications...');
        for (const task of createdTasks.slice(0, 5)) {
            if (task.userId) {
                await prisma.notification.create({
                    data: {
                        userId: task.userId,
                        type: 'NEW_OFFER',
                        title: 'Новый отклик',
                        message: `На ваше задание "${task.title}" поступил новый отклик`,
                        link: `/tasks/${task.id}`,
                        isRead: Math.random() > 0.5,
                    },
                });
            }
        }

        // Create some task favorites
        console.log('❤️ Creating mock favorites...');
        for (const provider of providers.slice(0, 2)) {
            const tasksToFavorite = createdTasks.slice(0, 2);
            for (const task of tasksToFavorite) {
                await prisma.taskFavorite.create({
                    data: {
                        userId: provider.id,
                        taskId: task.id,
                    },
                });
            }
        }

        console.log('\n✅ Mock data seeding completed!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const stats = {
            users: await prisma.user.count(),
            tasks: await prisma.task.count(),
            responses: await prisma.response.count(),
            messages: await prisma.message.count(),
            reviews: await prisma.review.count(),
            notifications: await prisma.notification.count(),
            favorites: await prisma.taskFavorite.count(),
        };

        console.log(`👥 Users: ${stats.users}`);
        console.log(`📋 Tasks: ${stats.tasks}`);
        console.log(`💬 Responses: ${stats.responses}`);
        console.log(`💌 Messages: ${stats.messages}`);
        console.log(`⭐ Reviews: ${stats.reviews}`);
        console.log(`🔔 Notifications: ${stats.notifications}`);
        console.log(`❤️  Favorites: ${stats.favorites}\n`);

    } catch (error) {
        console.error('❌ Error seeding mock data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMockData();
