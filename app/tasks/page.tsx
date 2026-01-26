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


    // Get total count for pagination (initially all matching non-budget criteria)
    // We will fetch ALL tasks matching the non-budget criteria to filter in memory
    // and then paginate manually. This is necessary because budgetAmount is a String
    // in the DB, making precise numeric filtering impossible efficiently with Prisma/SQLite
    // string comparison logic (e.g. "100" < "2" lexicographically).

    const allMatchingTasks = await prisma.task.findMany({
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

    // In-memory budget filtering
    let filteredTasks = allMatchingTasks;

    if (minBudget || maxBudget) {
        const min = minBudget ? parseInt(minBudget) : 0;
        const max = maxBudget ? parseInt(maxBudget) : Infinity;

        filteredTasks = allMatchingTasks.filter(task => {
            if (task.budgetType === 'negotiable') return true; // Include negotiable for now, or decide based on logic
            if (task.budgetType === 'fixed' && task.budgetAmount) {
                const amount = parseInt(task.budgetAmount);
                return !isNaN(amount) && amount >= min && amount <= max;
            }
            return false;
        });
    }

    const totalTasks = filteredTasks.length;
    const tasks = filteredTasks.slice(skip, skip + TASKS_PER_PAGE);

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
                {/* Find Work Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '32px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: 'var(--text)',
                            marginBottom: '8px'
                        }}>Find Work</h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--text-light)',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}>
                            <span style={{ color: 'var(--primary)' }}>⚡</span>
                            <span>{totalOpenTasks.toLocaleString()} tasks available in your area</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--primary)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <span style={{ fontSize: '1rem' }}>✓</span> PRO MEMBER
                        </div>
                        <TaskSortSelect defaultValue={sort || 'newest'} />
                    </div>
                </div>

                {activeFilters.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '24px'
                    }}>
                        {activeFilters.map((filter, idx) => (
                            <span
                                key={idx}
                                style={{
                                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                    color: 'var(--primary)',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                {filter}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '32px',
                }}>
                    {/* Sidebar */}
                    <aside>
                        <Suspense fallback={<div>Loading filters...</div>}>
                            <TaskFilterSidebar
                                categoryCounts={categoryCounts}
                                totalOpenTasks={totalOpenTasks}
                            />
                        </Suspense>
                    </aside>

                    {/* Feed */}
                    <main>
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
