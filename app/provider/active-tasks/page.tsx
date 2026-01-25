import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, MapPin, DollarSign, User } from 'lucide-react';

export default async function ActiveTasksPage() {
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

    const activeTasks = await prisma.task.findMany({
        where: {
            assignedUserId: user.id,
            status: 'IN_PROGRESS'
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            user: {
                select: { fullName: true, avatar: true, phone: true }
            },
            _count: {
                select: { responses: true, messages: true }
            }
        }
    });

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="heading-lg">Активные задания</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                        Задания, над которыми вы сейчас работаете
                    </p>
                </div>

                {/* Stats */}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>{activeTasks.length}</div>
                    <div style={{ color: 'var(--text-light)' }}>Активных заданий</div>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    {activeTasks.length === 0 ? (
                        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
                            <h3 className="heading-md" style={{ marginBottom: '8px' }}>Нет активных заданий</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                                Когда заказчики примут ваши отклики, задания появятся здесь
                            </p>
                            <Link href="/tasks" className="btn btn-primary">
                                Найти задания
                            </Link>
                        </div>
                    ) : (
                        activeTasks.map((task) => (
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
                                            backgroundColor: '#DBEAFE',
                                            color: '#1E40AF',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            В работе
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
                                            <MapPin size={16} />
                                            <span>{task.city}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={16} />
                                            <span>{task.user.fullName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={16} />
                                            <span>Начато: {new Date(task.updatedAt).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        Открыть задание
                                    </Link>
                                    <Link
                                        href={`/messages?userId=${task.userId}&taskId=${task.id}`}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        💬 Чат ({task._count.messages})
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
