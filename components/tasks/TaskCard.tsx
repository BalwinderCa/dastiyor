import Link from 'next/link';
import { MapPin, Clock, MessageCircle, Zap } from 'lucide-react';

export type Task = {
    id: string;
    title: string;
    category: string;
    budget: string;
    city: string;
    postedAt: string;
    description: string;
    urgency?: string;
    responseCount?: number;
};

const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
    urgent: { label: 'Срочно', color: '#DC2626', bg: '#FEE2E2' },
    normal: { label: 'Обычная', color: '#059669', bg: '#D1FAE5' },
    low: { label: 'Гибкий', color: '#6B7280', bg: '#F3F4F6' }
};

export default function TaskCard({ task }: { task: Task }) {
    const urgency = urgencyConfig[task.urgency || 'normal'] || urgencyConfig.normal;
    const isNegotiable = task.budget === 'Договорная';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB',
            position: 'relative',
            transition: 'all 0.2s ease',
        }}>
            {/* Absolute link for entire card */}
            <Link href={`/tasks/${task.id}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '24px' }}>
                    {/* Category & Urgency badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#6366F1',
                            backgroundColor: '#EEF2FF',
                            padding: '4px 10px',
                            borderRadius: '20px',
                        }}>
                            {task.category}
                        </span>
                        {task.urgency === 'urgent' && (
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: urgency.color,
                                backgroundColor: urgency.bg,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Zap size={12} /> {urgency.label}
                            </span>
                        )}
                    </div>

                    <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                    }}>
                        {task.title}
                    </h3>
                    <p style={{
                        color: '#6B7280',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {task.description}
                    </p>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.85rem' }}>
                            <MapPin size={15} /> {task.city || 'Удалённо'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.85rem' }}>
                            <Clock size={15} /> {task.postedAt}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.85rem' }}>
                            <MessageCircle size={15} /> {task.responseCount ?? 0} откликов
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '130px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: isNegotiable ? '1.1rem' : '1.5rem',
                            fontWeight: '800',
                            color: '#111827'
                        }}>
                            {task.budget}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                            {isNegotiable ? '' : 'Фиксированная цена'}
                        </div>
                    </div>

                    <Link
                        href={`/tasks/${task.id}`}
                        style={{
                            backgroundColor: '#6366F1',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        Подробнее
                    </Link>
                </div>
            </div>
        </div>
    );
}
