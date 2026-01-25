import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Star, DollarSign, Calendar } from 'lucide-react';

export default async function CompletedTasksPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id as string }
    });

    if (!user || user.role !== 'PROVIDER') {
        redirect('/access-denied');
    }

    const completedTasks = await prisma.task.findMany({
        where: {
            assignedUserId: user.id,
            status: 'COMPLETED'
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            user: {
                select: { fullName: true, avatar: true }
            },
            review: {
                include: {
                    reviewer: {
                        select: { fullName: true }
                    }
                }
            }
        }
    });

    const stats = {
        total: completedTasks.length,
        withReviews: completedTasks.filter(t => t.review).length,
        averageRating: completedTasks
            .filter(t => t.review)
            .reduce((sum, t) => sum + (t.review?.rating || 0), 0) / completedTasks.filter(t => t.review).length || 0
    };

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="heading-lg">Выполненные задания</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                        История всех успешно выполненных заданий
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>{stats.total}</div>
                        <div style={{ color: 'var(--text-light)' }}>Выполнено заданий</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#10B981' }}>{stats.withReviews}</div>
                        <div style={{ color: 'var(--text-light)' }}>С отзывами</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#F59E0B' }}>
                            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                        </div>
                        <div style={{ color: 'var(--text-light)' }}>Средний рейтинг</div>
                    </div>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    {completedTasks.length === 0 ? (
                        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                            <h3 className="heading-md" style={{ marginBottom: '8px' }}>Нет выполненных заданий</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                                Завершенные задания будут отображаться здесь
                            </p>
                            <Link href="/tasks" className="btn btn-primary">
                                Найти задания
                            </Link>
                        </div>
                    ) : (
                        completedTasks.map((task) => (
                            <div
                                key={task.id}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '24px'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <Link
                                            href={`/tasks/${task.id}`}
                                            style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}
                                        >
                                            {task.title}
                                        </Link>
                                        <span style={{
                                            backgroundColor: '#D1FAE5',
                                            color: '#166534',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <CheckCircle size={16} />
                                            Выполнено
                                        </span>
                                    </div>

                                    <p style={{ color: 'var(--text)', marginBottom: '16px', lineHeight: '1.6' }}>
                                        {task.description.substring(0, 200)}{task.description.length > 200 ? '...' : ''}
                                    </p>

                                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <DollarSign size={16} />
                                            <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                                                {task.budgetType === 'fixed' ? `${task.budgetAmount} с.` : 'Договорная'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={16} />
                                            <span>Завершено: {new Date(task.updatedAt).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                        {task.review && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                                                <span style={{ fontWeight: '600', color: '#F59E0B' }}>
                                                    {task.review.rating} ⭐ от {task.review.reviewer.fullName}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {task.review && task.review.comment && (
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '16px',
                                            backgroundColor: '#FEF3C7',
                                            borderRadius: '12px',
                                            border: '1px solid #FDE68A'
                                        }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#92400E' }}>
                                                Отзыв от {task.review.reviewer.fullName}:
                                            </div>
                                            <p style={{ color: '#78350F', lineHeight: '1.6' }}>{task.review.comment}</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        Посмотреть задание
                                    </Link>
                                    {task.review && (
                                        <Link
                                            href={`/reviews/${task.id}`}
                                            className="btn"
                                            style={{ fontSize: '0.9rem', padding: '8px 16px', backgroundColor: '#F59E0B', color: 'white' }}
                                        >
                                            📝 Отзыв
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
