import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
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
        where: { id: payload.id as string },
        include: {
            _count: {
                select: { tasks: true, responses: true }
            },
            subscription: true
        }
    });

    if (!user) {
        redirect('/login');
    }

    const subscription = user.subscription;
    const isSubscribed = subscription?.isActive &&
        subscription?.endDate &&
        new Date(subscription.endDate) > new Date();

    const daysRemaining = isSubscribed && subscription?.endDate
        ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    const skills = user.skills ? user.skills.split(',').map(s => s.trim()) : [];

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '60px 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 className="heading-lg">Мой профиль</h1>
                    <Link href="/profile/edit" className="btn btn-outline">
                        ✏️ Редактировать
                    </Link>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: user.avatar ? 'transparent' : 'var(--primary)',
                            color: 'white',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '4px solid var(--border)'
                        }}>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                user.fullName[0].toUpperCase()
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>{user.fullName}</h2>
                            <div style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{user.email}</div>
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                    backgroundColor: '#e8f0fe',
                                    color: 'var(--primary)',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    {user.role === 'PROVIDER' ? 'Исполнитель' : 'Заказчик'}
                                </span>
                                {isSubscribed && subscription && (
                                    <span style={{
                                        backgroundColor: '#fef3c7',
                                        color: '#b45309',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        ⭐ {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Участник
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio for Providers */}
                    {user.role === 'PROVIDER' && user.bio && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}>
                            <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Обо мне</label>
                            <p style={{ lineHeight: '1.7', color: 'var(--text)' }}>{user.bio}</p>
                        </div>
                    )}

                    {/* Skills for Providers */}
                    {user.role === 'PROVIDER' && skills.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '500' }}>Навыки</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subscription Status */}
                    {user.role === 'PROVIDER' && (
                        <div style={{
                            padding: '24px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            backgroundColor: isSubscribed ? '#f0fdf4' : '#fef2f2',
                            border: isSubscribed ? '1px solid #bbf7d0' : '1px solid #fecaca'
                        }}>
                            {isSubscribed && subscription ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#166534', fontSize: '1.1rem', marginBottom: '4px' }}>
                                            ✨ {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Подписка активна
                                        </div>
                                        <div style={{ color: '#15803d', fontSize: '0.95rem' }}>
                                            {daysRemaining} дней осталось • Истекает {new Date(subscription.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Link href="/subscription" className="btn btn-outline" style={{ borderColor: '#22c55e', color: '#166534' }}>
                                        Управление
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '1.1rem', marginBottom: '4px' }}>
                                            Нет активной подписки
                                        </div>
                                        <div style={{ color: '#b91c1c', fontSize: '0.95rem' }}>
                                            Обновите, чтобы отвечать на больше задач и получить приоритет
                                        </div>
                                    </div>
                                    <Link href="/subscription" className="btn btn-primary">
                                        Обновить сейчас
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: user.role === 'PROVIDER' ? 'repeat(3, 1fr)' : '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>{user._count.tasks}</div>
                            <div style={{ color: 'var(--text-light)' }}>Задач опубликовано</div>
                        </div>
                        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>{user._count.responses}</div>
                            <div style={{ color: 'var(--text-light)' }}>Откликов отправлено</div>
                        </div>
                        {user.role === 'PROVIDER' && (
                            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#166534' }}>
                                    {user.balance.toFixed(2)} с.
                                </div>
                                <div style={{ color: '#15803d' }}>Баланс</div>
                            </div>
                        )}
                    </div>

                    {/* Provider Dashboard Links */}
                    {user.role === 'PROVIDER' && (
                        <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <h3 className="heading-md" style={{ marginBottom: '16px' }}>Панель исполнителя</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <Link href="/provider/my-responses" className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                                    📝 Мои отклики
                                </Link>
                                <Link href="/provider/active-tasks" className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                                    ⚡ Активные задания
                                </Link>
                                <Link href="/provider/completed-tasks" className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                                    ✅ Выполненные задания
                                </Link>
                                <Link href="/provider/payment-history" className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                                    💳 История платежей
                                </Link>
                            </div>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                        <h3 className="heading-md" style={{ marginBottom: '24px' }}>Информация об аккаунте</h3>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontSize: '0.9rem' }}>Полное имя</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.fullName}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontSize: '0.9rem' }}>Email адрес</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontSize: '0.9rem' }}>Номер телефона</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.phone || 'Не указан'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontSize: '0.9rem' }}>Участник с</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
