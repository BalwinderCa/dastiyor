import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { Handshake, LogIn } from 'lucide-react';

export default async function Header() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let user = null;

    if (token) {
        const payload = await verifyJWT(token);
        if (payload && payload.id) {
            const { prisma } = await import('@/lib/prisma');
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.id as string },
                select: { fullName: true, role: true }
            });
            if (dbUser) {
                user = dbUser;
            }
        }
    }

    return (
        <header style={{
            height: '80px',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                {/* Logo Section */}
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#6366F1', // Indigo-500
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Handshake size={24} strokeWidth={2.5} />
                    </div>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#111827',
                        letterSpacing: '-0.02em'
                    }}>Dastiyor</span>
                </Link>

                {/* Center Navigation */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link href="/how-it-works" style={{
                        fontWeight: '500',
                        color: '#374151',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s',
                    }}>
                        Как это работает
                    </Link>
                    <Link href="/tasks" style={{
                        fontWeight: '500',
                        color: '#374151',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s',
                    }}>
                        Найти задания
                    </Link>
                    <Link href="/register?type=provider" style={{
                        fontWeight: '600',
                        color: '#4F46E5', // Indigo-600
                        fontSize: '0.95rem',
                        borderBottom: '2px solid #4F46E5',
                        paddingBottom: '2px'
                    }}>
                        Стать исполнителем
                    </Link>
                </nav>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/create-task" style={{
                        backgroundColor: '#6366F1', // Indigo-500
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        Создать задание
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <NotificationBell />
                            <UserMenu user={user} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href="/login" style={{
                                backgroundColor: '#F3F4F6',
                                color: '#111827',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                border: '1px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <LogIn size={18} />
                                Войти
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
