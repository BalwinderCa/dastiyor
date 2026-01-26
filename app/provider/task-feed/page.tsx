import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react';

export default async function TaskFeedPage() {
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

    // Get open tasks
    const tasks = await prisma.task.findMany({
        where: {
            status: 'OPEN',
            NOT: { userId: user.id }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            user: { select: { fullName: true, avatar: true } },
            _count: { select: { responses: true } }
        }
    });

    const accentColor = 'var(--primary)';

    return (
        <>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                    Task Feed
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                    Browse available tasks and submit your proposals
                </p>
            </div>

            {/* Tasks Grid */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {tasks.length === 0 ? (
                    <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>No tasks available</h3>
                        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                            Check back later for new opportunities
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            style={{
                                backgroundColor: 'white',
                                padding: '20px',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <Link
                                            href={`/provider/tasks/${task.id}`}
                                            style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', textDecoration: 'none' }}
                                        >
                                            {task.title}
                                        </Link>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: '#E0F2FE',
                                            color: '#0369A1',
                                            fontSize: '0.7rem',
                                            fontWeight: '600'
                                        }}>
                                            {task.category}
                                        </span>
                                    </div>

                                    <p style={{ color: '#475569', marginBottom: '12px', lineHeight: '1.5', fontSize: '0.85rem' }}>
                                        {task.description.substring(0, 120)}{task.description.length > 120 ? '...' : ''}
                                    </p>

                                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <DollarSign size={14} color={accentColor} />
                                            <span style={{ fontWeight: '600', color: accentColor }}>
                                                {task.budgetType === 'fixed' ? `${task.budgetAmount} с.` : 'Negotiable'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} />
                                            <span>{task.city}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} />
                                            <span>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={14} />
                                            <span>{task._count.responses} responses</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/provider/tasks/${task.id}`}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: accentColor,
                                        color: 'white',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    View & Respond
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
