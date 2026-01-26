import { prisma } from '@/lib/prisma';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFilterSidebar from '@/components/tasks/TaskFilterSidebar';
import TaskSortSelect from '@/components/tasks/TaskSortSelect';
import Pagination from '@/components/ui/Pagination';
import { Suspense } from 'react';

type Props = {
    searchParams: {
        category?: string;
        query?: string;
        city?: string;
        minBudget?: string;
        maxBudget?: string;
        urgency?: string;
        sort?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: string;
    }
}

const TASKS_PER_PAGE = 20;

export default async function TasksPage({ searchParams }: Props) {
    const params = await searchParams;
    const { category, query, city, minBudget, maxBudget, urgency, sort, page } = params;
    const currentPage = parseInt(page || '1', 10);
    const skip = (currentPage - 1) * TASKS_PER_PAGE;

    // Build filter
    const where: any = { status: 'OPEN' };

    // Category filter
    if (category) {
        where.category = category;
    }

    // City filter
    if (city) {
        where.city = { contains: city };
    }

    // Budget filter
    if (minBudget || maxBudget) {
        // We need to filter tasks where budgetAmount is within range
        // Note: budgetAmount is stored as string, so we need to handle this carefully
        const budgetConditions: any[] = [];

        if (minBudget) {
            // For tasks with fixed budget, check if amount >= minBudget
            budgetConditions.push({
                budgetType: 'fixed',
                budgetAmount: { gte: minBudget }
            });
        }

        if (maxBudget) {
            budgetConditions.push({
                budgetType: 'fixed',
                budgetAmount: { lte: maxBudget }
            });
        }

        // If both min and max, combine them
        if (minBudget && maxBudget) {
            where.AND = [
                {
                    OR: [
                        { budgetType: 'negotiable' }, // Include negotiable tasks
                        {
                            AND: [
                                { budgetType: 'fixed' },
                                { budgetAmount: { not: null } }
                            ]
                        }
                    ]
                }
            ];
        }
    }

    // Urgency filter
    if (urgency) {
        const urgencyValues = urgency.split(',').filter(Boolean);
        if (urgencyValues.length > 0) {
            where.urgency = { in: urgencyValues };
        }
    }

    // Date filter
    const dateFrom = params.dateFrom;
    const dateTo = params.dateTo;
    if (dateFrom || dateTo) {
        where.dueDate = {};
        if (dateFrom) {
            where.dueDate.gte = new Date(dateFrom);
        }
        if (dateTo) {
            where.dueDate.lte = new Date(dateTo);
        }
    }

    // Search query
    if (query) {
        where.OR = [
            { title: { contains: query } },
            { description: { contains: query } }
        ];
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'budget-high') {
        orderBy = { budgetAmount: 'desc' };
    } else if (sort === 'budget-low') {
        orderBy = { budgetAmount: 'asc' };
    }

    // Get total count for pagination
    const totalTasks = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: TASKS_PER_PAGE,
        include: {
            _count: {
                select: { responses: true }
            },
            user: {
                select: { fullName: true }
            },
            responses: {
                include: {
                    user: {
                        include: {
                            subscription: true
                        }
                    }
                }
            }
        }
    });

    // Sort tasks: Premium subscribers' responses first
    const sortedTasks = tasks.sort((a, b) => {
        const aHasPremium = a.responses.some((r: any) => 
            r.user.subscription && 
            r.user.subscription.plan === 'premium' && 
            r.user.subscription.isActive &&
            new Date(r.user.subscription.endDate) > new Date()
        );
        const bHasPremium = b.responses.some((r: any) => 
            r.user.subscription && 
            r.user.subscription.plan === 'premium' && 
            r.user.subscription.isActive &&
            new Date(r.user.subscription.endDate) > new Date()
        );
        
        if (aHasPremium && !bHasPremium) return -1;
        if (!aHasPremium && bHasPremium) return 1;
        return 0; // Maintain original order for same priority
    });

    // Get category counts for sidebar
    const categoryCounts = await prisma.task.groupBy({
        by: ['category'],
        where: { status: 'OPEN' },
        _count: true
    });

    const totalOpenTasks = await prisma.task.count({ where: { status: 'OPEN' } });

    // Build active filters display
    const activeFilters: string[] = [];
    if (category) activeFilters.push(`Категория: ${category}`);
    if (city) activeFilters.push(`Город: ${city}`);
    if (minBudget) activeFilters.push(`От: ${minBudget} с.`);
    if (maxBudget) activeFilters.push(`До: ${maxBudget} с.`);
    if (urgency) activeFilters.push(`Срочность: ${urgency}`);

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">
                <div style={{ marginBottom: '24px' }}>
                    <h1 className="heading-lg">Найти задания</h1>
                    {activeFilters.length > 0 && (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginTop: '12px'
                        }}>
                            {activeFilters.map((filter, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        backgroundColor: '#EEF2FF',
                                        color: '#6366F1',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    {filter}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '32px',
                }}>
                    {/* Sidebar */}
                    <aside>
                        <Suspense fallback={<div>Loading filters...</div>}>
                            <TaskFilterSidebar />
                        </Suspense>
                    </aside>

                    {/* Feed */}
                    <main>
                        <div style={{
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <span style={{ color: 'var(--text)', fontWeight: '600' }}>
                                {totalTasks} {totalTasks === 1 ? 'задание' : 'заданий'} найдено
                                {category && <span style={{ color: 'var(--text-light)', fontWeight: '400' }}> в "{category}"</span>}
                                {totalTasks > TASKS_PER_PAGE && (
                                    <span style={{ color: 'var(--text-light)', fontWeight: '400', fontSize: '0.9rem' }}>
                                        {' • '}Показано {skip + 1}-{Math.min(skip + TASKS_PER_PAGE, totalTasks)} из {totalTasks}
                                    </span>
                                )}
                            </span>
                            <TaskSortSelect defaultValue={sort || 'newest'} />
                        </div>

                        {sortedTasks.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 40px',
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
                                <h3 className="heading-md" style={{ marginBottom: '8px' }}>Задания не найдены</h3>
                                <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto' }}>
                                    Попробуйте изменить фильтры или расширить критерии поиска.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {sortedTasks.map((task: any) => {
                                    const hasPremiumResponse = task.responses.some((r: any) => 
                                        r.user.subscription && 
                                        r.user.subscription.plan === 'premium' && 
                                        r.user.subscription.isActive &&
                                        new Date(r.user.subscription.endDate) > new Date()
                                    );
                                    
                                    return (
                                        <TaskCard 
                                            key={task.id}
                                            task={{
                                                id: task.id,
                                                title: task.title,
                                                category: task.category,
                                                budget: task.budgetType === 'fixed' ? `${task.budgetAmount} с.` : 'Договорная',
                                                city: task.city,
                                                postedAt: new Date(task.createdAt).toLocaleDateString('ru-RU'),
                                                description: task.description,
                                                urgency: task.urgency,
                                                responseCount: task._count.responses,
                                                status: task.status,
                                                hasPremiumResponse
                                            }} 
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {sortedTasks.length > 20 && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <button className="btn btn-outline">Загрузить больше</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
