'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function AccessDeniedPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '500px'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    border: '4px solid #FECACA'
                }}>
                    <ShieldX size={56} color="#DC2626" />
                </div>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '16px',
                    color: '#991B1B'
                }}>
                    Доступ запрещён
                </h1>

                <p style={{
                    color: '#B91C1C',
                    fontSize: '1.1rem',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    У вас нет прав для доступа к этой странице. Если вы считаете, что это ошибка, свяжитесь с администратором.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#DC2626',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <Home size={18} />
                        На главную
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'white',
                            color: '#DC2626',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            border: '2px solid #DC2626',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Назад
                    </button>
                </div>

                <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #FECACA'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '12px', color: '#991B1B' }}>
                        Возможные причины:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        color: '#B91C1C',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0
                    }}>
                        <li style={{ padding: '8px 0', borderBottom: '1px solid #FEE2E2' }}>
                            🔐 Вы не авторизованы
                        </li>
                        <li style={{ padding: '8px 0', borderBottom: '1px solid #FEE2E2' }}>
                            👤 У вашей учётной записи недостаточно прав
                        </li>
                        <li style={{ padding: '8px 0' }}>
                            ⏰ Ваша сессия истекла
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
