'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, Zap, Heart, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

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
    status?: string;
    hasPremiumResponse?: boolean;
};

const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
    urgent: { label: 'Срочно', color: '#DC2626', bg: '#FEE2E2' },
    normal: { label: 'Обычная', color: '#059669', bg: '#D1FAE5' },
    low: { label: 'Гибкий', color: '#6B7280', bg: '#F3F4F6' }
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    'IN_PROGRESS': { label: 'В РАБОТЕ', bg: '#fff3e0', text: '#f57c00' },
    'COMPLETED': { label: 'ЗАВЕРШЕНО', bg: '#e3f2fd', text: '#1976d2' },
    'CANCELLED': { label: 'ОТМЕНЕНО', bg: '#ffebee', text: '#c62828' },
    'OPEN': { label: 'ОТКРЫТО', bg: '#e8f5e9', text: '#2e7d32' },
};

export default function TaskCard({ task }: { task: Task }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const urgency = urgencyConfig[task.urgency || 'normal'] || urgencyConfig.normal;
    const isNegotiable = task.budget === 'Договорная';
    const status = task.status || 'OPEN';
    const statusInfo = statusConfig[status] || statusConfig['OPEN'];
    const showPremium = task.hasPremiumResponse && status === 'OPEN';

    useEffect(() => {
        // Check if task is favorited
        fetch(`/api/tasks/favorite?taskId=${task.id}`)
            .then(res => res.json())
            .then(data => setIsFavorite(data.isFavorite || false))
            .catch(() => {});
    }, [task.id]);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        try {
            const res = await fetch('/api/tasks/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id })
            });
            const data = await res.json();
            setIsFavorite(data.isFavorite);
            toast.success(data.isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного');
        } catch (err) {
            toast.error('Ошибка при сохранении');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/tasks/${task.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: task.title,
                    text: task.description.substring(0, 100),
                    url: url
                });
                toast.success('Задание поделено');
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success('Ссылка скопирована в буфер обмена');
        }
    };

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
                {/* Left content */}
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
                    {task.description && task.description.trim() && task.description.toLowerCase() !== 'desc' && (
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
                    )}

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

                {/* Right column - Badges, action buttons, price */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end', 
                    gap: '12px', 
                    minWidth: '130px', 
                    position: 'relative', 
                    zIndex: 5 
                }}>
                    {/* Premium Badge - only for OPEN tasks with premium responses */}
                    {showPremium && (
                        <div style={{
                            backgroundColor: '#F59E0B',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            ⭐ Premium
                        </div>
                    )}

                    {/* Status Badge - for non-OPEN tasks */}
                    {status !== 'OPEN' && (
                        <div style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            whiteSpace: 'nowrap'
                        }}>
                            {statusInfo.label}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px'
                    }}>
                        <button
                            onClick={handleShare}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                e.currentTarget.style.borderColor = '#3B82F6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                            title="Поделиться"
                        >
                            <Share2 size={18} color="#6B7280" />
                        </button>
                        <button
                            onClick={handleFavorite}
                            disabled={isLoading}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: isLoading ? 0.6 : 1,
                                position: 'relative',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                                    e.currentTarget.style.borderColor = '#EF4444';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                }
                            }}
                            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                            <Heart 
                                size={18} 
                                color={isFavorite ? "#EF4444" : "#6B7280"} 
                                fill={isFavorite ? "#EF4444" : "none"} 
                            />
                        </button>
                    </div>

                    {/* Price section */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: isNegotiable ? '1.1rem' : '1.5rem',
                            fontWeight: '800',
                            color: '#111827',
                            lineHeight: '1.2',
                            whiteSpace: 'nowrap'
                        }}>
                            {task.budget}
                        </div>
                        {!isNegotiable && (
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px', whiteSpace: 'nowrap' }}>
                                Фиксированная цена
                            </div>
                        )}
                    </div>

                    {/* Details button */}
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
                            zIndex: 5
                        }}
                    >
                        Подробнее
                    </Link>
                </div>
            </div>
        </div>
    );
}
