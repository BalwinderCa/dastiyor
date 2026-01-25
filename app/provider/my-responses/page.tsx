import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export default async function MyResponsesPage() {
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

    const responses = await prisma.response.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            task: {
                include: {
                    user: {
                        select: { fullName: true, avatar: true }
                    },
                    _count: {
                        select: { responses: true }
                    }
                }
            }
        }
    });

    const stats = {
        total: responses.length,
        pending: responses.filter(r => r.status === 'PENDING').length,
        accepted: responses.filter(r => r.status === 'ACCEPTED').length,
        rejected: responses.filter(r => r.status === 'REJECTED').length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return <CheckCircle size={20} color="#10B981" />;
            case 'REJECTED':
                return <XCircle size={20} color="#EF4444" />;
            default:
                return <Clock size={20} color="#F59E0B" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return { text: 'Принято', color: '#10B981', bg: '#D1FAE5' };
            case 'REJECTED':
                return { text: 'Отклонено', color: '#EF4444', bg: '#FEE2E2' };
            default:
                return { text: 'Ожидает', color: '#F59E0B', bg: '#FEF3C7' };
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="heading-lg">Мои отклики</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                        Управляйте всеми вашими откликами на задания
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>{stats.total}</div>
                        <div style={{ color: 'var(--text-light)' }}>Всего откликов</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#F59E0B' }}>{stats.pending}</div>
                        <div style={{ color: 'var(--text-light)' }}>Ожидают</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#10B981' }}>{stats.accepted}</div>
                        <div style={{ color: 'var(--text-light)' }}>Принято</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#EF4444' }}>{stats.rejected}</div>
                        <div style={{ color: 'var(--text-light)' }}>Отклонено</div>
                    </div>
                </div>

                {/* Responses List */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {responses.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
                            <h3 className="heading-md" style={{ marginBottom: '8px' }}>Нет откликов</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                                Начните отвечать на задания, чтобы увидеть их здесь
                            </p>
                            <Link href="/tasks" className="btn btn-primary">
                                Найти задания
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {responses.map((response) => {
                                const statusInfo = getStatusLabel(response.status);
                                return (
                                    <div
                                        key={response.id}
                                        style={{
                                            padding: '24px',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '24px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <Link
                                                        href={`/tasks/${response.taskId}`}
                                                        style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}
                                                    >
                                                        {response.task.title}
                                                    </Link>
                                                    <span style={{
                                                        backgroundColor: statusInfo.bg,
                                                        color: statusInfo.color,
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {getStatusIcon(response.status)}
                                                        {statusInfo.text}
                                                    </span>
                                                </div>

                                                <p style={{ color: 'var(--text)', marginBottom: '16px', lineHeight: '1.6' }}>
                                                    {response.message}
                                                </p>

                                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <DollarSign size={16} />
                                                        <span style={{ fontWeight: '600', color: 'var(--text)' }}>{response.price} с.</span>
                                                    </div>
                                                    {response.estimatedTime && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Clock size={16} />
                                                            <span>{response.estimatedTime}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        📍 {response.task.city}
                                                    </div>
                                                    <div>
                                                        📅 {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                                                    </div>
                                                    <div>
                                                        💬 {response.task._count.responses} откликов
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                                <Link
                                                    href={`/tasks/${response.taskId}`}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                                                >
                                                    Посмотреть задание
                                                </Link>
                                                {response.status === 'ACCEPTED' && (
                                                    <Link
                                                        href={`/messages?userId=${response.task.userId}&taskId=${response.taskId}`}
                                                        className="btn"
                                                        style={{ fontSize: '0.9rem', padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white' }}
                                                    >
                                                        Написать заказчику
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
