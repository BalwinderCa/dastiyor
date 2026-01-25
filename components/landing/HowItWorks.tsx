'use client';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { FileText, MessageSquare, Handshake } from 'lucide-react';

export default function HowItWorks() {
    return (
        <section style={{ padding: '100px 0', backgroundColor: 'var(--white)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span style={{
                        color: 'var(--primary)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.85rem'
                    }}>Простой Процесс</span>
                    <h2 className="heading-lg" style={{ marginTop: '12px' }}>Как работатет Dastiyor</h2>
                    <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '20px auto 0' }}>
                        Выполните свои задачи в три простых шага. Никаких скрытых комиссий.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '40px',
                    position: 'relative'
                }}>
                    {steps.map((step, index) => (
                        <div key={index} className="glass-panel" style={{
                            padding: '40px 30px',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'transform 0.3s ease',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${step.color}15 0%, ${step.color}30 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                margin: '0 auto 24px',
                                color: step.color
                            }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
                                {index + 1}. {step.title}
                            </h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Link href="/create-task" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        Создать задание бесплатно
                    </Link>
                </div>
            </div>
        </section>
    );
}

const steps = [
    {
        title: "Опишите задачу",
        description: "Скажите нам, что нужно сделать, когда и где. Это займет всего 2 минуты.",
        icon: <FileText size={40} />,
        color: "var(--primary)"
    },
    {
        title: "Получите предложения",
        description: "Получайте предложения от надежных специалистов. Сравнивайте цены и отзывы.",
        icon: <MessageSquare size={40} />,
        color: "#F59E0B"
    },
    {
        title: "Выберите лучшего",
        description: "Наймите специалиста, который подходит именно вам. Платите напрямую после выполнения работы.",
        icon: <Handshake size={40} />,
        color: "#10B981"
    }
];
