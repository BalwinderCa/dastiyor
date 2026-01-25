'use client';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Hero() {
    return (
        <section style={{
            position: 'relative',
            padding: '100px 0 140px',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)'
        }}>
            {/* Background Decorations */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                filter: 'blur(80px)',
                borderRadius: '50%',
                zIndex: -1
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div className="animate-fade-in" style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                    ✨ #1 Сервис Услуг в Таджикистане
                </div>

                <h1 className="heading-xl animate-fade-in" style={{
                    maxWidth: '900px',
                    margin: '0 auto 24px',
                    animationDelay: '0.1s'
                }}>
                    Найдите идеального <br />
                    <span style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>исполнителя для вашей задачи</span>
                </h1>

                <p className="animate-fade-in" style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-light)',
                    maxWidth: '600px',
                    margin: '0 auto 48px',
                    lineHeight: '1.6',
                    animationDelay: '0.2s'
                }}>
                    Свяжитесь с квалифицированными специалистами для ремонта, уборки, технической поддержки и многого другого. Нам доверяют тысячи жителей Душанбе.
                </p>

                {/* Search Bar */}
                <div className="animate-fade-in" style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: '720px',
                    margin: '0 auto 24px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    animationDelay: '0.3s'
                }}>
                    <div style={{ paddingLeft: '20px', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
                        <Search size={24} color="#9CA3AF" />
                    </div>
                    <input
                        type="text"
                        placeholder="С чем вам нужна помощь?"
                        style={{
                            flex: 1,
                            border: 'none',
                            padding: '16px 20px',
                            fontSize: '1.1rem',
                            outline: 'none',
                            color: '#1F2937',
                            backgroundColor: 'transparent'
                        }}
                    />
                    <Link href="/tasks" style={{
                        backgroundColor: '#6366F1', // Indigo-500 matching the image
                        color: 'white',
                        padding: '14px 40px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s'
                    }}>
                        Найти
                    </Link>
                </div>

                <div className="animate-fade-in" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    alignItems: 'center',
                    animationDelay: '0.4s',
                    color: '#6B7280',
                    fontSize: '0.95rem'
                }}>
                    <span style={{ fontWeight: '500' }}>Популярно:</span>
                    <Link href="/tasks?category=Cleaning" style={{ color: '#4B5563', textDecoration: 'underline', textUnderlineOffset: '4px', fontWeight: '500' }}>Уборка дома</Link>
                    <Link href="/tasks?category=Assembly" style={{ color: '#4B5563', textDecoration: 'underline', textUnderlineOffset: '4px', fontWeight: '500' }}>Сборка мебели</Link>
                    <Link href="/tasks?category=Delivery" style={{ color: '#4B5563', textDecoration: 'underline', textUnderlineOffset: '4px', fontWeight: '500' }}>Доставка товаров</Link>
                </div>


            </div>


        </section>
    );
}
