import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, CreditCard, Settings, ShieldAlert, FolderTree } from 'lucide-react';

const menuItems = [
    { name: 'Обзор', href: '/admin', icon: LayoutDashboard },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Задания', href: '/admin/tasks', icon: FileText },
    { name: 'Категории', href: '/admin/categories', icon: FolderTree },
    { name: 'Подписки', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Модерация', href: '/admin/moderation', icon: ShieldAlert },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Админ панель</h1>
                </div>
                <nav style={{ flex: 1, padding: '24px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, gap: '8px', display: 'flex', flexDirection: 'column' }}>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.name}>
                                    <Link href={item.href} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#9ca3af',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        backgroundColor: 'transparent' // You can add logic for active state if needed
                                    }}>
                                        <Icon size={20} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div style={{ padding: '24px', borderTop: '1px solid #374151' }}>
                    <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                        ← Вернуться на сайт
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
