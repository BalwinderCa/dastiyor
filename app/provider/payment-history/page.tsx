import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default async function PaymentHistoryPage() {
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
            subscription: true
        }
    });

    if (!user || user.role !== 'PROVIDER') {
        redirect('/access-denied');
    }

    // For now, we'll show subscription history
    // In production, this would come from a Payment model
    const subscriptionHistory = user.subscription ? [{
        id: user.subscription.id,
        type: 'SUBSCRIPTION',
        plan: user.subscription.plan,
        amount: user.subscription.plan === 'basic' ? 99 : user.subscription.plan === 'standard' ? 199 : 399,
        currency: 'TJS',
        status: user.subscription.isActive ? 'COMPLETED' : 'CANCELLED',
        date: user.subscription.startDate,
        description: `Подписка ${user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}`
    }] : [];

    const totalSpent = subscriptionHistory.reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="heading-lg">История платежей</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                        История всех ваших платежей и подписок
                    </p>
                </div>

                {/* Summary Card */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '32px', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)',
                    marginBottom: '32px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '24px'
                }}>
                    <div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Всего потрачено</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {totalSpent} с.
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Транзакций</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                            {subscriptionHistory.length}
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {subscriptionHistory.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💳</div>
                            <h3 className="heading-md" style={{ marginBottom: '8px' }}>Нет истории платежей</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                                Когда вы приобретете подписку, платежи будут отображаться здесь
                            </p>
                            <a href="/subscription" className="btn btn-primary">
                                Посмотреть планы
                            </a>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {subscriptionHistory.map((payment) => (
                                <div
                                    key={payment.id}
                                    style={{
                                        padding: '24px',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '24px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: payment.status === 'COMPLETED' ? '#D1FAE5' : '#FEE2E2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {payment.status === 'COMPLETED' ? (
                                                <CheckCircle size={24} color="#10B981" />
                                            ) : (
                                                <DollarSign size={24} color="#EF4444" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>
                                                {payment.description}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} />
                                                    {new Date(payment.date).toLocaleDateString('ru-RU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{
                                                    backgroundColor: payment.status === 'COMPLETED' ? '#D1FAE5' : '#FEE2E2',
                                                    color: payment.status === 'COMPLETED' ? '#166534' : '#991b1b',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {payment.status === 'COMPLETED' ? 'Оплачено' : 'Отменено'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            {payment.amount} {payment.currency}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Note */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '12px',
                    border: '1px solid #BFDBFE',
                    fontSize: '0.9rem',
                    color: '#1E40AF'
                }}>
                    <strong>Примечание:</strong> Полная история платежей будет доступна после интеграции платежной системы.
                </div>
            </div>
        </div>
    );
}
