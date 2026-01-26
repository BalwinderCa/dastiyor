'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    ClipboardList,
    MessageSquare,
    User,
    LogOut
} from 'lucide-react';

export default function CustomerSidebarNav() {
    const router = useRouter();
    const pathname = usePathname();
    const accentColor = 'var(--primary)';

    const navItems = [
        { href: '/customer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/customer/create-task', label: 'Create Task', icon: PlusCircle },
        { href: '/customer/my-tasks', label: 'My Tasks', icon: ClipboardList },
        { href: '/customer/messages', label: 'Messages', icon: MessageSquare },
        { href: '/customer/profile', label: 'Profile', icon: User },
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + '/');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.refresh();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: active ? accentColor : 'transparent',
                            color: active ? 'white' : '#475569',
                            textDecoration: 'none',
                            fontWeight: active ? '600' : '500',
                            fontSize: '0.9rem',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Icon size={18} />
                        {item.label}
                    </Link>
                );
            })}

            <button
                onClick={handleLogout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    marginTop: 'auto',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer',
                    justifyContent: 'flex-start'
                }}
            >
                <LogOut size={18} />
                Log Out
            </button>
        </nav>
    );
}
