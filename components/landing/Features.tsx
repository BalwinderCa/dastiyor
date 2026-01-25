'use client';
import { ShieldCheck, Lock, Headphones, CheckCircle, Shield, Zap } from 'lucide-react';

export default function Features() {
    return (
        <section style={{ padding: '100px 0', background: 'var(--white)' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

                    {/* Left Content */}
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>ПОЧЕМУ ВЫБИРАЮТ DASTIYOR</span>
                        <h2 className="heading-lg" style={{ margin: '16px 0 24px' }}>
                            Безопасно, Надежно и <br />
                            <span style={{ color: 'var(--primary)' }}>Просто</span>
                        </h2>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '40px' }}>
                            Мы проверяем каждого специалиста и гарантируем безопасность ваших платежей до полного завершения работы.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {features.map((feature, index) => (
                                <div key={index} style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        flexShrink: 0
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>{feature.title}</h4>
                                        <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image/Graphic area */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                            borderRadius: '30px',
                            padding: '40px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div className="glass-panel" style={{
                                padding: '24px',
                                marginBottom: '20px',
                                borderLeft: '4px solid #10B981',
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center'
                            }}>
                                <div style={{ background: '#D1FAE5', padding: '10px', borderRadius: '50%', color: '#10B981' }}><CheckCircle size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Проверенный Исполнитель</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>ID и навыки проверены</div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{
                                padding: '24px',
                                marginBottom: '20px',
                                borderLeft: '4px solid #3B82F6',
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                transform: 'translateX(20px)'
                            }}>
                                <div style={{ background: '#DBEAFE', padding: '10px', borderRadius: '50%', color: '#3B82F6' }}><Shield size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Безопасные Платежи</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Деньги в безопасности</div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{
                                padding: '24px',
                                borderLeft: '4px solid #F59E0B',
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center'
                            }}>
                                <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '50%', color: '#F59E0B' }}><Zap size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Быстрые Отклики</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Предложения за минуты</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const features = [
    {
        title: "Проверенные Исполнители",
        description: "Мы проверяем документы и отзывы, чтобы вы могли уверенно нанимать специалистов.",
        icon: <ShieldCheck size={28} />
    },
    {
        title: "Безопасные Платежи",
        description: "Средства надежно удерживаются и передаются только после вашего одобрения выполненной работы.",
        icon: <Lock size={28} />
    },
    {
        title: "Поддержка 24/7",
        description: "Наша команда поддержки всегда готова помочь решить любые вопросы.",
        icon: <Headphones size={28} />
    }
];
