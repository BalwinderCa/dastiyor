import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProfessionalsPage() {
    const professionals = await prisma.user.findMany({
        where: {
            role: 'PROVIDER'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="heading-lg" style={{ marginBottom: '16px' }}>Найти исполнителей</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
                        Свяжитесь с квалифицированными специалистами для ваших задач.
                    </p>
                </div>

                {professionals.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h3 className="heading-md" style={{ color: 'var(--text-light)' }}>Исполнители пока не найдены.</h3>
                        <p style={{ marginTop: '16px' }}>Станьте первым исполнителем!</p>
                        <Link href="/register" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
                            Зарегистрироваться как исполнитель
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {professionals.map((pro) => (
                            <div key={pro.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                                padding: '24px',
                                transition: 'transform 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e8f0fe',
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {pro.fullName[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '600', fontSize: '1.1rem' }}>{pro.fullName}</h3>
                                        <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                            Исполнитель
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '24px' }}>
                                    <span>В сервисе с {new Date(pro.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Душанбе</span>
                                </div>

                                <button className="btn btn-outline" style={{ width: '100%' }}>
                                    Профиль
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
