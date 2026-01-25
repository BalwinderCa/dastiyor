import { prisma } from '@/lib/prisma';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFilterSidebar from '@/components/tasks/TaskFilterSidebar';
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
    }
}

export default async function TasksPage({ searchParams }: Props) {
    const params = await searchParams;
    const { category, query, city, minBudget, maxBudget, urgency, sort } = params;

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

    const tasks = await prisma.task.findMany({
        where,
        orderBy,
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
                                {sortedTasks.length} {sortedTasks.length === 1 ? 'задание' : 'заданий'} найдено
                                {category && <span style={{ color: 'var(--text-light)', fontWeight: '400' }}> в "{category}"</span>}
                            </span>
                            <form>
                                <select
                                    name="sort"
                                    defaultValue={sort || 'newest'}
                                    onChange={(e) => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.set('sort', e.target.value);
                                        window.location.href = url.toString();
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: '#F9FAFB',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="newest">Сначала новые</option>
                                    <option value="budget-high">Цена: по убыванию</option>
                                    <option value="budget-low">Цена: по возрастанию</option>
                                </select>
                            </form>
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
                                        <div key={task.id} style={{ position: 'relative' }}>
                                            {hasPremiumResponse && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    backgroundColor: '#F59E0B',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    zIndex: 10
                                                }}>
                                                    ⭐ Premium
                                                </div>
                                            )}
                                            <TaskCard task={{
                                                id: task.id,
                                                title: task.title,
                                                category: task.category,
                                                budget: task.budgetType === 'fixed' ? `${task.budgetAmount} с.` : 'Договорная',
                                                city: task.city,
                                                postedAt: new Date(task.createdAt).toLocaleDateString('ru-RU'),
                                                description: task.description,
                                                urgency: task.urgency,
                                                responseCount: task._count.responses
                                            }} />
                                        </div>
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
