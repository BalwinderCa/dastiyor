import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Search,
    Bell,
    Settings
} from 'lucide-react';
import CustomerSidebarNav from './CustomerSidebarNav';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({
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
    if (!payload || !payload.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id as string }
    });

    if (!user || user.role !== 'CUSTOMER') {
        // If provider tries to access, redirect to provider dashboard
        if (user?.role === 'PROVIDER') {
            redirect('/provider');
        }
        redirect('/access-denied');
    }

    const accentColor = 'var(--primary)';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Left Sidebar - Light Theme */}
            <aside style={{
                width: '240px',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E2E8F0',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                overflowY: 'auto',
                zIndex: 50
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '32px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: accentColor,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LayoutDashboard size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1E293B' }}>Dastiyor</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Customer Portal</div>
                    </div>
                </Link>

                {/* Navigation */}
                <CustomerSidebarNav />
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
                {/* Top Header */}
                <header style={{
                    backgroundColor: 'white',
                    padding: '16px 32px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
                        {/* Search could be for finding services */}
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Find services..."
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#F8FAFC',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', padding: '8px' }}>
                            <Bell size={20} color="#64748B" />
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#EF4444',
                                borderRadius: '50%'
                            }} />
                        </button>
                        <Link href="/customer/profile" style={{ cursor: 'pointer', padding: '8px' }}>
                            <Settings size={20} color="#64748B" />
                        </Link>
                        <Link href="/customer/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1E293B' }}>
                                    {user.fullName}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                    Customer
                                </div>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: accentColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1rem'
                            }}>
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
